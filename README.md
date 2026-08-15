# 1ucas.github.io

My personal page — [1ucas.github.io](https://1ucas.github.io)

A single static page: no framework, no build step. Served straight from `master`
by GitHub Pages.

## What's here

```
index.html                    the page
404.html                      not-found page
assets/
  styles.css                  design tokens + layout
  main.js                     theme switch, EN/PT-BR switch, contribution chart
  avatar.png                  portrait
  horizon.webp                sunset band behind the contact section
  og.png                      social share card (1200×630)
  favicon.svg
robots.txt, sitemap.xml
.nojekyll                     serve the files as-is, no Jekyll build
```

`.nojekyll` tells GitHub Pages to publish the directory exactly as committed
instead of running it through Jekyll. Nothing here needs a build step, and files
are served under the names they have in the repo.

## Design notes

Deep slate with a sunset amber accent. Dark by default, light on request,
following the system preference until the visitor picks a side; the choice
sticks in `localStorage`. The theme is resolved by a small inline script in
`<head>` so there is no flash on load, and the palette is also mirrored under
`prefers-color-scheme` so the page still themes correctly with JS disabled.

Every visible string is bilingual. English lives in the markup, Portuguese in a
`data-pt` attribute on the same element, and `main.js` swaps between them — the
same approach used in [ai-studies](https://github.com/1ucas/ai-studies). Adding
copy means writing both, on one line, or it silently stays English.

Colours are CSS custom properties defined once at the top of `styles.css`. The
contribution squares derive their five steps from `--accent` with `color-mix`,
so re-theming the accent re-themes the chart for free.

`horizon.webp` was generated locally with Stable Diffusion Turbo — an
open-weights model, run on CPU, prompted for a flat-vector desert sunset. It is
decorative only.

## The stats section

The tiles are hand-counted from public repositories: 49 own repos (forks
excluded), 32 stars, first repo in 2016.

The contribution chart reads a year of daily levels baked into
`data-levels` / `data-counts` on `#chart-grid`, so it paints instantly, works
offline, and never depends on a third party to render. After painting, it asks
[github-contributions-api](https://github-contributions-api.jogruber.de) for
fresh numbers and redraws if it answers. If that request fails, the snapshot
simply stands — nothing breaks, the figures just age.

To re-bake the snapshot:

```bash
curl -s "https://github-contributions-api.jogruber.de/v4/1ucas?y=last" \
  | python3 -c "import json,sys; d=json.load(sys.stdin)['contributions']; \
print('start', d[0]['date']); \
print('levels', ''.join(str(x['level']) for x in d)); \
print('counts', ','.join(str(x['count']) for x in d))"
```

Then paste the three values into `data-start`, `data-levels` and `data-counts`.

## Running it locally

No toolchain. Open `index.html` in a browser, or serve the folder if you want
absolute paths (`/assets/...` in `404.html`) to resolve the same way they do in
production:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.
