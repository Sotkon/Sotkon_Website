# Sotkon website preview

Static, English-language preview with 20 routes. Node.js 22.18+ (22.x) builds the complete site; no Node server or npm dependencies are deployed to GitHub Pages.

## Start from a clean checkout

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. `dev` builds first and serves `docs/` on loopback only. Run `npm run build` after source edits and refresh the browser (there is no watch mode). Use `npm.cmd` in Windows PowerShell if execution policy blocks `npm.ps1`. `PORT` overrides the preview port.

## Edit the sources

| Location               | Purpose                                                     |
| ---------------------- | ----------------------------------------------------------- |
| `src/pages/`           | Editable main content for 17 pages, including the homepage  |
| `src/data/pages.json`  | Routes, titles and descriptions for those pages             |
| `src/data/products.js` | Plain-text data for Koncept, Evos and Apto                  |
| `src/templates/`       | Shared navigation, footer and product markup; text escaping |
| `src/static/`          | Browser CSS/JS and the local preview server                 |
| `public/assets/`       | Original images, brochures and animation frames             |
| `src/build/`           | Site generation and derived WebP images                     |
| `scripts/`, `test/`    | Validation, generated-output checks and regression tests    |
| `docs/`                | Generated GitHub Pages output; never edit directly          |

Every page uses the same header/footer. Page-body HTML in `src/pages/` is trusted repository code; product strings are escaped by the renderer. Add generic pages through both the route manifest and a body file. Add structured product pages through the product data file. Asset paths remain compatible with the existing public URLs.

## Required checks

```sh
npm run format
npm run check
npm run check:generated
```

`check` runs ESLint, builds the site, validates local URLs/anchors/images/animation frames and runs tests. Tests cover a clean, deterministic build, HTML escaping and the local server's path boundary. `check:generated` compares `docs/` with an independent clean build, including missing, changed and obsolete files. When removing a route or asset, remove its old generated file as well; the build never recursively deletes the output folder.

Commit source changes and rebuilt `docs/` together. The PR workflow checks formatting, generated output and tests before merge. GitHub Pages continues to publish the `main` branch's `/docs` directory. These checks do not publish or merge anything.

## Images and interactive components

The build reads image dimensions, writes width/height attributes, defers below-the-fold images and creates WebP alternatives for large images when smaller. Original assets and the 101-frame sequences are retained. The first image after the shared logo is treated as the hero; keep hero images first in each body. Animation plays only on demand and stops when hidden or outside the viewport. Tabs and the viewer support keyboard navigation.

## Current product scope

This remains a preview: News, Gallery and distributor/contact pages contain migration placeholders. There is no CMS, search, inquiry submission, authentication or backend. Turning these into production features requires separate requirements and real content. The development server is local-only; its headers are not configuration for GitHub Pages or a future production host.

Before changing visual components, check desktop and narrow mobile widths, navigation, tabs, galleries and the 360 viewer. Record what was actually tested in the PR. Build checks do not substitute for visual review or deployment verification.
