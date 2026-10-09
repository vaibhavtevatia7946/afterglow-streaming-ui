# Afterglow

A cinematic streaming-discovery experience built with vanilla HTML, CSS, and JavaScript. Browse fictional series and films, filter by genre, and save a personal watchlist on your device.

> This independent front-end demo uses fictional titles and CSS-generated artwork. It is not affiliated with any streaming service and does not stream video.

## Features

- Responsive, cinematic dark interface with original poster art
- Home, Series, Films, and My List views
- Live search by title, genre, or description
- Genre filters and horizontally scrolling shelves
- Title details and keyboard-accessible dialog
- Persistent watchlist using browser local storage
- No dependencies, build step, or third-party assets

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
├── favicon.svg
└── src/
    ├── app.js
    ├── catalog.js
    └── styles.css
```

Edit `src/catalog.js` to change the fictional catalog. `src/app.js` and `src/styles.css` contain the application behavior and styling.

## Deploy on GitHub Pages

1. Open **Settings → Pages** in the repository.
2. Choose **Deploy from a branch**.
3. Select the `main` branch and `/ (root)`, then save.
4. Wait for the Pages deployment; GitHub will show the live URL in the Pages settings.
