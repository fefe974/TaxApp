# Phase 1 Plan: Vertical Slice — Chapter 1 Live

**Goal:** Learner completes Chapter 1 end-to-end on a live mobile site: lesson → knowledge checks → graded JE practice → progress saved.
**Requirements:** LESN-01, LESN-02, LESN-04, PRAC-01, PRAC-05, PROG-01, PLAT-01, PLAT-03
**Mode:** mvp | **Execution:** 2 plans, sequential (02 depends on 01's schema)

## Stack (per CLAUDE.md / research)

Vite 8 + Preact 10 + TypeScript (~5.9 fallback if TS7 breaks toolchain) + @preact/signals + vite-plugin-pwa (added in Phase 3 — NOT now) + zod (content validation) + vitest (grader tests). Hash routing (hand-rolled, ~30 lines). `base: './'` relative paths for GitHub Pages subpath. Design language ported from the validated Lesson 1 artifact (green accent, light/dark tokens, example-first pedagogy) — reference file: `/root/.claude/projects/-home-user-TaxApp/70dc3c2a-9d3d-5d6b-84fa-b45f25ad6486/tool-results/artifact-f42f8ac1-1786389830-28c3.html`.

## Plan 01 — Engine + Shell (foundation)

**Tasks:**
1. Scaffold Vite + Preact + TS app (`npm create vite` equivalent laid out manually; verify `npm run build` passes).
2. **Content schema** (`src/content/schema.ts` + zod mirrors): `Chapter` = meta (id, title, book alignment, jobDuties[]) + `LessonSection[]` (kicker, title, activation?, html blocks, knowledgeCheck?) + `PracticeSet[]`. `Problem` = discriminated union on `type`: `journal-entry` (scenario, accounts catalog, answerKey lines w/ aliases + tolerance, explanation), `classification`, `reconciliation`, `multi-part` (typed now, engines built Phase 2 — schema must prove all 4 types representable NOW: include one fixture of each type in tests).
3. **Progress store** (`src/lib/storage.ts`): versioned schema `{version:1,...}`, try/catch everything, in-memory fallback, single writer; signals-based `progress` consumed by UI; records: lastLocation, section completion, knowledge-check answers, problem scores/attempts.
4. **App shell**: hash router (`#/`, `#/chapter/1`, `#/chapter/1/lesson/:section`, `#/chapter/1/practice/:set`), top bar w/ theme toggle (3-state: system/light/dark, persisted), home = chapter list w/ progress + resume card, footer.
5. **Lesson renderer**: section stepper (mobile) + rail (desktop), renders section blocks, activation predictions and knowledge checks as interactive widgets w/ immediate explanatory feedback, section-complete → next; takeaway styling per artifact.
6. **JE problem engine** (`src/problems/journal-entry.tsx` + `src/lib/grade-je.ts`): account typeahead/dropdown from problem's account catalog, add/remove debit/credit lines, tolerant grader — order-insensitive line matching, account aliases, numeric tolerance (±0.01 default, per-problem override), line-by-line verdicts + explanation reveal; retry allowed; score recorded.
7. **Grader tests** (vitest): correct/wrong/reordered/alias/rounding cases; content validation test: zod-parse every chapter module + all 4 problem-type fixtures.
8. **Deploy workflow**: `.github/workflows/pages.yml` — build + upload-pages-artifact + deploy-pages on push to `claude/get-shit-done-setup-aqe6z7`.

**Verify:** `npm run build` + `npx vitest run` green; app renders with a stub chapter.

## Plan 02 — Chapter 1 Content

**Tasks:**
1. `src/content/chapters/ch01.ts` — Chapter 1: "Government and Not-for-Profit Environment" (book Ch. 1 alignment, LO 1-1…1-5). 5-6 example-first lesson sections w/ activation predictions + knowledge checks (mine the saved Lesson 1 artifact for pedagogy/voice; ALL prose original — no book text). Sections: (1) A different kind of accounting (gov vs business exchange), (2) Who's who: gov vs NFP vs business + GASB/FASB/FASAB jurisdiction, (3) Why no bottom line: accountability & interperiod equity, (4) Funds preview: the three fund categories, (5) The reporting landscape: ACFR/budget/federal reports, (6) Your job through this lens (map to county Accountant I duties).
2. Practice set A "Foundations: Debits & Credits Bootcamp" — 5 JE problems refreshing mechanics w/ government flavor (receive cash, pay invoice, record receivable, purchase supplies, payroll accrual).
3. Practice set B "General Fund First Look" — 4 JE problems previewing simple General Fund entries (property tax levy w/ uncollectible allowance, collection, simple expenditure, transfer) each w/ teaching explanations.
4. Fixture content proving classification/reconciliation/multi-part schema types (hidden from nav or marked "coming soon" — not user-facing).
5. Job-duty tags on chapter meta + sections (data groundwork for Phase 3).

**Verify:** content validation tests pass; manual walkthrough of lesson + both practice sets in built app.

## Success Criteria Mapping

| Roadmap criterion | Covered by |
|---|---|
| 1. Lesson readable on phone at public URL | 01.4-5, 01.8, 02.1 |
| 2. Knowledge checks w/ feedback | 01.5, 02.1 |
| 3. JE practice w/ tolerant line-by-line grading | 01.6, 02.2-3 |
| 4. Resume + scores persist | 01.3 |
| 5. Schema proven for all 4 problem types | 01.2, 01.7, 02.4 |

## Risks

- TS7 toolchain mismatch → fall back to TS ~5.9 (decision inside Plan 01 task 1).
- GitHub Pages source may be set to "deploy from branch" (old app) — workflow deploy needs Pages source = GitHub Actions; check live URL at deploy time, flip via API if possible, else one-tap user action (documented at handoff).
- Artifact-preview fallback: publish single-file build as claude.ai artifact so learner can test immediately regardless of Pages config.
