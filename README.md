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
.nojekyll                     serve files as-is, including dot-directories
apple-app-site-association    ⚠️ deep-link config — see below
.well-known/
  apple-app-site-association  ⚠️ same, at the standard path
```

## Two things worth knowing before editing

**The `apple-app-site-association` files are not part of the site.** They are
Apple universal-link configuration served from this domain, and they are live.
Deleting, renaming, or reformatting either one breaks deep links for the apps
that point here. Leave them alone unless that is the change you mean to make.

**`.nojekyll` matters.** Without it GitHub Pages runs Jekyll, which skips
directories beginning with a dot — which meant `/.well-known/` returned 404.
The file keeps that path reachable and skips a build step nothing here needs.

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
