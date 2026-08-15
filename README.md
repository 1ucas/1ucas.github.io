# 1ucas.github.io

My personal page — [1ucas.github.io](https://1ucas.github.io)

A single static page: no framework, no build step, no external requests. It loads
three files and an image, and that is the whole site. Served straight from
`master` by GitHub Pages.

## What's here

```
index.html                    the page
404.html                      not-found page
assets/
  styles.css                  design tokens + layout
  main.js                     theme switch, EN/PT-BR switch
  avatar.png                  portrait
  og.png                      social share card (1200×630)
  favicon.svg
robots.txt, sitemap.xml
.nojekyll                     serve the files as-is, no Jekyll build
```

`.nojekyll` tells GitHub Pages to publish the directory exactly as committed
instead of running it through Jekyll. Nothing here needs a build step, and it
means files and directories are served under the names they have in the repo —
including any beginning with a dot, which Jekyll would otherwise skip.

## Design notes

Dark by default, light on request, following the system preference until the
visitor picks a side; the choice sticks in `localStorage`. The theme is resolved
by a small inline script in `<head>` so there is no flash on load.

Every visible string is bilingual. English lives in the markup, Portuguese in a
`data-pt` attribute on the same element, and `main.js` swaps between them —
the same approach used in
[ai-studies](https://github.com/1ucas/ai-studies). Adding copy means writing
both, on one line, or it silently stays English.

Colours are CSS custom properties defined once at the top of `styles.css`:
a deep slate ground with a sunset amber accent, in a nod to Mobile West.

## Running it locally

No toolchain. Open `index.html` in a browser, or serve the folder if you want
absolute paths (`/assets/...` in `404.html`) to resolve the same way they do in
production:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.
