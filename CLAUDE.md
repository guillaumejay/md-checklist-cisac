# Checklist — project brief

A single-file HTML checklist. You write Markdown, you tick boxes, and the state
follows you around without an account, a server, or a build step.

The whole thing is one `.html` file with inline CSS and JS. No dependencies, no
bundler, no npm. It runs from `file://`, from a USB stick, or from any static
host. That constraint is the point of the project, not an accident — see
"Constraints" below before proposing anything that breaks it.

---

## Why this exists

The original need was mundane: a repeatable troubleshooting checklist for
home-network gear (UniFi access points), run once every few months, where the
list itself changes as you learn things. Every existing option was wrong in the
same way — either it wanted an account and a subscription for a list of twelve
lines, or it was a static Markdown file where the checkboxes don't actually
check.

So the target is narrow and worth stating plainly:

- The list is **authored as Markdown**, because that's how it gets pasted into
  notes, wikis, and commit messages afterwards.
- The list is **runnable**, meaning ticking a box is a real interaction that
  survives a page reload.
- A run can be **handed to someone else, or to your future self**, as a plain
  link with no infrastructure behind it.
- Nothing leaves the machine.

Non-goals, equally important: no collaboration, no real-time sync, no reminders,
no due dates, no mobile app, no user accounts. If a feature request implies a
server, it belongs to a different project.

---

## How state works

There are two places state can live, and they do different jobs. Confusing them
is the main way to get this codebase wrong.

**`localStorage` is the memory.** It is written on every tick. It is what makes
the page survive a reload or a browser restart. This is the primary store.

**The URL fragment is the export.** It is rewritten on every tick too, but only
so that copying the address bar or the export field always yields a correct,
current link. It is for archiving a completed run, mailing a link to a colleague,
or bootstrapping a checklist on another machine.

An earlier iteration used the URL as the *only* store. It was elegant and it was
wrong: a bookmark captures the state at the instant you saved it and then goes
stale forever, which is exactly the opposite of what a checklist needs. The URL
was kept because it turned out to be a genuinely good export format — just
demoted from primary to secondary.

### The encoding

The fragment carries the entire Markdown source, checkbox marks included, as
base64url:

```
#c=IyBEw6lwYW5uYWdlIEFQIFVuaUZpCgotIFt4XSDigKY
```

Two deliberate choices here.

**The payload is the source itself, not a diff or a bitmask.** The state of a
checklist *is* the difference between `- [ ]` and `- [x]` in the text. Storing
the source means one representation for both content and progress, and it means
a link is self-contained — the recipient needs nothing they don't already have
in the URL. Toggling an item is a regex substitution on one line of the source
array; there is no separate state object to keep in sync, and therefore no way
for the two to drift apart.

**It's the fragment (`#`), not a query parameter (`?`).** Anything after `#` is
never transmitted to the server, so a checklist that mentions internal hostnames
or client names doesn't end up in someone's access logs. It also sidesteps
server-side URL length limits. Cost of the encoding is roughly 1.35 URL
characters per source character; a forty-line checklist lands near 900
characters, which is comfortably within every browser's limit.

### Identity: how two versions of "the same list" are recognised

A fingerprint is computed from the task and heading **text only**, with the
`[ ]` / `[x]` markers stripped, then FNV-1a hashed to base36. That hash is the
`localStorage` key.

The consequence is the useful part: the same checklist at different stages of
completion resolves to the same key, so opening an old link finds the local
progress rather than creating a duplicate. A genuinely different checklist gets
its own key and opens alongside without disturbing anything, which is what makes
multiple checklists in one file work at all.

### Conflict handling

When an incoming link's fingerprint matches something already stored and the
contents differ, **nothing is overwritten**. The local version stays on screen
and a banner offers both, labelled with each side's completion count. The user
picks.

Silently taking the link would be a data-loss bug wearing the costume of a
feature: reopening a two-week-old link from your mail would wipe this morning's
progress with no warning and no undo. The three cases are: nothing stored →
load the link; stored and identical → load, no prompt; stored and different →
ask. Preserve this behaviour.

---

## Code layout

One file, read top to bottom:

| Section | What lives there |
| --- | --- |
| `DEFAULT` | Seed checklist shown on a fresh install |
| `store` | `localStorage` wrapper with an in-memory fallback |
| `pack` / `unpack` | base64url ↔ UTF-8 |
| `RE_TASK` / `RE_HEAD` / `RE_NOTE` | The entire Markdown grammar |
| `fingerprint` | Identity hash, marker-insensitive |
| `stats` | Counts and title, for the gauge and the library |
| `render` | Source array → DOM, recomputed wholesale |
| `toggle` | Regex substitution on one source line |
| `renderLib` | Stored-checklist browser |
| `arrive` | Incoming-link routing and conflict detection |

`lines` — the Markdown source split on newlines — is the single source of
truth. Everything else is derived. `render()` rebuilds the list from scratch
rather than patching it; at these sizes the cost is invisible and it removes a
whole category of stale-DOM bugs.

The Markdown subset is intentionally tiny: ATX headings, task list items, plain
bullets as annotations, and inline `code`, `**bold**`, and links. Two-space
indentation nests a task one level. That's the whole grammar and it fits in
three regexes. **Do not reach for a Markdown library.** Table and image support
would mean a parser, a dependency, and a sanitiser, in exchange for features a
checklist doesn't use. If something genuinely needs adding — nested numbered
lists, say — add one regex.

Inline rendering escapes HTML before applying formatting. Keep that ordering.
Content arrives from URLs that may have been forwarded by third parties, so it
is untrusted input.

---

## Constraints

**Single file, zero dependencies, no build.** You should be able to email the
file to someone and have them use it.

**Works offline and from `file://`.** No CDN links, no web fonts, no fetch calls.

**Storage failures degrade, never crash.** `localStorage` throws in sandboxed
iframes and in some private-browsing modes. The `store` wrapper falls back to an
in-memory `Map` and the UI states plainly that progress won't survive the tab.
Every storage access is inside a `try`.

**Accessibility floor.** Tasks are real `<button>` elements with
`aria-pressed`, so keyboard and screen-reader behaviour comes for free. Focus is
visible. `prefers-reduced-motion` disables transitions. Layout works down to
mobile widths. Don't regress these while adding features.

**French UI, English code.** All user-visible strings are French. Identifiers,
comments, and this document are English.

---

## Design language

Utility-instrument, not productivity-app. Cool paper grey, ink navy, a single
petrol-teal accent used only for completion and focus. Monospace for anything
metadata-like — counts, labels, buttons, the export link — and the system sans
for task text, because the tasks are prose and everything around them is
instrumentation.

Top-level tasks are numbered. That's justified here specifically because these
lists are usually ordered procedures where "step 3" is a thing you say out loud;
nested sub-items are unnumbered since they're clarifications rather than steps.
If the project ever grows unordered checklists, the numbering should become
conditional rather than being applied by default.

---

## Known rough edges

**Duplicate accumulation.** Editing a task's wording changes the fingerprint, so
you get a new entry and the old one stays. This is deliberate — nothing is ever
silently lost — but the library fills with near-duplicates if someone iterates
on their lists often. A similarity check that offers "replace the previous
version?" would fix it. It needs care: the threshold has to be conservative,
because a wrong merge loses data and a wrong split only costs clutter.

**Long checklists make long links.** Fine to about 200 lines. Beyond that,
deflate via pako before base64 would cut roughly two thirds off repetitive text
— but it adds a dependency, so it needs a real complaint before it's worth it.

**Fingerprint collisions.** 32-bit FNV-1a over a handful of stored items makes
collisions a non-issue in practice. If storage ever holds thousands of lists,
widen the hash.

**No export to plain `.md`.** Copying out of the edit view works and nobody has
asked for a download button yet.

---

## Working on this

Test both storage paths — normal browser and a context where `localStorage`
throws — since the fallback path is easy to break without noticing. Test the
three link-arrival cases explicitly; the conflict branch is the one that gets
broken by refactors and the one where breakage costs the user real work.

When in doubt: the user's typed text is sacred, the derived state is disposable,
and the file stays a file.
