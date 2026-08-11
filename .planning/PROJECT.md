# Governmental Accounting Trainer

## What This Is

A personal, self-paced web app that teaches governmental accounting through structured lessons and graded practice problems. Content mirrors the chapter structure of *Accounting for Governmental & Nonprofit Entities* (Reck, Lowensohn & Neely, 18th ed.) and is weighted toward the duties of a real county Accountant I position. Built for one learner (the owner), used heavily on mobile.

## Core Value

The learner finishes able to confidently perform every duty in the target county Accountant I job description — GL reconciliation, journal entries, budget/appropriation review, grant reporting, fixed assets, invoicing, year-end close, and financial reports under GAAP/GASB.

## Requirements

### Validated

- ✓ Example-first lesson format works for this learner — proven by the existing "Governmental Accounting — Lesson 1" artifact (activation predictions, narrative teaching, knowledge checks, light/dark theme)

### Active

- [ ] Lessons covering the governmental accounting curriculum (book Ch. 1–12 focus: environment, principles, budgetary accounting, General Fund, capital assets/projects, long-term liabilities/debt service, proprietary funds, fiduciary funds, government-wide reporting, ACFR, financial analysis, auditing/budgeting basics)
- [ ] Graded practice problems: journal entries, reconciliations, classification exercises, fund statements
- [ ] Job-duty mapping: every job-description duty traces to lessons/problems that train it
- [ ] Progress persistence (localStorage — where the learner left off, problem scores)
- [ ] Mobile-first, works offline once loaded

### Out of Scope

- Nonprofit, health care, college/university, and federal accounting chapters (Ch. 13–17) — not needed for a county government job; may be v2
- Gamification (streaks, badges, unlockables) — learner chose lessons + practice problems; keep focus
- Quizzes/flashcards as a separate mode — knowledge checks live inside lessons instead
- Multi-user accounts, backend server, databases — single learner, static hosting
- Reproducing textbook text verbatim — repo is public; all content is original teaching material aligned to the book's topic structure

## Context

- Previous TaxApp PWA was wiped for this restart (recoverable in git history).
- The learner owns the physical/PDF book but the file cannot be transferred into this environment (Drive blocked by network policy, uploads unavailable). Workaround: content is generated from Claude's knowledge of GASB/governmental accounting, organized to mirror the book's chapters. The learner can paste specific book excerpts into chat anytime to fold them in.
- An existing artifact ("Governmental Accounting — Lesson 1", LO 1-1) defines the proven lesson style: example-first narrative, activation predictions, per-section knowledge checks, green-accented light/dark design. The app should feel like a continuation of it.
- Target job description (county Accountant I, reports to Assistant Financial Director) — the curriculum's requirements driver:
  - Balances and reconciles general ledger and subsidiary systems; examines transactions for accuracy; corrects records
  - Reviews contracts/agreements for budget appropriateness; reviews Commissioners Court agenda items (contracts, work authorizations, change orders)
  - Prepares grant reports; monitors grant expenditures/revenues; ensures grantor compliance
  - Creates and bills monthly/quarterly invoices; follows up past-due invoices
  - Assists with fixed asset recording and reporting; reviews/approves asset transfer forms
  - Prepares journal entries; assists with year-end procedures; classifies expenditures to the correct fiscal year
  - Prepares and reviews financial reports; assists with financial research and inquiries
- GitHub repo is public with Pages available — app should be a static site deployable there.

## Constraints

- **Hosting**: Static site (GitHub Pages) — no server, no build-time secrets
- **Platform**: Mobile-first responsive; offline-capable after first load
- **Copyright**: Original content only; topic alignment with the book is fine, verbatim reproduction is not
- **Environment**: Development happens in Claude Code cloud sessions; network egress is restricted (GitHub + package registries only)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Wipe old TaxApp, restart clean | Learner requested project restart | ✓ Good |
| Generate content from knowledge instead of ingesting book file | File transfer impossible in this environment; domain is standard and well-known | — Pending |
| Curriculum weighted by job description, not book order alone | Goal is job competence, not course completion | — Pending |
| Continue Lesson 1 artifact's example-first style | Already built and validated with the learner | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-11 after initialization*
