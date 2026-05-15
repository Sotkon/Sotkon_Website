# Sotkon Website Preview

Static preview and GitHub Pages output for the Sotkon redesign.

## Workflow

`src/` is the source of truth for the shared product-page platform.

- `src/data/products.js` stores product content, image references, specs, brochure links, and 360 sequence paths.
- `src/templates/` renders reusable HTML layouts.
- `src/static/` stores shared CSS, browser JavaScript, and the local preview server.
- `docs/` is the GitHub Pages output.
- `sotkon_redesign/` is the local preview output served by the dev server.

Build generated product pages and shared static files:

```bash
npm run build
```

Run locally:

```bash
npm run dev
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```powershell
npm.cmd run build
npm.cmd run dev
```

## Asset Contract

Current public asset paths are preserved under `docs/assets/` and `sotkon_redesign/assets/` so existing pages do not break. Product ownership is declared in `src/data/products.js`; when the remaining product pages are migrated, assets can be physically grouped by product in a follow-up migration.
