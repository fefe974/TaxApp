# TaxApp

A mobile-first teaching app for a college accounting course, built on the
comprehensive problems in Weygandt chapter 2. One file, `index.html`, no build
step, no runtime dependencies. `artifact.html` is derived from it by
`scripts/build-artifact.js` and published as a claude.ai Artifact.

## How the app is put together

- **One source of truth per module.** `LEDGER` (2.1), `JOURNAL` (2.2),
  `UNADJ` + `ADJ` (2.3). Every downstream figure — dashboards, illustrations,
  worksheets, hints, grading — is derived from it, so they cannot disagree.
  A figure written down twice is a bug waiting to happen.
- **Modules follow the printed problem.** Solve asks exactly what the textbook's
  INSTRUCTIONS ask, quoted verbatim, scored per instruction. Anything the app
  adds beyond the problem is labelled as such and scored separately.
- **The Reference tab is source material, never the answer key.**
- `scripts/verify.js` drives a real browser. Every assertion in it was checked
  by breaking the thing it watches — an assertion that has never failed proves
  nothing. Add new ones the same way.

## Design taste

Extracted from the running app by the `taste` skill. Full analysis with
measurements in `docs/taste/taxapp.md`; tokens in `docs/taste/taxapp.json`.

Surface kind is **Operate** — a multi-step tool with data tables. Scanability
and consistency outrank expression. It is not a landing page and should never
start behaving like one.

Four rules the app already follows. Keep following them:

1. **One serif, once per screen.** Literata is for the `h1` and nothing else.
   Every other heading takes the interface sans. Nothing but the `h1` exceeds
   19px.
2. **Numbers get the mono and tabular figures.** Prose in the system sans,
   every figure in Plex Mono with `font-variant-numeric: tabular-nums`. A
   column that does not line up is a reading error in this domain.
3. **Shadows are tinted to the ground** — `rgba(37, 30, 18, …)` on cream, pure
   black only in dark mode. Three fixed depths; do not invent a fourth.
4. **Nothing is a picture.** Figures are drawn from DOM and CSS so they carry
   live numbers and re-theme themselves. No raster images, no icon fonts.

Also holding, and worth not breaking:

- Text meets WCAG AA against whatever is actually behind it, in both themes.
  `--muted` is the tier that nearly failed; it has no headroom to spare.
- Illustrations are `<figure>` + `<figcaption>` and state their claim — either
  `role="img"` with an `aria-label` (diagrams whose text is fragments) or a
  `.sr-only` sentence read first (figures whose text is the content).
- Interface motion ≤300ms; illustration motion ≤2s and inside a `.viz`. Every
  animation has a `prefers-reduced-motion` answer.
- Navigation moves focus to the new heading. The guide pane is not a live
  region — it is replaced wholesale, and announcing it re-reads everything.

Two known leaks, unfixed:

- The radius scale (`--r-sm/md/lg/xl`) is bypassed by 23 hardcoded values.
  Prefer the token; `4px`, `5px`, `8px` and `12px` are drift.
- Spacing has no base unit — 7, 9, 11, 13px all appear. Match a neighbour
  rather than inventing another value.
