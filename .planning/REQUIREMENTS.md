# Requirements: Governmental Accounting Trainer

**Defined:** 2026-08-11
**Core Value:** The learner finishes able to confidently perform every duty in the target county Accountant I job description under GAAP/GASB.

## v1 Requirements

### Lessons

- [x] **LESN-01**: Learner can open any chapter lesson, organized in short example-first sections (activation prediction → narrative teaching → figures/comparisons → takeaway), in the style of the validated Lesson 1 artifact
- [x] **LESN-02**: Learner answers inline knowledge checks inside each lesson section and gets immediate explanatory feedback
- [ ] **LESN-03**: Curriculum covers the governmental accounting body of knowledge (book Ch. 1–12 equivalents: environment & principles, budgetary accounting & encumbrances, General Fund operations, capital assets & capital projects, long-term liabilities & debt service, proprietary funds, fiduciary funds, government-wide reporting, ACFR, financial analysis, auditing & budgeting basics), weighted toward the job description
- [x] **LESN-04**: Learner can navigate chapters/sections freely and resume exactly where they left off

### Practice

- [x] **PRAC-01**: Learner can work journal-entry problems — pick accounts (dropdown/typeahead, mobile-friendly), enter debits/credits — and get graded with line-by-line feedback
- [ ] **PRAC-02**: Learner can work classification problems (fund type, modified vs full accrual, expenditure/fiscal-year classification) with instant feedback
- [ ] **PRAC-03**: Learner can work reconciliation worksheet problems graded per step with partial credit
- [ ] **PRAC-04**: Learner can work multi-part problems (CPA-simulation style) with per-step feedback
- [x] **PRAC-05**: Grading is tolerant — numeric tolerance, order-insensitive journal lines, equivalent account-name acceptance — with explanations for wrong answers
- [ ] **PRAC-06**: Learner can review and retry missed problems from a filtered list

### Job Mapping

- [ ] **JOB-01**: Every job-description duty is mapped to the lessons/problems that train it, visible as a coverage view
- [ ] **JOB-02**: Learner can browse the curriculum by job duty (e.g., "grant reporting") as an alternative to chapter order

### Progress

- [x] **PROG-01**: Progress (completed sections, knowledge-check results, problem scores) persists locally across visits (localStorage, quota-safe)
- [ ] **PROG-02**: Learner can export progress as JSON and import it on another device/browser

### Platform

- [x] **PLAT-01**: Mobile-first responsive UI with light/dark theme, continuing the Lesson 1 artifact's visual language
- [ ] **PLAT-02**: App works offline after first load (service worker, versioned cache, visible update prompt when a new version deploys)
- [x] **PLAT-03**: App is deployed and reachable at a public GitHub Pages URL, updated by pushing to the repo

## v2 Requirements

### Content

- **CONT-V2-01**: Nonprofit/health care/university/federal chapters (book Ch. 13–17)
- **CONT-V2-02**: Glossary with search
- **CONT-V2-03**: Expanded problem banks per chapter

### Study Tools

- **TOOL-V2-01**: Spaced-repetition scheduling of missed items

## Out of Scope

| Feature | Reason |
|---------|--------|
| Gamification (streaks, badges, unlockables) | Learner explicitly declined; focus on lessons + practice |
| Separate flashcard/quiz modes | Knowledge checks live inside lessons; avoids mode sprawl |
| Multi-user accounts, backend, database | Single learner, static hosting only |
| Verbatim textbook text | Public repo; original content aligned to topics only |
| Drag-and-drop problem interactions | Poor on mobile; dropdown/typeahead instead |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LESN-01 | Phase 1 | Complete |
| LESN-02 | Phase 1 | Complete |
| LESN-03 | Phase 4 | Pending |
| LESN-04 | Phase 1 | Complete |
| PRAC-01 | Phase 1 | Complete |
| PRAC-02 | Phase 2 | Pending |
| PRAC-03 | Phase 2 | Pending |
| PRAC-04 | Phase 2 | Pending |
| PRAC-05 | Phase 1 | Complete |
| PRAC-06 | Phase 2 | Pending |
| JOB-01 | Phase 3 | Pending |
| JOB-02 | Phase 3 | Pending |
| PROG-01 | Phase 1 | Complete |
| PROG-02 | Phase 3 | Pending |
| PLAT-01 | Phase 1 | Complete |
| PLAT-02 | Phase 3 | Pending |
| PLAT-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-11*
*Last updated: 2026-08-11 after roadmap creation*
</content>
