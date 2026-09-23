# md-checklist

A dependency-free Markdown checklist library backed by secret GitHub Gists. Write a small
checklist in Markdown, tick items in the browser, and share a read-only live
view without running an application server.

The interface is available in English and French. Open `index.html` directly
to run it locally.

## How it works

- The home page keeps a local index of multiple checklists.
- The owner enters one GitHub token used to manage all their Gists.
- md-checklist creates a secret Gist containing `md-checklist.json`.
- The complete Markdown source, including checkbox state, is saved two seconds
  after each change.
- The sharing link contains only the Gist ID and opens the checklist in
  read-only mode.
- A read-only page refreshes the Gist every 30 seconds while its tab is visible.
- Editing remains available only in the owner's browser, where the token is
  stored locally.
- Existing md-checklist Gists can be added by ID, Gist URL, or sharing link.
- `localStorage` contains only the local Gist index, owner token, and language setting.
  The checklist itself lives only in the Gist.

A network failure never blocks local interaction. The owner can retry a save
manually after connectivity returns.

## GitHub token

Create a dedicated, revocable GitHub token with permission to manage Gists,
then paste it into md-checklist. The token is never added to the Gist or to a
sharing link. It is stored as plain text in `localStorage` on the owner's
browser, so this tool should be used only on a trusted device.

Anyone who receives a sharing link can read the secret Gist because possession
of its unguessable ID grants read access. They cannot tick items, edit the
Markdown, or save changes.

## Deploy to Vercel

The included `vercel.json` serves `index.html` from the deployment root.

1. Fork or push this repository to your GitHub account.
2. Sign in to [Vercel](https://vercel.com/) and select **Add New → Project**.
3. Import the `md-checklist` repository.
4. Set **Framework Preset** to **Other**.
5. Leave the **Build Command** empty.
6. Leave the **Output Directory** empty so Vercel serves the repository root.
7. Deploy the project.

Every subsequent push to the connected branch creates a new deployment. No
packages, environment variables, or server functions are required. Vercel's
documentation confirms that static HTML/CSS/JavaScript projects can skip the
build step: [Configuring a Build](https://vercel.com/docs/builds/configure-a-build).

## Deploy to GitHub Pages

Yes, md-checklist also works on GitHub Pages. It is a static HTML application,
uses relative paths, and supports project-site URLs such as
`https://USERNAME.github.io/md-checklist/`.

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. On a GitHub fork, open the **Actions** tab and click **Enable workflows**
   (forks start with Actions disabled).
5. Push to `main`, or run **Deploy to GitHub Pages** from the Actions tab, and
   wait for it to finish.
6. Open `https://USERNAME.github.io/md-checklist/`, replacing
   `USERNAME` with your GitHub username.

The workflow in `.github/workflows/pages.yml` stamps `js/version.js` with the
short commit SHA and commit date, shown at the bottom of the library page
(for example `version 9aeebf0 · 2026-09-23`). Compare it with the latest commit
of the upstream repository to know whether a fork is up to date. Choosing
**Deploy from a branch** instead still works, but the footer then shows
`version dev`, as it does from `file://` and on Vercel.

GitHub Pages expects an `index.html`, `index.md`, or `README.md` at the root of
the publishing source. This repository now includes `index.html`, so the
application opens directly from the project-site root.
See GitHub's guides for [configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
and [entry-file requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Design and Markdown grammar

The interface uses a cold paper grey, navy ink, and a blue-green accent reserved
for completion and focus. Its intentionally small Markdown grammar supports ATX
headings, task items, plain bullets, inline `code`, **bold text**, links, and
two-space nesting.

## Known limitations

- **One writer.** Shared views are always read-only.
- **No `.md` download.** Markdown can still be copied from the editing view.
- **Network required for persistence.** The app opens from `file://`, but
  reading or writing the Gist requires access to the GitHub API.
- **Last successful save wins.** There is no revision-merging interface.

## Technical constraints

Static HTML, CSS, and JavaScript, zero dependencies, no build, and no CDN. `fetch` is used only for
the GitHub Gist API. All `localStorage` access is guarded by an in-memory
fallback for environments where browser storage throws.

## License

No license has been selected yet.
