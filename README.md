# Afterglow

A cinematic streaming-discovery experience built with vanilla HTML, CSS, and JavaScript. Browse fictional series and films, filter by genre, and save a personal watchlist on your device.

> This independent front-end demo uses fictional titles and illustrative photography from Unsplash. It is not affiliated with any streaming service and does not stream video. The images are artwork only, not official posters for real films or series.

## Features

- Responsive, cinematic dark interface with locally bundled title artwork
- Home, Series, Films, and My List views
- Live search by title, genre, or description
- Genre filters and horizontally scrolling shelves
- Title details and keyboard-accessible dialog
- Persistent watchlist using browser local storage
- No dependencies or build step; artwork is bundled locally

## Run locally

JavaScript modules require a local web server. From the project root, run:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Project structure

```text
.
├── index.html
├── assets/
│   └── posters/
├── favicon.svg
└── src/
    ├── app.js
    ├── catalog.js
    └── styles.css
```

Edit `src/catalog.js` to change the fictional catalog. `src/app.js` and `src/styles.css` contain the application behavior and styling. Illustrative title images from [Unsplash](https://unsplash.com) are stored in `assets/posters/`.

## Deploy on GitHub Pages

1. Open **Settings → Pages** in the repository.
2. Choose **Deploy from a branch**.
3. Select the `main` branch and `/ (root)`, then save.
4. Wait for the Pages deployment; GitHub will show the live URL in the Pages settings.
