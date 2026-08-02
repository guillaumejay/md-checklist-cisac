# Checklist — agent notes

Single-file HTML app: `checklist.html`. Background, motivation, design
language, and known limitations live in [`README.md`](./README.md) — read
that first if you need context on *why*. This file is operational: what not
to break, and where things live.

## State

Two stores, different jobs — do not conflate them.

- `localStorage` (via the `store` wrapper) is primary, written on every
  toggle.
- The URL fragment (`#c=...`) is derived / export-only, rewritten on every
  toggle so the address bar always holds a correct link. **Never make the URL
  the primary store** — an earlier version did, and reopening a stale link
  silently wiped current progress.

### Encoding
`#c=` + base64url of the full Markdown source, checkbox marks included
(`pack`/`unpack`). One representation for content and progress — no separate
state object to drift out of sync. Fragment, not query string, so nothing
leaks into server logs. `toggle()` is a regex substitution on one line of
`lines`.

### Identity (`fingerprint`)
FNV-1a over heading/task text with `[ ]`/`[x]` stripped → base36, used as the
`localStorage` key. Same checklist at any completion stage maps to the same
key; editing wording creates a new entry (deliberate).

### Conflict handling (`arrive`)
Exactly three cases: nothing stored → load the link. Stored + identical →
load, no prompt. Stored + different → **never overwrite**; show the banner
(`askConflict`) and let the user choose. This is the branch a refactor is
most likely to break silently — test all three before merging changes near
`arrive` / `load` / `persist`.

## Code layout

| Section | What lives there |
| --- | --- |
| `DEFAULT` | Seed checklist shown on a fresh install |
| `store` | `localStorage` wrapper with in-memory fallback |
| `STR` / `t` / `applyLang` | UI string dictionary, lookup, re-render on language switch |
| `pack` / `unpack` | base64url ↔ UTF-8 |
| `RE_TASK` / `RE_HEAD` / `RE_NOTE` | The entire Markdown grammar |
| `fingerprint` | Identity hash, marker-insensitive |
| `stats` | Counts and title, for the gauge and the library |
| `render` | Source array → DOM, recomputed wholesale (not patched) |
| `toggle` | Regex substitution on one source line |
| `renderLib` | Stored-checklist browser |
| `arrive` | Incoming-link routing and conflict detection |

`lines` (Markdown source split on `\n`) is the single source of truth;
everything else is derived.

## Constraints

- **Single file, zero dependencies, no build.** No CDN, no fetch, no npm.
- **Must work from `file://`.** Do not use `location.origin` — it is the
  string `"null"` for `file://` pages in Firefox. Use `location.href` and
  strip the hash instead.
- **Storage can throw.** Every access goes through `store`, wrapped in
  `try`/`catch`, with an in-memory `Map` fallback.
- **Accessibility.** Tasks are real `<button>` elements with `aria-pressed`.
  Keep focus-visible styles and `prefers-reduced-motion` handling intact.
- **Bilingual UI (FR/EN), English code.** All user-visible strings go through
  `STR` / `t()`. Only UI chrome is translated — never translate Markdown
  content the user wrote, including `DEFAULT`.
- **Markdown grammar is intentionally tiny** (ATX headings, task items, plain
  bullets, inline `code` / `**bold**` / links, 2-space nesting) — three
  regexes. Do not reach for a Markdown library; add one regex if something is
  genuinely missing.
- **`inline()` escapes before formatting, and `esc()` must escape quotes too**
  (not just `&`/`<`/`>`) — link URLs are untrusted (can arrive via a forwarded
  link) and are interpolated straight into `href="..."`. Breaking this
  reopens an XSS.

## Working on this

Test all three `arrive()` cases explicitly (see "Conflict handling") — that's
the branch that costs the user real progress when it breaks. Also test the
storage-throws fallback path, not just the normal one.

When in doubt: the user's typed text is sacred, the derived state is
disposable, and the file stays a file.
