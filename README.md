<div align="center">

# ✦ Afterglow ✦
### `~/ cinematic-streaming-ui`

*A dark-themed, zero-dependency streaming discovery platform built on pure web fundamentals.*

<br/>

[![Live Demo](https://img.shields.io/badge/live-github_pages-10B981?style=flat-square&logo=github&logoColor=white)](https://vaibhavtevatia7946.github.io/afterglow-streaming-ui/)
[![Portfolio](https://img.shields.io/badge/creator-vaibhavtevatia-0ea5e9?style=flat-square&logo=safari&logoColor=white)](https://vaibhavtevatia.vercel.app/)
[![Design](https://img.shields.io/badge/design-dark%20cinematic-8B5CF6?style=flat-square)](#)
[![Dependencies](https://img.shields.io/badge/dependencies-0%20external-64748B?style=flat-square)](#)
[![License](https://img.shields.io/badge/license-MIT-slate?style=flat-square)](LICENSE)

<br/>

[**🎬 Open Live Experience**](https://vaibhavtevatia7946.github.io/afterglow-streaming-ui/) &nbsp;·&nbsp; [👨‍💻 Creator Portfolio](https://vaibhavtevatia.vercel.app/) &nbsp;·&nbsp; [Issues](https://github.com/vaibhavtevatia7946/afterglow-streaming-ui/issues)

</div>

---

## `~/ overview`

**Afterglow** is a front-end streaming-discovery interface engineered for movie and television enthusiasts. Built with a focus on fluid navigation and zero runtime bloat, it delivers real-time title search, dynamic category and genre filtering, comprehensive media detail modals, and persistent client-side watchlists.

> **Note:** Movie listings, ratings, and cover media are curated mock records for UI demonstration. The application runs entirely client-side with zero external streaming API dependencies.

---

## `~/ feature matrix`

| 🔍 Real-Time Title Search | 🏷️ Multi-Genre Filter Engine |
| :--- | :--- |
| Instant client-side search querying titles, directors, and keywords as you type without debounce delay. | Seamless category switching (Action, Sci-Fi, Drama, Thriller, Comedy) with fluid active state animations. |

| 🍿 In-Depth Title Modals | 🔖 Persistent Local Watchlist |
| :--- | :--- |
| Rich media overlays displaying IMDb ratings, release year, genre tags, cast listings, and plot synopses. | Add and remove titles from your personal watchlist. State synchronizes directly to `localStorage` with zero account creation. |

| 🌌 Dark Cinematic Glassmorphism | 📱 Responsive Media Grid |
| :--- | :--- |
| Modern dark aesthetic utilizing backdrop blur, neon accent highlights, and GPU-composited card hover zooms. | Adaptive CSS Grid and Flexbox layouts designed for seamless responsiveness from mobile devices to ultrawide monitors. |

---

## `~/ engineering & craft`

> *"Believes clean code and clean algorithms go hand in hand."*

- **Zero Framework Footprint:** Engineered purely using semantic HTML5, CSS3, and vanilla JavaScript (ES6+). Zero React/Vue runtime, zero compilation lag.
- **Unidirectional State Synchronization:** Filter queries and watchlist additions flow through a deterministic single-store pattern synced to `localStorage`.
- **GPU-Accelerated Compositing:** Poster hover scaling and modal entrances leverage `transform` and `opacity` properties to prevent costly browser reflows and guarantee steady 60fps frame rates.
- **Tokenized Theming:** Built on reusable CSS Custom Properties for typography scales, elevation layers, and glassmorphic blur filters.


