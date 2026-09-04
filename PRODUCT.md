# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user keeps several lightweight procedural checklists and wants to
open, edit, and share them without operating a dedicated backend. Recipients
need a live, read-only view that requires no account in md-checklist.

## Product Purpose

md-checklist turns deliberately small Markdown documents into interactive
checklists. A local home page indexes multiple checklists, while one secret
GitHub Gist per checklist stores its content and completion state.

## Positioning

The application is a static client: GitHub Gists provide persistence and
read-only distribution, while the owner's browser holds the single GitHub token
used to manage every checklist in the local library.

## Operating Context

Owners create or add Gists from the home page, open a checklist to edit or tick
items, and copy a read-only link for recipients. A library entry is local
metadata pointing to a remote Gist; the Gist remains the source of truth.

## Capabilities and Constraints

- Static HTML, CSS, and JavaScript with no dependencies and no build step.
- Must run from `file://`, Vercel, and GitHub Pages.
- `index.html` is the local library; `checklist.html#gist=…` is the checklist.
- One locally stored GitHub token is shared across the owner's library.
- The home page can create a checklist or add an existing Gist by ID or URL.
- Sharing is always read-only; shared URLs never contain the token.
- Gist writes are debounced by two seconds and network failures never block
  local interaction.
- UI chrome is bilingual French/English; user-authored Markdown is never
  translated.
- Browser storage can throw and requires an in-memory fallback.
- The Markdown grammar stays intentionally small and dependency-free.

## Brand Commitments

The product name is md-checklist. The incumbent interface is a quiet utility
using paper grey, navy ink, and a blue-green completion/focus accent. Code and
UI implementation use English naming; visible chrome supports French and
English.

## Evidence on Hand

The working checklist renderer, Gist persistence flow, bilingual strings, and
incumbent design are in `checklist.html`. `README.md` documents deployment and
security constraints. There are no testimonials, commercial claims, or brand
assets to invent.

## Product Principles

- The user's Markdown is sacred; derived interface state is disposable.
- A Gist is the source of truth, never an exported snapshot in the URL.
- Sharing grants observation, not mutation.
- The owner can understand where every checklist lives and recover it by Gist
  ID.
- Failure to reach GitHub must not prevent reading or editing the current view.

## Accessibility & Inclusion

Tasks remain real buttons with `aria-pressed`, keyboard focus stays visible,
reduced-motion preferences are respected, and all controls require explicit
accessible names.
