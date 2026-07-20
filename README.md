# Financial Accounting — course app

A premium, mobile-first Financial Accounting course that behaves like an accounting
professor: lectures, interactive illustrations, and an Application Lab with
real-software-style tools. The **entire app is one self-contained file — `index.html`**
(inline CSS + markup + one vanilla-JS module, no external assets, no network). It runs
offline and ships to three surfaces from that same file.

## Surfaces

1. **Web / PWA** — `index.html` served over HTTP(S). It's fully PWA-decorated
   (`manifest.webmanifest`, icons, `sw.js`) and **installable + offline** once the
   service worker registers.
2. **Mobile (Expo WebView)** — `mobile/` wraps the same HTML in a React Native
   WebView. `mobile/scripts/sync-html.js` embeds `index.html` into the app bundle
   (`npm run sync-html`, run automatically by `prestart`).
3. **Artifact** — the page content is published as a claude.ai Artifact for quick
   in-chat preview.

## Run it locally

```bash
npm run serve          # serves the folder at http://localhost:3000 (via npx serve)
# or, no install needed:
npm run serve:python   # http://localhost:8080
```

Open the served URL (not `file://`) so the service worker and `localStorage` work.

## Deploy the web version (GitHub Pages)

Deployment is automated by `.github/workflows/deploy-pages.yml`: every push to `main`
(or the active feature branch) assembles `index.html` + `manifest.webmanifest` +
`sw.js` + `icons/` and publishes them to GitHub Pages.

**One-time setup:** in the repo, go to **Settings → Pages → Build and deployment →
Source = "GitHub Actions"**. After the next push, the workflow publishes the site and
prints its URL in the Actions run summary.

## Project layout

```
index.html              # the whole app (self-contained)
manifest.webmanifest    # PWA manifest (relative paths)
sw.js                   # service worker (precache + stale-while-revalidate)
icons/                  # PWA + apple-touch icons
.github/workflows/      # GitHub Pages deploy
mobile/                 # Expo React Native WebView wrapper
```

## Constraints (please preserve)

- **Self-contained:** no external scripts, styles, fonts, or network calls — this is
  what lets the same file run as a web page, inside the WebView, and as an Artifact.
- Relative asset paths only, so it works from any subpath (e.g. a Pages project URL).
