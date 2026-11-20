<div align="center">

# ✦ Afterglow ✦
### A cinematic home for your next story

Browse a fictional film and series catalog, find a title by genre, and keep a personal watchlist that follows your account.

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-43853D?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-111?style=flat-square&logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-persistent%20storage-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[**Open the static preview**](https://vaibhavtevatia7946.github.io/afterglow-streaming-ui/) · [Portfolio](https://vaibhavtevatia.vercel.app/) · [Issues](https://github.com/vaibhavtevatia7946/afterglow-streaming-ui/issues)

</div>

---

## What it does

- Browse curated film and series shelves with title search and genre filters.
- Open accessible title details and keep a personal watchlist.
- Create an account or sign in to sync saved titles across devices.
- Store account passwords as bcrypt hashes and sessions/watchlists in SQLite.
- Use the responsive static preview without an account; account features require the Node server.

The catalog is illustrative and the titles are fictional. Afterglow does not stream video or use a third-party movie API yet.

## Run locally

Requirements: Node.js 20 or newer and npm.

```sh
git clone https://github.com/vaibhavtevatia7946/afterglow-streaming-ui.git
cd afterglow-streaming-ui
npm ci
cp .env.example .env
```

Set `SESSION_SECRET` in `.env` to a private random value at least 32 characters long, then start the server:

```sh
npm start
```

Open [http://localhost:3000](http://localhost:3000). SQLite creates `data/afterglow.sqlite` on first start. To develop with automatic restarts, use `npm run dev`.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Set to `production` behind HTTPS to enable secure cookies |
| `SESSION_SECRET` | Local-only fallback | Signs session cookies; set a unique secret of at least 32 characters |
| `SQLITE_PATH` | `./data/afterglow.sqlite` | Location of the persistent SQLite database |

Do not commit `.env` or the SQLite database. The example Render blueprint in `render.yaml` configures a persistent disk and a generated session secret. If you deploy somewhere else, attach persistent storage and set `SQLITE_PATH`; ephemeral filesystems will lose accounts and watchlists when the instance restarts.

## API

All endpoints are same-origin and return JSON.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/titles` | Curated catalog |
| `GET` | `/api/session` | Current account and saved titles, if signed in |
| `POST` | `/api/register` | Create an account (`email`, `password`) |
| `POST` | `/api/login` | Sign in (`email`, `password`) |
| `POST` | `/api/logout` | End the current session |
| `GET` | `/api/watchlist` | Read the signed-in user's list |
| `PUT` | `/api/watchlist` | Replace it with `{ "watchlist": ["title"] }` |

## Project structure

```text
assets/posters/   Curated local artwork
src/app.js        Browser UI, filters, dialogs, and account sync
src/catalog.js    Fictional catalog data served by the API
src/styles.css    Responsive dark cinematic theme
server.js         Express API, account sessions, and SQLite persistence
render.yaml       Example persistent-disk deployment configuration
```
