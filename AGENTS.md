# Working in this repository

- Read `README.md` and `package.json` first. Start with the relevant source file; avoid scanning binary assets or generated HTML for editable code.
- Source of truth: `src/` for page content, data, templates, CSS and JavaScript; `public/` for original assets. `docs/` is entirely generated. Never fix generated HTML/CSS/JS directly.
- Generic routes live in `src/data/pages.json` and `src/pages/`. Structured product pages use `src/data/products.js` and `src/templates/productPage.js`. Shared navigation and metadata belong in `src/templates/layout.js`.
- Keep product data plain text and preserve escaping at rendering boundaries. Page-body HTML is trusted code reviewed in Git. Do not introduce raw CMS/user HTML without an explicit sanitization design.
- Use Node 22.18+ (22.x), `npm ci`, then `npm run dev`. Windows PowerShell can use `npm.cmd`. Dev serves only generated `docs/` at `127.0.0.1:5173`; rebuild after edits.
- Before delivery: `npm run format`, `npm run check`, `npm run check:generated`. Commit source and regenerated output together. Report any failed or unperformed checks explicitly.
- For UI changes, inspect desktop and mobile rendering and exercise the affected controls. Avoid unrelated design/content changes during infrastructure work.
- Preserve the English routes and existing public asset URLs. Originals belong in `public/assets/`; WebP derivatives and intrinsic dimensions are produced by the build. Keep sequences lazy/on-demand.
- News, Gallery and contact/distributor routes are still preview content. Do not imply that CMS, forms, integrations or production hosting are implemented.
- Keep local tool/worktree configuration and credentials out of Git. Do not use legacy ignored preview/extraction folders as inputs.
- Prefer small focused modules and meaningful checks. Do not add a framework, runtime backend or CMS just to reorganize this static preview.
- Separate local validation, commit, push, PR, merge and deployment in status reports. A successful local build does not prove production delivery.
