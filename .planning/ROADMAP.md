# Roadmap: Governmental Accounting Trainer

## Overview

The learner starts studying as soon as Phase 1 ships: a deployed, mobile-first vertical slice covering app shell, lesson renderer, progress persistence, and Chapter 1 (Environment & Principles) with graded journal-entry practice. The content schema is designed against the full 12-chapter curriculum during Phase 1 so later chapters never require engine changes. Phase 2 completes the practice-problem engine (classification, reconciliation, multi-part) while shipping Chapters 2-4 (Budgetary Accounting & Encumbrances, General Fund Operations, Capital Assets & Capital Projects). Phase 3 adds job-duty navigation, offline capability, and cross-device progress sync while shipping Chapters 5-8 (Long-term Liabilities/Debt Service, Proprietary Funds, Fiduciary Funds, Government-wide Reporting). Phase 4 finishes the curriculum with Chapters 9-12 (ACFR, Financial Analysis, Auditing & Budgeting Basics), completing full body-of-knowledge coverage weighted toward the target county Accountant I job description.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Vertical Slice — Chapter 1 Live** - App shell, lesson renderer, progress persistence, and journal-entry practice deployed live with Chapter 1
- [ ] **Phase 2: Practice Engine Expansion — Chapters 2-4** - Classification, reconciliation, and multi-part problem types plus missed-problem review, shipping Budgetary Accounting, General Fund, and Capital Assets chapters
- [ ] **Phase 3: Job-Duty Navigation, Offline & Sync — Chapters 5-8** - Job-duty coverage view, offline PWA, and progress export/import, shipping Long-term Liabilities, Proprietary Funds, Fiduciary Funds, and Government-wide Reporting chapters
- [ ] **Phase 4: Curriculum Completion — Chapters 9-12** - ACFR, Financial Analysis, and Auditing & Budgeting Basics chapters complete the full curriculum

## Phase Details

### Phase 1: Vertical Slice — Chapter 1 Live ✓ COMPLETE (2026-08-11)
**Goal**: Learner can complete Chapter 1 end-to-end today — read the lesson, answer knowledge checks, solve journal-entry problems with tolerant grading, and return later to find their place saved — on a live, mobile-friendly site. The content schema is designed against the full 12-chapter curriculum before any further chapter is authored.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: LESN-01, LESN-02, LESN-04, PRAC-01, PRAC-05, PROG-01, PLAT-01, PLAT-03
**Success Criteria** (what must be TRUE):
  1. Learner can open the Chapter 1 lesson at the public GitHub Pages URL on a phone and read example-first sections (activation prediction → narrative teaching → figures/comparisons → takeaway).
  2. Learner answers inline knowledge checks within each lesson section and receives immediate explanatory feedback.
  3. Learner works Chapter 1 journal-entry practice problems (dropdown/typeahead account picker, debit/credit entry) and receives line-by-line graded feedback that tolerates equivalent account names, order differences, and minor numeric formatting.
  4. Closing the browser and reopening later resumes exactly where the learner left off, with prior knowledge-check and problem scores intact.
  5. The chapter content file format is proven able to represent journal-entry, classification, reconciliation, and multi-part problem data for the full Ch1-12 curriculum, confirmed before Chapter 2 authoring begins.
**Plans**: 2/2 complete — see .planning/phases/01-vertical-slice/
**UI hint**: yes

### Phase 2: Practice Engine Expansion — Chapters 2-4
**Goal**: Learner can practice with the full range of core problem types (classification, reconciliation, multi-part) while progressing through Budgetary Accounting & Encumbrances, General Fund Operations, and Capital Assets & Capital Projects, and can revisit anything they got wrong.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: PRAC-02, PRAC-03, PRAC-04, PRAC-06
**Success Criteria** (what must be TRUE):
  1. Learner can work classification problems (fund type, modified vs. full accrual, expenditure/fiscal-year classification) for Chapter 2-4 topics with instant feedback.
  2. Learner can work reconciliation worksheet problems graded per step with partial credit.
  3. Learner can work multi-part, CPA-simulation-style problems with per-step feedback.
  4. Learner can open a filtered list of previously missed problems, spanning all problem types, and retry them.
  5. Chapters 2 (Budgetary Accounting & Encumbrances), 3 (General Fund Operations), and 4 (Capital Assets & Capital Projects) are live and reachable through normal chapter navigation, each following the example-first lesson format with knowledge checks.
**Plans**: TBD

### Phase 3: Job-Duty Navigation, Offline & Sync — Chapters 5-8
**Goal**: Learner can navigate the curriculum by real job duty instead of only chapter order, keep studying with no internet connection, and move progress between devices, while working through Long-term Liabilities & Debt Service, Proprietary Funds, Fiduciary Funds, and Government-wide Reporting.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: JOB-01, JOB-02, PLAT-02, PROG-02
**Success Criteria** (what must be TRUE):
  1. Learner can open a coverage view showing every job-description duty mapped to the lessons/problems that train it.
  2. Learner can browse the curriculum by job duty (e.g., "grant reporting") as an alternative to chapter order.
  3. Learner can open the app with the device offline (after one prior visit) and continue studying already-loaded chapters and problems.
  4. When a new version is deployed, the learner sees a visible update prompt rather than silently using stale cached content.
  5. Learner can export progress as a JSON file and import it in another browser/device to continue where they left off.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Curriculum Completion — Chapters 9-12
**Goal**: The full governmental accounting curriculum (book Ch. 1-12 equivalents), weighted toward the target county Accountant I job description, is live and study-ready.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: LESN-03
**Success Criteria** (what must be TRUE):
  1. Learner can study the ACFR, Financial Analysis, and Auditing & Budgeting Basics chapters in the same example-first lesson format as Chapter 1.
  2. Every remaining chapter's practice problems use the four established problem types (journal entry, classification, reconciliation, multi-part) with the same tolerant grading as earlier chapters.
  3. The job-duty coverage view (built in Phase 3) shows every job-description duty resolved to at least one lesson or problem across the finished 12-chapter curriculum.
  4. Learner can navigate all 12 chapters, in any order, with resume-where-left-off working across the whole curriculum.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Vertical Slice — Chapter 1 Live | 0/TBD | Not started | - |
| 2. Practice Engine Expansion — Chapters 2-4 | 0/TBD | Not started | - |
| 3. Job-Duty Navigation, Offline & Sync — Chapters 5-8 | 0/TBD | Not started | - |
| 4. Curriculum Completion — Chapters 9-12 | 0/TBD | Not started | - |
</content>
