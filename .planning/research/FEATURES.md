# Feature Research

**Domain:** Self-paced technical/accounting courseware (single-learner, static-site edtech)
**Researched:** 2026-08-11
**Confidence:** MEDIUM

Confidence is MEDIUM rather than HIGH because most patterns are verified against multiple credible sources (CPA review platforms, academic courseware vendors, Khan Academy engineering write-ups) via WebSearch rather than Context7/official API docs — this is a UX/pedagogy domain, not a library-API domain, so there is no primary "documentation" source to check against. Confidence is upgraded from LOW because every major claim below was corroborated by 2+ independent sources (e.g., per-step partial credit confirmed by three separate CPA-prep sources; step-by-step hint pattern confirmed by Khan Academy's own blog and third-party engineering analysis).

## Feature Landscape

### Table Stakes (Users Expect These)

Features a self-study accounting app needs or the learning experience feels broken, even for an audience of one.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Structured lessons organized by topic/chapter | Every accounting courseware product (Becker, Wiley, Connect, the book itself) is organized as sequential topic units; the learner already validated this with Lesson 1 | LOW | Mirrors book's chapter structure per PROJECT.md; static content, no CMS needed |
| In-lesson knowledge checks | Already proven with learner via Lesson 1 prototype; academic courseware (Connect, WileyPLUS) and Khan Academy both interleave short checks with instruction rather than saving all assessment for the end | LOW–MEDIUM | Reuse the same answer-checking/feedback component practice problems use (see Dependencies) |
| Immediate feedback with explanation (not just right/wrong) | CPA review and Connect/WileyPLUS both treat "why" as core to the product, not an add-on; Khan Academy's hint system is built around progressively revealing the reasoning, not just marking wrong | MEDIUM | Must write an explanation for every problem/knowledge-check answer, not just a correct-value check |
| Journal entry input interaction (debit/credit entry form) | The single most common accounting-specific interaction pattern across every courseware product studied (Connect, WileyPLUS, patented "simulation enabled accounting tutorial" systems); a self-study app without this reduces every JE lesson to multiple choice, which doesn't build the actual job skill | MEDIUM–HIGH | Account selection (dropdown/typeahead, not drag-and-drop — see Anti-Features notes) + debit/credit amount columns + running balance check; needs a per-lesson chart of accounts data structure |
| Graded practice problems separate from knowledge checks | Knowledge checks confirm understanding of a concept just taught; practice problems (in the learner's own words) exercise the skill after the lesson, closer to how CPA-prep MCQs/TBS and academic homework sets work | LOW (reuses JE/feedback components) | This is explicitly requested in PROJECT.md — distinct from in-lesson checks |
| Scoring/results per problem and per lesson | Every reviewed platform surfaces "how did I do" at the problem and section level; without it, a self-grading learner can't tell mastery from guessing | LOW | Simple percentage/correct-count; no leaderboard or comparison needed (single learner) |
| Progress persistence (resume where left off) | Universal expectation for any multi-session self-paced course; OfflineU and similar self-hosted course tools treat "continue where you left off" as core, not optional | LOW–MEDIUM | localStorage: last lesson/section viewed + per-problem score history; must survive tab close/reopen |
| Mobile-first responsive layout | Learner uses this heavily on mobile per PROJECT.md; every modern courseware product treats mobile as first-class, and a JE grid/table that only works on desktop breaks the primary use case here | MEDIUM | JE/reconciliation grids are the hard part on small screens — needs deliberate compact layout, not just responsive CSS |
| Offline capability after first load | Explicit constraint in PROJECT.md; also a reasonable table-stakes expectation for a static, no-backend app used on mobile (spotty connectivity) | MEDIUM | Service worker + cache-first static assets; all grading logic must run client-side (already implied by no-backend architecture) |
| Table of contents / navigation across lessons | Baseline wayfinding for any multi-lesson course; without it the app feels like a pile of pages, not a course | LOW | Simple static nav; can double as a visual progress indicator |

### Differentiators (Competitive Advantage)

Features that make this app better than just reading the textbook or using generic CPA-prep tools — and that generic tools don't offer because they don't target this exact use case.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Job-duty-to-lesson/problem traceability map | No CPA-prep or academic courseware product maps content to a specific job description — they map to exam blueprints or textbook chapters. This is the app's actual differentiator per PROJECT.md ("every job-description duty traces to lessons/problems"). Skills/competency-matrix practice (mapping competencies × content, gap-driven prioritization) is well-established in corporate L&D but not in accounting courseware — genuinely novel combination here | MEDIUM | Requires tagging lessons/problems with job-duty IDs (GL reconciliation, budget review, grant reporting, fixed assets, invoicing, year-end close, financial reports); a simple "coverage view" (which duties have content, which are practiced) is high value for low build cost |
| Multi-step problems with per-step feedback (partial-credit style) | CPA Task-Based Simulations exist specifically because single-answer MCQs can't assess multi-step real-world work like reconciliations and fund statements — TBS grade "the candidate's approach... as much as the final answer," with per-response credit. This pattern directly fits the learner's explicit ask (reconciliations, fund statements as graded practice) | HIGH | Needs a step-based problem schema (array of sub-answers, each independently checked) rather than one-answer-in/one-answer-out; reuse across JE, reconciliation, and fund-statement problem types |
| Reconciliation worksheet problem type | Distinct interaction pattern from JE grids — a two-column worksheet (book side vs. bank/GL side) with add/subtract adjustment line items reaching a matched balance. Existing tools (Money Instructor's checkbook worksheet generator, Pearson's reconciliation practice) confirm this as a standard, expected format once you look past generic MCQ, but it's not something generic CPA-prep software (JE/MCQ-focused) provides well | MEDIUM–HIGH | Structured entry form: outstanding items list + running adjusted balances on both sides, checked against each other at submission |
| Fund statement / classification builder problem type | Governmental accounting's signature skill (classifying transactions into the correct fund, building a fund-level or government-wide statement) has no direct analog in general CPA-prep or intro-accounting courseware — closest is WileyPLUS's "gradable Excel assignments" for statement building, but that requires a spreadsheet engine. A purpose-built lightweight version (drag-into-bucket or select-classification UI over a statement template) is a genuine differentiator matched to the actual target skill | HIGH | Highest-complexity problem type; likely built last, after JE and reconciliation patterns are proven |
| Job-relevance-weighted curriculum ordering (not pure textbook order) | PROJECT.md explicitly chose this over following the book linearly. No off-the-shelf courseware does this because they serve many learners with many goals; a single-learner app tailored to one job description can | LOW (content/sequencing decision, not a software feature per se) | Low build cost, high alignment value — mostly a content-authoring decision reflected in the TOC ordering |
| Missed-problem review/retry mode | Not spaced-repetition flashcards (explicitly rejected) — instead, a simple filtered view of "problems you got wrong" that lets the learner re-attempt them, similar in spirit to Becker/Surgent's "predicts knowledge gaps" adaptive engines but implemented as a static, non-adaptive filter rather than an AI-driven engine | LOW–MEDIUM | Depends on problem-level score history already being persisted; just needs a query/filter view, not new grading logic |
| Continuation of Lesson 1's example-first narrative + light/dark theme | Already validated with the learner; consistency across all lessons compounds the value of the proven format rather than reinventing style per chapter | LOW | Design-system/content-template concern, not a new engineering feature |

### Anti-Features (Commonly Requested, Often Problematic)

Features that appear in comparable products but are explicitly wrong for this project, or that look appealing but would blow the scope/architecture.

| Feature | Why Requested (elsewhere) | Why Problematic (here) | Alternative |
|---------|---------------------------|------------------------|-------------|
| Gamification (streaks, badges, XP, unlockables) | Common in consumer edtech (Duolingo-style) to drive daily engagement across many users | Explicitly rejected in PROJECT.md; for a single self-directed adult learner studying for a specific job, extrinsic game mechanics add complexity without matching motivation (the job itself is the motivator) | Plain progress indicators (percent complete, mastery status) with no points/rewards framing |
| Separate flashcard/SRS study mode | Standard in CPA-prep suites (Becker, Gleim) for memorization-heavy exam content | Explicitly rejected in PROJECT.md; learner wants knowledge checks embedded in lessons instead, which already provide retrieval practice in context | Keep knowledge checks inside lessons; if spaced re-practice is ever wanted, reuse the missed-problem review filter rather than building a second SRS system |
| Multi-user accounts / login / social features | Standard for any commercial LMS or courseware platform serving many students | Explicitly rejected — single learner, static hosting, no backend, no auth infrastructure desired | None needed; app has exactly one implicit "user" |
| Backend server, database, real-time sync | Needed by commercial platforms for grading at scale, cohort analytics, cross-device sync | Explicitly rejected — GitHub Pages static hosting, no server, no build-time secrets per PROJECT.md constraints | All grading logic runs client-side; state lives in localStorage |
| Video lectures / narrated walkthroughs (Becker/Connect pattern) | High production value, feels premium, common in paid CPA-prep and academic courseware | High cost to produce (recording, editing, hosting large media files) for a single learner and a static-site/no-backend constraint; video hosting on GitHub Pages is impractical at scale | Text + example-first narrative lessons (already the proven format) with optional inline diagrams/tables |
| AI-driven adaptive study-path engine (Becker SkillMaster / Surgent A.S.P.A. style) | Marketed as a major differentiator by commercial CPA-prep vendors, "predicts knowledge gaps" and reorders study plan automatically | High engineering complexity (needs a scoring model, decision logic, likely a backend) for a single learner who already knows their own weak areas from job-duty coverage and missed-problem review | Simple, transparent coverage view (per Differentiators) the learner reads themselves — no hidden algorithm needed |
| Drag-and-drop account selection in JE entry | Used by some legacy accounting-tutorial systems (see patented "simulation enabled accounting tutorial" systems) as a skeuomorphic ledger metaphor | Drag-and-drop is notoriously fragile on mobile touchscreens (the primary usage context here per PROJECT.md) — precision dragging of small targets causes frustration | Dropdown/typeahead account selector + numeric debit/credit input fields, which is both easier to build and more mobile-friendly |
| Gradable Excel-based assignments (WileyPLUS pattern) | Popular in academic courseware because it builds transferable spreadsheet skills and leverages a tool students already have | Requires either a spreadsheet-formula-parsing engine or an actual Excel/Sheets integration — heavy dependency for a static offline-capable app with no backend | Purpose-built lightweight grid/worksheet UI components (JE grid, reconciliation worksheet) that mimic the relevant skill without needing spreadsheet infrastructure |
| Timed full-length mock exams (CPA-style) | Central feature of every CPA-review product, since the target outcome there is passing a timed exam | This app's target outcome is job competence, not passing a timed exam — the county Accountant I role doesn't require timed simulation performance; building exam-timer infrastructure would be scope creep away from the stated goal | Untimed practice problems graded for correctness/completeness only |
| Cross-device cloud sync of progress | Reasonable to want given heavy mobile use plus possible desktop use | Requires a backend/auth, explicitly out of scope | Acceptable localStorage-per-device limitation for v1; if it becomes a real pain point, a manual "export/import progress as JSON" button is a low-complexity escape hatch worth considering for v1.x (not true sync, but portable) |

## Feature Dependencies

```
Progress Persistence (localStorage schema: lesson completion, problem scores)
    └──requires──> None (foundational, build first)

In-Lesson Knowledge Checks
    └──requires──> Answer-checking/feedback component (shared)

Graded Practice Problems (Journal Entry type)
    └──requires──> Answer-checking/feedback component (shared)
    └──requires──> Per-lesson chart of accounts data
    └──requires──> Progress Persistence (to store scores)

Multi-Step Problems (Reconciliation, Fund Statement types)
    └──requires──> Step-based problem schema (extends single-answer schema)
    └──requires──> Answer-checking/feedback component (shared, extended for partial credit)

Missed-Problem Review/Retry Mode
    └──requires──> Progress Persistence (problem-level score history)
    └──requires──> Graded Practice Problems (needs problems to have been attempted)

Job-Duty Traceability Map / Coverage View
    └──requires──> Lesson & problem content tagged with job-duty IDs
    └──enhances──> Curriculum ordering decisions (informs what to build/sequence next)

Mobile-First Responsive Layout ──enhances──> Journal Entry / Reconciliation / Fund Statement UIs
    (these grid-heavy interactions are the highest mobile-layout risk; test them first, not last)

Offline Capability (service worker) ──requires──> All grading logic client-side
    (already implied by no-backend constraint; no separate feature work if grading is
    correctly built client-side from the start)

Gamification ──conflicts──> Plain Progress Indicators
    (explicitly rejected; do not let "just add a streak counter" creep into progress persistence work)

Flashcard/SRS Mode ──conflicts──> Missed-Problem Review/Retry Mode
    (these solve overlapping "revisit weak areas" needs; build only the latter, not both)
```

### Dependency Notes

- **Progress Persistence is foundational** and should land before or alongside the first graded practice problems — it's low complexity but everything else (resume, review, coverage tracking) reads from it.
- **The answer-checking/feedback component should be built once and shared** between in-lesson knowledge checks and standalone graded practice problems — both need "compare answer, show correct/incorrect, show explanation." Building two separate systems would be wasted effort.
- **Multi-step problems (reconciliation, fund statements) extend rather than replace** the single-answer problem schema used by journal entries — design the schema from the start to support an array of sub-answers with independent grading, even if the first problem type (JE) only ever uses one.
- **Job-duty traceability depends on content tagging, not new UI complexity** — the highest-value differentiator here is mostly a content/data-modeling decision (tag every lesson and problem with the job duties it trains) plus a simple view, not a hard engineering problem.
- **Missed-problem review and flashcard/SRS modes conflict** in the sense that they both address "help me revisit what I got wrong" — building the simpler filtered-review version satisfies the need without violating the explicit anti-flashcard requirement.

## MVP Definition

### Launch With (v1)

Minimum viable product — validates the core teach-then-practice loop for at least one full topic area (e.g., General Fund / budgetary accounting).

- [ ] Structured lessons (example-first narrative, per existing Lesson 1 style) — the proven format, core content delivery
- [ ] In-lesson knowledge checks — already validated, reuses shared feedback component
- [ ] Journal entry graded practice problems with immediate feedback + explanations — the single most common accounting interaction, directly requested
- [ ] Progress persistence (last position, per-problem scores) in localStorage — required for any usable multi-session app
- [ ] Mobile-first responsive layout, tested specifically on the JE grid interaction — this is where mobile-first is hardest and most necessary
- [ ] Basic job-duty tagging visible per lesson (even a simple label/list, not a full dashboard) — cheap to add now, expensive to retrofit later if tagging isn't designed in from the start

### Add After Validation (v1.x)

Add once the core lesson+JE-practice loop is proven to work for the learner across a few chapters.

- [ ] Reconciliation worksheet problem type — trigger: once JE problem schema is stable, extend to the next interaction pattern the learner explicitly asked for
- [ ] Multi-step/partial-credit grading for reconciliations and fund statements — trigger: needed as soon as reconciliation/fund-statement problems exist, since single-answer grading doesn't fit them
- [ ] Missed-problem review/retry filter — trigger: once enough problems exist that "what did I get wrong" becomes genuinely useful (not needed for a 5-problem MVP chapter)
- [ ] Job-duty coverage dashboard (visual matrix: duty × lessons/problems, coverage status) — trigger: once enough chapters exist that manually scanning for gaps stops being easy
- [ ] Offline/service-worker caching refinement (full offline-first, not just "loads fast") — trigger: once content volume is large enough that reload-from-scratch on flaky mobile connections becomes a real annoyance
- [ ] Fund statement / classification builder problem type — trigger: after reconciliation pattern is proven, since this is the highest-complexity problem type

### Future Consideration (v2+)

Defer until the core county-Accountant-I curriculum (book Ch. 1–12) is complete and validated.

- [ ] Nonprofit/health care/college/federal accounting chapters (book Ch. 13–17) — already marked Out of Scope in PROJECT.md; only relevant if the learner's job scope changes
- [ ] Manual export/import of progress as JSON (device-portability workaround, not true sync) — defer until cross-device use is an actual observed pain point, not a hypothetical one
- [ ] Printable/exportable summary sheets per topic — nice-to-have study aid, not core to the teach-practice loop

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Structured lessons (example-first) | HIGH | LOW | P1 |
| In-lesson knowledge checks | HIGH | LOW | P1 |
| Journal entry graded problems | HIGH | MEDIUM | P1 |
| Progress persistence / resume | HIGH | LOW | P1 |
| Mobile-first JE/reconciliation grid layout | HIGH | MEDIUM | P1 |
| Job-duty tagging (basic, per-lesson) | HIGH | LOW | P1 |
| Reconciliation worksheet problem type | HIGH | MEDIUM-HIGH | P2 |
| Multi-step/partial-credit grading | HIGH | HIGH | P2 |
| Missed-problem review/retry | MEDIUM | LOW-MEDIUM | P2 |
| Job-duty coverage dashboard | MEDIUM | MEDIUM | P2 |
| Fund statement builder problem type | HIGH | HIGH | P2 |
| Offline/service-worker polish | MEDIUM | MEDIUM | P2 |
| Progress export/import (JSON) | LOW-MEDIUM | LOW | P3 |
| Printable summary sheets | LOW | LOW | P3 |
| Ch. 13–17 (nonprofit/federal) content | LOW (out of scope) | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

Note: none of these products target governmental/GASB accounting for a specific job description — they are the closest available reference points for interaction patterns and pedagogy, not direct competitors.

| Feature | CPA Review (Becker / UWorld / Gleim) | Academic Courseware (McGraw-Hill Connect / WileyPLUS) | Our Approach |
|---------|----------------------------------------|----------------------------------------------------------|--------------|
| Multi-step problem grading | Task-Based Simulations with per-response partial credit; ~35–50% of exam weight | Algorithmic exercises with narrated step-by-step walkthroughs | Step-based problem schema with per-step feedback, applied specifically to reconciliations and fund statements (our highest-value, most job-relevant skill) |
| Journal entry interaction | MCQ-heavy with some TBS entry grids | Homework-set style entry forms, often auto-graded for value or formula | Dropdown/typeahead account selector + debit/credit numeric grid, mobile-optimized |
| Progress/adaptivity | AI-driven adaptive engines (SkillMaster, A.S.P.A.) that reorder study plan | Instructor-configured, analytics-dashboard-heavy (built for classes, not solo learners) | Simple, transparent progress state (completed/scores) with a manual missed-problem filter — no hidden adaptive algorithm, no instructor-facing analytics |
| Curriculum-to-goal mapping | Maps to exam blueprint (AICPA content specifications) | Maps to textbook chapter/learning objectives | Maps to the actual county Accountant I job description — the core differentiator no competitor product offers |
| Timed testing | Central feature (full mock exams simulate exam-day timing) | Occasional timed quizzes, instructor-configured | Explicitly excluded — job competence goal doesn't require timed performance |
| Video content | Central feature (hours of recorded lectures) | Common (embedded lecture videos) | Excluded — static-site/no-backend constraint plus proven text-first lesson format |
| Engagement mechanics | Study planners, streak-adjacent progress tracking, sometimes gamified elements | Instructor-driven deadlines/points (class context) | None — explicitly rejected per PROJECT.md |

## Sources

- UWorld / Becker CPA review course comparisons (practice question interfaces, adaptive tech): https://accounting.uworld.com/cpa-review/best-cpa-review-courses-and-study-materials/ — MEDIUM confidence (marketing content, cross-checked against multiple CPA-prep comparison sources)
- CPA Task-Based Simulation partial-credit grading (multiple corroborating sources): https://www.mileseducation.com/blog/accounting/how-to-master-task-based-simulations-in-cpa, https://www.myaccountingcourse.com/cpa-exam-task-based-simulations — MEDIUM-HIGH confidence (consistent across 3+ independent sources)
- McGraw-Hill Connect and WileyPLUS accounting feature descriptions (auto-graded feedback, gradable Excel assignments): https://www.mheducation.com/highered/discipline/accounting.html, https://www.wileyplus.com/accounting/intermediate-accounting-19th-edition-eprof23641/ — MEDIUM confidence (vendor descriptions)
- Legacy patented "simulation enabled accounting tutorial system" (drag-and-drop JE interaction, feedback categorization) — LOW-MEDIUM confidence (patent filings describe intended design, not necessarily current best practice; used here mainly to identify the drag-and-drop anti-pattern for mobile)
- Money Instructor bank reconciliation worksheet generator, Pearson reconciliation practice: https://moneyinstructor.com/teaching/worksheet-generators/balancing-a-checkbook/, https://www.pearson.com/channels/financial-accounting/exam-prep/ch-6-internal-controls-and-reporting-cash/bank-reconciliation — MEDIUM confidence (confirms reconciliation worksheet as an established, distinct practice-problem format)
- Khan Academy exercise/hint design pattern (step-by-step hints as worked examples, immediate feedback): https://blog.khanacademy.org/how-should-people-practice-on-khan-academy/, https://www.technologyimprov.com/posts/khan-academy-building-an-exercise-part-1/ — MEDIUM-HIGH confidence (official blog + independent engineering analysis agree)
- Self-paced course progress tracking / resume patterns (OfflineU, general self-hosted LMS guidance): https://github.com/WhiskeyCoder/OfflineU, https://accessally.com/blog/how-to-track-student-progress-in-your-online-course-complete-guide/ — MEDIUM confidence (general pattern, not accounting-specific, but broadly applicable and low-risk)
- Skills matrix / competency mapping in corporate L&D (job-task-analysis-driven curriculum design): https://www.ag5.com/competency-matrix/, https://www.workhuman.com/blog/skills-matrix/ — MEDIUM confidence (establishes that competency-mapped training is a recognized L&D pattern, applied here by analogy since no accounting-courseware product does this against a specific job description)
- .planning/PROJECT.md — HIGH confidence (primary source for explicit requirements, constraints, and rejected features)

---
*Feature research for: Self-paced governmental accounting trainer (single learner, county Accountant I job prep)*
*Researched: 2026-08-11*
