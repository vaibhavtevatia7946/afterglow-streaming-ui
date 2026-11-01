import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import express from "express";
import { titles } from "./src/catalog.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 3000);
const sessionSecret = process.env.SESSION_SECRET || (isProduction ? "" : "local-development-secret-change-me");
const databasePath = path.resolve(process.env.SQLITE_PATH || path.join(__dirname, "data", "afterglow.sqlite"));

if (sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 characters.");
}
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS watchlist (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, title)
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
`);

const findUserByEmail = db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?");
const findUserById = db.prepare("SELECT id, email FROM users WHERE id = ?");
const createUser = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
const saveSession = db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)");
const findSession = db.prepare("SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?");
const deleteSession = db.prepare("DELETE FROM sessions WHERE token_hash = ?");
const listWatchlist = db.prepare("SELECT title FROM watchlist WHERE user_id = ? ORDER BY added_at DESC, title ASC");
const addWatchTitle = db.prepare("INSERT OR IGNORE INTO watchlist (user_id, title) VALUES (?, ?)");
const removeWatchTitle = db.prepare("DELETE FROM watchlist WHERE user_id = ? AND title = ?");
const replaceWatchlist = db.transaction((userId, watchlist) => {
  db.prepare("DELETE FROM watchlist WHERE user_id = ?").run(userId);
  for (const title of watchlist) addWatchTitle.run(userId, title);
});

const knownTitles = new Set(titles.map(item => item.title));
const cookieName = "afterglow.sid";
const sessionLifetime = 30 * 24 * 60 * 60 * 1000;
const authAttempts = new Map();

function signToken(token) {
  return crypto.createHmac("sha256", sessionSecret).update(token).digest("base64url");
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getCookie(request, name) {
  const cookieHeader = request.headers.cookie || "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) {
      try { return decodeURIComponent(value.join("=")); } catch { return ""; }
    }
  }
  return "";
}

function setSessionCookie(response, token) {
  const cookie = `${cookieName}=${encodeURIComponent(`${token}.${signToken(token)}`)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionLifetime / 1000}${isProduction ? "; Secure" : ""}`;
  response.setHeader("Set-Cookie", cookie);
}

function clearSessionCookie(response) {
  response.setHeader("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isProduction ? "; Secure" : ""}`);
}

function rateLimitAuth(request, response, next) {
  const now = Date.now();
  const ip = request.ip || request.socket.remoteAddress || "unknown";
  const recent = (authAttempts.get(ip) || []).filter(time => now - time < 10 * 60 * 1000);
  if (recent.length >= 20) return response.status(429).json({ error: "Too many attempts. Please wait a few minutes and try again." });
  recent.push(now);
  authAttempts.set(ip, recent);
  next();
}

app.disable("x-powered-by");
app.set("trust proxy", isProduction ? 1 : false);
app.use(express.json({ limit: "32kb" }));
app.use((request, response, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.get("origin");
    if (origin && origin !== `${request.protocol}://${request.get("host")}`) {
      return response.status(403).json({ error: "Cross-site requests are not allowed." });
    }
  }
  const signedCookie = getCookie(request, cookieName);
  const [token, signature] = signedCookie.split(".");
  if (token && signature && safeEqual(signToken(token), signature)) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = findSession.get(tokenHash, Date.now());
    if (session) {
      request.sessionTokenHash = tokenHash;
      request.user = findUserById.get(session.user_id) || null;
    }
  }
  next();
});

function requireUser(request, response, next) {
  if (!request.user) return response.status(401).json({ error: "Sign in to sync your watchlist." });
  next();
}

function normalizedEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validateCredentials(email, password) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return "Enter a valid email address.";
  if (typeof password !== "string" || password.length < 10 || Buffer.byteLength(password, "utf8") > 72) return "Password must contain at least 10 characters and no more than 72 bytes.";
  return "";
}

function issueSession(response, user) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const now = Date.now();
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  saveSession.run(tokenHash, user.id, now + sessionLifetime);
  setSessionCookie(response, token);
}

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
app.get("/api/titles", (_request, response) => response.json({ titles }));

app.get("/api/session", (request, response) => {
  if (!request.user) return response.json({ user: null, watchlist: [] });
  const watchlist = listWatchlist.all(request.user.id).map(row => row.title);
  response.json({ user: { id: request.user.id, email: request.user.email }, watchlist });
});

app.post("/api/register", rateLimitAuth, async (request, response, next) => {
  try {
    const email = normalizedEmail(request.body?.email);
    const password = request.body?.password;
    const validation = validateCredentials(email, password);
    if (validation) return response.status(400).json({ error: validation });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = createUser.run(email, passwordHash);
    const user = { id: Number(result.lastInsertRowid), email };
    issueSession(response, user);
    response.status(201).json({ user });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") return response.status(409).json({ error: "An account with that email already exists." });
    next(error);
  }
});

app.post("/api/login", rateLimitAuth, async (request, response, next) => {
  try {
    const email = normalizedEmail(request.body?.email);
    const password = request.body?.password;
    if (!email || typeof password !== "string" || Buffer.byteLength(password, "utf8") > 72) return response.status(400).json({ error: "Enter your email and password." });
    const user = findUserByEmail.get(email);
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!valid) return response.status(401).json({ error: "Email or password is incorrect." });
    issueSession(response, user);
    response.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
});

app.post("/api/logout", (request, response) => {
  if (request.sessionTokenHash) deleteSession.run(request.sessionTokenHash);
  clearSessionCookie(response);
  response.status(204).end();
});

app.get("/api/watchlist", requireUser, (request, response) => {
  response.json({ watchlist: listWatchlist.all(request.user.id).map(row => row.title) });
});

app.put("/api/watchlist", requireUser, (request, response) => {
  const proposed = request.body?.watchlist;
  if (!Array.isArray(proposed) || proposed.length > knownTitles.size || proposed.some(title => typeof title !== "string" || !knownTitles.has(title))) {
    return response.status(400).json({ error: "The watchlist contains an invalid title." });
  }
  const watchlist = [...new Set(proposed)];
  replaceWatchlist(request.user.id, watchlist);
  response.json({ watchlist });
});

app.use(express.static(__dirname, { extensions: ["html"], index: "index.html", maxAge: isProduction ? "1h" : 0 }));
app.use((error, _request, response, _next) => {
  console.error(error);
  if (response.headersSent) return;
  response.status(error.status || 500).json({ error: "Something went wrong. Please try again." });
});

const server = app.listen(port, () => console.log(`Afterglow is listening on http://localhost:${port}`));
function shutDown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
