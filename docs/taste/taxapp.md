# Taste — Financial Accounting · Chapter 2

Produced by the `taste` skill (`.claude/skills/taste`) from two captures of the
running app at 1440×900: the module 2.3 dashboard (`#lo23`) and an entry screen
(`#lo23-a2`). Every figure below is measured from the rendered page, not read
off the stylesheet, so it reflects what actually reaches a learner.

Surface kind: **Operate** — a multi-step teaching tool with data tables. Not a
landing page. Judge it on scanability and consistency, not expression.

---

## Design Map

### Colour

| Role | Light | Dark | Notes |
|---|---|---|---|
| Page ground | `#faf8f4` | `#12141a` | Cream, not white. White is reserved for raised surfaces. |
| Raised surface | `#ffffff` (×16) | `#1a1d25` | Cards, vouchers, figures |
| Sunken surface | `#f4f1ea` / `#e8e3d8` (×14) | `#21252f` / `#2c313d` | Table cells, disabled controls, rails |
| Body text | `#4a5260` (×46) | `#b8b6ae` | The workhorse |
| Secondary text | `#646b78` (×18) | `#989791` | Captions, counters, hints |
| Primary text | `#191d24` (×13) | `#ece9e2` | Headings and figures |
| Brand | `#1e3a5f` (×2) | `#8fb4e0` | Appbar, primary action, focus ring |
| Positive | `#0f7b5a` | `#4ec49b` | Balanced, correct, proven |
| Negative | `#b4232a` | — | Wrong, decrease |
| Amber | `#8a5a12` | `#e0b464` | Deferrals, hints, adjustments column |

Three text tiers, and the measured counts (46 / 18 / 13) show they are used in
that proportion — most text is the middle tier, the darkest is rationed.

### Typography

| Role | Family | Evidence |
|---|---|---|
| Display | Literata (self-hosted woff2) | **×2 per screen** — the `h1` only |
| Interface | system sans (`-apple-system` stack) | ×134–136 per screen |
| Figures | IBM Plex Mono (self-hosted woff2) | ×34–68 per screen |

- `h1` — 32px / 600 / line-height 34.56px / letter-spacing −0.48px
- body — 15px / 400 / line-height 24px, measure capped at **591px** (`max-width: 640px`)
- size ramp actually in use: 9.5, 10, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 19, 32
- weights in use: 400, 500, 600, 700, 750, 800
- `font-variant-numeric: tabular-nums` — 28 declarations

### Space, shape, depth

- radii tokens — `--r-sm 6px`, `--r-md 10px`, `--r-lg 14px`, `--r-xl 18px`
- shadows — three fixed depths, all `rgba(37, 30, 18, …)` in light; pure black at 0.45–0.8 in dark
- spacing values observed — 2, 3, 7, 8, 9, 10, 11, 12, 13, 14, 26, 30, 40
- no container: `containerMaxWidth: none`, width driven by the pane and a 640px reading measure
- `:focus-visible` present; `prefers-reduced-motion` answered
- **zero raster images** in the entire app

---

## Taste DNA

### One serif, spent once per screen
- **Trigger**: needing a voice for a textbook-derived teaching tool that must not read like a corporate dashboard, on a phone where vertical space is the scarce resource.
- **Decision**: loaded a display serif and then used it on exactly one element per screen — the `h1` — over setting the whole heading hierarchy in it.
- **Reason**: a learner arriving on a screen needs one anchor telling them where they are; a page of serif headings turns a worksheet into a magazine and buries the thing they actually came to do.
- **Evidence**: Literata renders on 2 elements per capture against 134–136 for the system sans. Every `h2` — "Chart of accounts", "What needs adjusting" — falls back to the interface font. The serif is 32px/600 with −0.48px tracking; nothing else in the app is over 19px.

### Figures get their own alphabet
- **Trigger**: screens that mix explanatory prose with columns of money that have to line up down a scrolling table.
- **Decision**: partitioned type by role — system sans for prose, mono with tabular figures for every number — over one family across all roles.
- **Reason**: in accounting a column that does not line up is a *reading error*, not an aesthetic complaint. The learner is being asked to spot that 23,600 became 25,880; the digits have to sit on a common grid to make that visible at a glance.
- **Evidence**: Plex Mono on 68 elements on the dashboard, 34 on an entry screen; 28 `tabular-nums` declarations covering amounts, row effects, the contra panel and both trial balance columns.

### Shadows tinted to the paper, not to black
- **Trigger**: needing elevation for cards and vouchers on a cream ground rather than a white one.
- **Decision**: `rgba(37, 30, 18, …)` — a warm brown-black — over neutral black, and three fixed depths over per-component values.
- **Reason**: a black shadow on cream reads as a smudge; tinting it toward the paper's own hue reads as light falling on the page. The learner never notices it, which is the point.
- **Evidence**: all three shadow tokens share `rgba(37, 30, 18)` at 0.05 / 0.16 / 0.26 in light, and switch to pure black at 0.45 / 0.8 in dark — the tint tracks the ground, so it was chosen, not defaulted.

### Nothing is a picture
- **Trigger**: teaching relationships that are inherently abstract — a timeline, an accounting equation, a contra account sitting under an asset.
- **Decision**: drew every figure from DOM and CSS over shipping illustrations, an icon font, or rendered diagrams.
- **Reason**: a drawn figure carries live numbers and re-themes itself; a picture of a trial balance is stale the moment a figure changes, and on a teaching tool a stale figure is a wrong answer.
- **Evidence**: `images: 0` on both captures. The balance board animates its totals from the same data that scores the worksheet, so the illustration and the grader cannot disagree.

---

## Where the system leaks

Two places the app has a rule and then works around it. Neither is a trade-off —
both sides are not defensible — so they are reported here rather than dressed up
as taste.

**The radius scale is bypassed 23 times.** Four tokens are defined and used 49
times (`--r-md` ×27, `--r-sm` ×15, `--r-lg` ×6, `--r-xl` ×1), alongside 23
hardcoded values: `4px` ×6, `999px` ×4, `50%` ×4, `5px` ×3, `2px` ×3, `8px` ×2,
`6px` ×2, `12px` ×2. The pills and dots are legitimate. `4px`, `5px`, `8px` and
`12px` are off-scale one-offs, and `6px` duplicates `--r-sm` by hand. Measured on
the rendered page this shows up as six distinct radii on one screen.

**Spacing is ad hoc rather than stepped.** Observed values include 7, 9, 11 and
13px — there is no 4px or 8px base unit, so every new component picks its own
number. The app reads as consistent anyway because the values are close
together, but nothing stops the next one drifting.
