---
name: md-checklist
description: A quiet working register for Markdown checklists stored in GitHub Gists.
colors:
  paper: "#e6ebef"
  card: "#ffffff"
  ink: "#0f1b26"
  muted: "#5a6c7c"
  line: "#c9d4dc"
  accent: "#0e7c6b"
  accent-soft: "#ddefea"
  warning: "#8a5a12"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    lineHeight: 1.5
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "11px"
    letterSpacing: "0.08em"
rounded:
  control: "7px"
  surface: "12px"
spacing:
  compact: "8px"
  standard: "16px"
  section: "22px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "18px"
---

# Design System: md-checklist

## Overview

**Creative North Star: "The Working Register"**

The interface should feel like a precise utility laid on cool office paper:
quiet, dense enough for repeated use, and immediately legible. Structure comes
from ruled rows, restrained surfaces, and explicit status copy rather than
decorative dashboard chrome.

**Key Characteristics:**

- Cool neutral canvas with one scarce completion accent.
- Compact operational controls and generous separation between workflows.
- List rows carry library content; cards are reserved for distinct actions.

## Colors

Navy ink and cool paper establish the instrument-like base. Teal appears only
for completion, links, and focus; amber communicates recoverable problems.

**The Scarce Accent Rule.** Teal identifies progress or interaction state, not
generic decoration.

## Typography

System sans carries prose and checklist content. The system monospace stack is
reserved for identifiers, counts, status, and compact controls.

## Layout

Content uses a centered 760px working column. Sections separate at 22px; groups
inside a workflow use an 8px rhythm. Below 560px, library rows become stacked
and margins tighten without changing task order.

## Elevation & Depth

The system is flat. White surfaces separate from paper through a single cool
border, never through ornamental shadows.

## Shapes

Controls use restrained 7px corners. Larger workflow surfaces use 12px corners;
progress tracks may be fully rounded because they represent a continuous value.

## Components

### Buttons

Compact monospace labels name actions directly. The primary action uses navy
fill; secondary actions remain white with a cool border. Focus uses a visible
2px teal outline.

### Cards / Containers

Panels hold distinct workflows such as token configuration or Gist attachment.
Library content belongs in one ruled list surface rather than repeated cards.

### Inputs / Fields

Fields are white, monospaced, and share the 7px control radius. Focus matches
buttons with a 2px teal outline.

## Do's and Don'ts

### Do:

- **Do** keep state and recovery actions visible in plain language.
- **Do** preserve a clear reading order at narrow widths.
- **Do** use ruled rows for collections of checklists.

### Don't:

- **Don't** turn the library into a grid of interchangeable statistic cards.
- **Don't** use the accent color as decoration.
- **Don't** replace native buttons, inputs, or focus indicators with custom
  non-semantic elements.
