# md-checklist — agent instructions

Static multi-file web app with no dependencies and no build step; the only
deploy-time change is the GitHub Pages workflow stamping `js/version.js`. Read
`README.md` and `PRODUCT.md` before changing product behavior.

## Architecture

- `index.html` is the owner's local Gist library.
- `checklist.html#gist=<ID>` opens an editable checklist when the browser has
  the owner's token.
- `checklist.html#gist=<ID>&mode=read` is always read-only.
- `css/app.css` contains the shared visual system.
- `js/version.js` holds the build stamp; it stays `dev` in the repository and
  is overwritten by `.github/workflows/pages.yml` at deploy time.
- `js/storage.js` owns guarded `localStorage` access and library metadata.
- `js/gist.js` is the only GitHub API boundary.
- `js/markdown.js` owns the intentionally small Markdown grammar and escaping.
- `js/i18n.js` contains shared home-page strings and language state.
- `js/home.js` owns library creation, attachment, migration, and rendering.
- `js/checklist.js` owns checklist rendering, toggles, editing, and sync.

Classic scripts intentionally share `window.MdChecklist`. Do not convert them
to ES modules: module loading from `file://` is inconsistent across browsers.

## State

The Gist is the source of truth for checklist content and completion state.
`localStorage` contains only:

- `mdck!gist-token`: one owner token shared by the local library;
- `mdck!library`: local metadata (`id`, cached `title`, `addedAt`);
- `mdck!lang`: UI language.

The legacy `mdck!gist-id` key is migrated into `mdck!library` on home-page
startup and then removed. Never put the token in a Gist, URL, DOM, log, or
error. Shared links are always read-only.

## Invariants

- Must work from `file://`, Vercel, and GitHub Pages project paths.
- Storage can throw; every access goes through `app.store` with its memory
  fallback.
- Network failures never prevent interaction with already loaded Markdown.
- Gist data is validated before it replaces the current checklist.
- Tasks are real buttons with `aria-pressed`; keep focus-visible styles and
  reduced-motion handling.
- User-visible chrome is bilingual. Never translate user-authored Markdown.
- The Markdown grammar remains ATX headings, task items, plain bullets, inline
  code, bold, links, and two-space nesting.
- `escapeHtml()` must continue escaping both quote characters because link URLs
  are untrusted and interpolated into `href` attributes.

## Verification

Before merging, test:

1. empty home library;
2. token storage and Gist creation;
3. adding an existing Gist from an ID, Gist URL, and sharing URL;
4. legacy single-Gist migration;
5. owner editing, ticking, debounce, and manual save;
6. read-only controls and polling;
7. invalid Gist data and network failures;
8. storage-throws fallback;
9. `file://` relative navigation and GitHub Pages project paths.

When in doubt, the user's Markdown is sacred and remote replacement must be
validated first.
