---
phase: 01-vertical-slice
verified: 2026-08-11T12:09:13Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
re_verification: false
deferred:
  - truth: "Classification / reconciliation / multi-part problems are workable in the UI"
    addressed_in: "Phase 2"
    evidence: "Phase 2 success criteria 1-3: classification, reconciliation, and multi-part engines with instant/per-step feedback"
human_verification:
  - test: "Open the public GitHub Pages URL on a phone, read Chapter 1 sections, and work one problem from each practice set"
    expected: "Lesson renders in the green-accent design, stepper/rail navigation works, JE entry form is usable with thumbs"
    why_human: "Live URL unreachable from this environment (egress blocks github.io); visual/mobile feel cannot be verified by grep"
  - test: "Answer a knowledge check and solve one JE problem, fully quit the browser, reopen the site later"
    expected: "Home shows the resume card pointing at the last lesson/practice location; the answered check shows its resolved state; problem card shows best score and attempt count"
    why_human: "Real cross-session localStorage persistence on a device can only be confirmed by doing it"
---

# Phase 1: Vertical Slice — Chapter 1 Live — Verification Report

**Phase Goal:** Learner can complete Chapter 1 end-to-end today — read the lesson, answer knowledge checks, solve journal-entry problems with tolerant grading, and return later to find their place saved — on a live, mobile-friendly site. The content schema is designed against the full 12-chapter curriculum before any further chapter is authored.
**Verified:** 2026-08-11T12:09:13Z
**Status:** human_needed (all 5 automated criteria verified; two device-level checks remain for the learner)
**Re-verification:** No — initial verification

## Automated Checks Run

| Check | Command | Result |
| ----- | ------- | ------ |
| Type-check + production build | `npm run build` (tsc --noEmit && vite build) | ✓ PASS — 105 modules, dist/ emitted |
| Test suite | `npx vitest run` | ✓ PASS — 2 files, 21/21 tests |
| Anti-pattern scan (TBD/FIXME/XXX/HACK/PLACEHOLDER) | grep over src/ | ✓ Clean — zero matches |
| Built output uses relative paths | inspect `dist/index.html` | ✓ `./assets/index-*.js` / `./assets/index-*.css` (works under /TaxApp/ subpath) |
| Chapter content bundled | grep dist JS for set ids | ✓ `ch01-bootcamp`, `ch01-genfund`, `ch01-fund-id` all present |

## Goal Achievement — Success Criteria

### Criterion 1: Lesson readable at public GitHub Pages URL on a phone, example-first format — ✓ VERIFIED

- **Deployment:** `.github/workflows/pages.yml` builds (test → build → upload-pages-artifact → deploy-pages) on push to `claude/get-shit-done-setup-aqe6z7`. Deploy runs for commits 6a666bf and 2a4e5e5 concluded successfully (orchestrator-confirmed; live URL unreachable from this sandbox). `vite.config.ts` sets `base: './'`; built `dist/index.html` confirmed to reference assets relatively, so the site works from the Pages project subpath with zero server config.
- **Hash routing:** `src/lib/router.ts` — hand-rolled `#/`, `#/chapter/:id`, `#/chapter/:id/lesson/:n`, `#/chapter/:id/practice/:set/:n`; no history-API routing anywhere, so deep links and refreshes survive on Pages.
- **Mobile-first:** `src/styles.css` has 8 media queries — mobile stepper hidden ≥980px, desktop rail shown ≥980px, table/card reflow ≤719px, `prefers-color-scheme` and `prefers-reduced-motion` handled. `index.html` sets `viewport-fit=cover` and a pre-paint theme bootstrap reading the same `gat:progress` key as `storage.ts`.
- **Example-first format:** all 6 sections in `src/content/chapters/ch01.ts` follow the artifact pedagogy — kicker → (activation prediction in §1) → `ga-lead` hook → narrative → `ga-figure`/`ga-example`/`ga-note` → `ga-takeaway`. `LessonView` (`src/views/lesson.tsx`) renders stepper (mobile) + rail (desktop) + section blocks, wired end-to-end from `App` → `findChapter` → zod-parsed registry (`src/content/index.ts`).

### Criterion 2: Inline knowledge checks with immediate explanatory feedback — ✓ VERIFIED

- `src/components/check-beat.tsx` renders activation predictions and knowledge checks: choice buttons → immediate right/wrong marking → `explain` HTML revealed in a `role="status"` region; answer persisted via `recordCheckAnswer` and restored from `getCheckAnswer` on revisit. Never gates navigation.
- All 6 Chapter 1 sections carry a `knowledgeCheck`; §1 also has an `activation`. Correct-answer indices spot-checked against their prompts and explanations — all 7 are the pedagogically correct choice (e.g. §2: state university → GASB; §5: auditor's opinion → financial section).
- Schema guard: `knowledgeCheckSchema.refine` rejects out-of-range answer indices (covered by test "rejects a knowledge-check answer index out of range").

### Criterion 3: JE practice with account picker and tolerant line-by-line grading — ✓ VERIFIED

- **UI engine** (`src/problems/journal-entry.tsx`): account `<select>` dropdown built from the problem's catalog (satisfies "dropdown/typeahead", mobile-friendly), debit/credit inputs with `inputMode="decimal"`, mutually exclusive Dr/Cr per line, add/remove lines, live Dr/Cr totals with balanced indicator, per-line verdict badges (correct / wrong-amount / wrong-side / extra), missing-lines callout, explanation reveal after grading, retry button, score recorded via `recordProblemAttempt`.
- **Grader** (`src/lib/grade-je.ts`) re-reviewed against PRAC-05:
  - *Order-insensitive:* three-pass greedy matching over unordered lines; each submitted/key line used at most once. Exact matches claim key lines before wrong-amount before wrong-side, so a duplicate-account decoy cannot steal an exact match (explicit test at grade-je.test.ts:141).
  - *Aliases:* `normalizeAccount` lowercases and collapses all non-alphanumerics, then compares against canonical name + `aliases[]` — so "ESTIMATED UNCOLLECTIBLE TAXES", punctuation, and dash-style differences all pass (tests at lines 56-65, 164-169).
  - *Tolerance:* ±0.01 default with per-problem (`spec.tolerance`) and per-line (`key.tolerance`) overrides, plus 1e-9 epsilon against float error (tests at lines 67-94).
  - *Amount parsing:* UI strips `$`, commas, spaces before Number() — minor formatting tolerated.
  - 10 grader tests cover correct / reordered / alias / rounding / per-line override / wrong-amount / wrong-side / missing / extra / exact-match priority. All pass.
- **Content:** Set A (5 bootcamp JEs) + Set B (4 General Fund JEs) reachable via chapter page → `PracticeView` → `JournalEntryEngine`.

### Criterion 4: Resume + prior scores intact after closing browser — ✓ VERIFIED (code level; device confirmation is human item 2)

- `src/lib/storage.ts`: versioned `{version: 1, ...}` schema, every localStorage read/write in try/catch with in-memory fallback, unknown-version reads reset to defaults rather than misparse, single-writer `update()` publishing a `@preact/signals` read-only signal.
- Resume: `useRoute` records `lastLocation` for lesson/practice routes only (`maybeRecord`); `ResumeCard` on home (`src/views/home.tsx:24-50`) parses it back and navigates on tap. `ChapterView` independently resumes at the first incomplete section.
- Scores intact: `recordProblemAttempt` keeps attempts / bestScore / lastScore / solved; `PracticeView` shows "best N% · N attempts"; home and chapter cards show solved counts; `CheckBeat` restores answered state. Data flow traced end-to-end: UI event → storage mutation → signal → localStorage → reload → `load()` → same UI.

### Criterion 5: Schema proven for all 4 problem types before Chapter 2 — ✓ VERIFIED

- `src/content/schema.ts` defines a zod discriminated union over `journal-entry`, `classification`, `reconciliation`, `multi-part` (multi-part composes the other three, no nesting), with cross-field refinements: JE answer keys must balance and stay inside the account catalog; classification answers must reference existing categories; unique section/set ids.
- One fixture per type (`src/content/fixtures/*.fixture.ts`) parses through both its own schema and the union (5 tests). Invariant tests prove the schema *rejects* malformed content (unbalanced key, off-catalog account, bad answer index).
- Beyond fixtures: the real Chapter 1 module carries a hidden classification set (`ch01-fund-id`, `hidden: true`) that zod-parses inside `chapterSchema` — proving a non-JE type survives the full chapter authoring path. Hidden sets are excluded from chapter nav (`chapter.tsx:14`) and from home progress counts (`home.tsx:16`).

## Domain Accuracy Review — ch01-genfund (General Fund practice set)

Checked against modified-accrual / Reck 18e conventions as requested. **No accounting errors found.**

| Entry | Answer key | Verdict |
| ----- | ---------- | ------- |
| je-tax-levy | Dr Taxes Receivable — Current 500,000; Cr Allowance for Uncollectible Current Taxes 10,000; Cr Revenues — Property Taxes 490,000 | ✓ Correct — revenue recognized at levy net of the 2% estimated uncollectible; no Bad Debt Expense (offered only as a distractor); explanation explicitly teaches the netting rule |
| je-collect-taxes | Dr Cash 460,000; Cr Taxes Receivable — Current 460,000 | ✓ Correct — no second revenue recognition; explanation flags the timing difference |
| je-pay-expenditure | Dr Expenditures 12,500; Cr Cash 12,500 | ✓ Correct — "Expenditures" not "Repairs Expense" (distractor present); explanation correctly extends to capital outlay expensed in governmental funds and no fund-level depreciation |
| je-transfer-out | Dr Other Financing Uses — Interfund Transfers Out 50,000; Cr Cash 50,000 | ✓ Correct — transfer as OFU, not Expenditure; explanation correctly notes the receiving fund records Other Financing Sources, not Revenue |

Lesson prose also checked: GASB/FASB/FASAB jurisdiction split by ownership (§2), interperiod equity and fiscal vs. operational accountability mapped to fund vs. government-wide statements (§3), three fund families / eleven types (§4), ACFR structure with only the financial section audited, SEFA/Single Audit (§5) — all accurate. Bootcamp Set A entries (supplies on account, payment, intergovernmental billing, collection, payroll accrual) are standard and correct.

## Requirements Coverage

| Requirement | Description (abridged) | Status | Evidence |
| ----------- | ---------------------- | ------ | -------- |
| LESN-01 | Example-first chapter lessons | ✓ SATISFIED | ch01.ts 6 sections + LessonView (Criterion 1) |
| LESN-02 | Inline knowledge checks, immediate feedback | ✓ SATISFIED | CheckBeat (Criterion 2) |
| LESN-04 | Free navigation + resume | ✓ SATISFIED | Router + ResumeCard + first-incomplete resume (Criterion 4) |
| PRAC-01 | JE problems: picker, Dr/Cr entry, line-by-line grading | ✓ SATISFIED | JournalEntryEngine (Criterion 3) |
| PRAC-05 | Tolerant grading: tolerance, order, aliases, explanations | ✓ SATISFIED | grade-je.ts + 10 tests (Criterion 3) |
| PROG-01 | Local persistence, quota-safe | ✓ SATISFIED | storage.ts versioned + try/catch (Criterion 4) |
| PLAT-01 | Mobile-first responsive, light/dark theme | ✓ SATISFIED | styles.css media queries; 3-state theme (system/light/dark) in theme.ts/topbar.tsx, persisted, pre-paint bootstrap |
| PLAT-03 | Deployed to public GitHub Pages URL on push | ✓ SATISFIED | pages.yml + successful deploy runs for 6a666bf, 2a4e5e5 + relative-path dist |

No orphaned requirements: REQUIREMENTS.md maps exactly these 8 IDs to Phase 1.

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
| ---- | ------- | -------- | ------ |
| — | No TBD/FIXME/XXX/HACK/PLACEHOLDER markers in src/ | — | Clean |
| src/views/practice.tsx:20-24 | "coming in a later update" body for non-JE problem types | ℹ️ Info | Only reachable by hand-typing the hidden set's URL; intentional Phase 2 deferral, not a stub of promised Phase 1 behavior |
| src/views/lesson.tsx | Sections marked complete only via the "Next section" button; stepper/arrow-key navigation does not mark complete | ℹ️ Info | Deliberate-feeling design; progress meaning stays honest |

## Deferred Items

| Item | Addressed In | Evidence |
| ---- | ------------ | -------- |
| Classification / reconciliation / multi-part *engines* (UI) | Phase 2 | Phase 2 SC 1-3 explicitly cover these problem types; Phase 1 only required the schema to represent them, which is verified |
| Offline PWA, update prompt, export/import | Phase 3 | Phase 3 SC 3-5; PLAN.md explicitly excludes vite-plugin-pwa from Phase 1 |

## Human Verification Required

### 1. Live mobile walkthrough

**Test:** Open the GitHub Pages URL on your phone. Read a couple of Chapter 1 sections, answer their checks, then work one problem in each practice set.
**Expected:** Green-accent design renders in both themes; stepper navigation, account dropdown, and Dr/Cr inputs are comfortable with thumbs; grading verdicts and explanations appear immediately.
**Why human:** This environment cannot reach github.io, and visual/mobile ergonomics are not grep-verifiable.

### 2. Cross-session resume

**Test:** After the walkthrough, fully close the browser. Reopen the site later.
**Expected:** Home shows "Pick up where you left off" pointing at your last location; answered checks show their resolved state; problem cards show best score and attempt counts.
**Why human:** Real on-device localStorage persistence across a browser restart can only be confirmed by doing it.

## Gaps Summary

No gaps. All five roadmap success criteria are backed by substantive, wired, data-flowing implementation; the build and full test suite pass; the deploy pipeline ran successfully for the shipping commits; the General Fund content is domain-accurate. The only open items are the two device-level human confirmations above, which is why status is `human_needed` rather than `passed`.

---

_Verified: 2026-08-11T12:09:13Z_
_Verifier: Claude (gsd-verifier)_
