# Pitfalls Research

**Domain:** Personal educational web app (static PWA) teaching governmental accounting via AI-generated curriculum
**Researched:** 2026-08-11
**Confidence:** MEDIUM-HIGH (PWA/storage mechanics are HIGH confidence, verified against MDN/web.dev; domain-content and educational-app pitfalls are MEDIUM — verified against CPA-exam-prep and accounting-education sources plus general knowledge of GASB fund accounting; AI-hallucination-in-curriculum findings are MEDIUM, drawn from recent education-research literature)

## Critical Pitfalls

### Pitfall 1: The Content Treadmill (engine finished, curriculum never is)

**What goes wrong:**
The lesson viewer, practice-problem grader, progress tracker, and theming are all built and polished — and then the project stalls because writing 12+ chapters of accurate, original lesson content (with worked examples, knowledge checks, and graded problems for each) is 10x the effort of building the shell. This is the single most common failure mode for solo-built educational tools: the "app" ships, the "course" doesn't. Six months later there's a beautiful lesson player with 1.5 chapters of content and momentum is gone.

**Why it happens:**
Building infrastructure has visible, satisfying progress (a working page, a passing test). Writing correct, pedagogically sound accounting content chapter-by-chapter is slow, repetitive, and each chapter requires the same amount of careful verification work as the last — there's no way to "engineer around" the labor. Solo builders (and AI assistants prompted to "build the app") default to infrastructure work because it's the fun/legible part.

**How to avoid:**
- Sequence the roadmap so content production starts in the *same phase* as the lesson-viewer shell, not after it — build one real chapter end-to-end (lesson + knowledge checks + practice problems) before generalizing the engine further.
- Treat "chapters completed" as the primary roadmap milestone unit, not "features shipped."
- Write content in a structured format (e.g., JSON/YAML/Markdown-with-frontmatter per lesson) from day one so authoring doesn't require touching app code — this decouples "is the engine done" from "is the content done" and makes partial progress visible and resumable.
- Cap engine scope explicitly (PROJECT.md already does this well: no gamification, no multi-mode). Resist scope creep on the player before content catches up.

**Warning signs:**
- More commits touching `/src` (or component/engine code) than commits touching `/content` (or lesson data) after the first 2 weeks.
- A "lesson template" or "problem schema" gets redesigned more than once before 3 full chapters exist using it.
- Chapters 1-2 are polished (multiple passes) while chapters 3+ don't exist yet.

**Phase to address:** Should be a structural concern baked into roadmap phase *ordering* — recommend an early phase that produces one complete chapter (content + grading + persistence) as a vertical slice, before a later phase generalizes the engine for all remaining chapters.

---

### Pitfall 2: Passive-reading lessons disguised as "active practice"

**What goes wrong:**
Knowledge checks that are really just "click to reveal the answer" or multiple-choice recognition questions feel like practice but don't build the procedural skill the job actually requires (e.g., preparing a journal entry from a transaction narrative, reconciling a subsidiary ledger). The learner can pass every in-lesson check yet freeze on a real graded problem or on the job, because recognition ("which of these is correct?") is a much weaker skill than production ("write the journal entry yourself").

**Why it happens:**
Multiple-choice / true-false checks are far easier to build and grade than free-form numeric/text entry with tolerant matching, so the app (and the AI generating it) gravitates toward the easy grading format even when the stated goal is "graded practice problems." This is especially tempting under a static-site constraint (no server-side grading logic beyond what runs in the browser).

**How to avoid:**
- Reserve multiple-choice / classification questions for concept checks *inside* lessons (e.g., "which fund type is this?").
- Require the graded practice-problem set for each chapter to include production-style tasks: enter debit/credit amounts, name the accounts, compute a reconciling balance — not just recognition.
- Design the job-duty mapping (already an Active requirement) so each duty has at least one production-style problem, not just a knowledge check.

**Warning signs:**
- All "practice problems" in a chapter are multiple-choice.
- No problem type requires the learner to type in an account name or a dollar amount and have it validated.

**Phase to address:** Practice-problem/grading-engine design phase — grading engine should support free-text/numeric entry from the start, not be bolted on later after MC-only problems are already written for several chapters.

---

### Pitfall 3: Overly strict answer grading frustrates instead of teaches

**What goes wrong:**
Numeric and text-entry grading that requires exact string/number matches punishes trivial formatting differences — "$1,200" vs "1200" vs "1,200.00", "Accounts Receivable" vs "A/R" vs "accounts receivable", a journal entry line entered in a different (but equally valid) account order. The learner gets marked wrong for reasons unrelated to accounting knowledge, which is especially corrosive in a self-paced app with no instructor to appeal to — it erodes trust in the grader and, over time, trust in the whole app.

**Why it happens:**
Exact-match grading is the simplest thing to implement client-side. Building genuinely tolerant grading (normalize whitespace/currency formatting, accept numeric equivalence, accept order-independent journal-entry line matching, accept common valid abbreviations) is meaningfully more work and easy to defer, then never revisited once "grading works" in the demo case.

**How to avoid:**
- Normalize before comparing: strip `$`, commas, whitespace; parse to a number and compare with rounding tolerance for numeric answers.
- For account-name entry, match against a small alias list per account (or better: use a constrained input — dropdown/autocomplete over the chart of accounts — instead of free text, sidestepping the matching problem entirely for account names while keeping free numeric entry for amounts).
- For multi-line journal entries, grade debit/credit pairs as an unordered set, not a positionally exact sequence.
- Always show *why* an answer was marked wrong (e.g., "you entered $1,200 but expected $12,000 — check your decimal") rather than a bare pass/fail, since this is a single learner who needs to self-diagnose without a teacher.

**Warning signs:**
- Grading logic is a single `===` or string-equality check.
- No test cases exist for "correct answer, different formatting."
- Learner (in practice) starts getting marked wrong on answers they know are correct — the earliest and most important signal.

**Phase to address:** Grading-engine phase — this should have explicit acceptance criteria for tolerant matching, not just "grades the answer."

---

### Pitfall 4: Service worker cache staleness — learner stuck on an old version

**What goes wrong:**
A classic PWA trap: the service worker's default lifecycle keeps an old cached version active until all tabs of the app are closed and reopened, so after you push a content update (new chapter, bug-fixed problem) the learner keeps seeing the stale cached version indefinitely — especially bad for a single-page mobile PWA that's rarely fully closed. Confirmed in current PWA best-practice writeups (2025-2026): "the browser does not activate a new Service Worker until the old one serves at least one open tab," which in practice means updates get stuck in the queue.

**Why it happens:**
The service worker update lifecycle (install → waiting → activate) is intentionally conservative to avoid changing caching behavior mid-session, but most tutorials don't cover the `skipWaiting()` + `clients.claim()` pattern needed to make updates actually take effect promptly, and it's easy to ship a "works on my machine" service worker that never surfaces this problem until the app has been live for a few deploys.

**How to avoid:**
- Version the cache name on every deploy (e.g., include a build hash or content-version string in the cache key) so old caches are identifiable and purged.
- Use `skipWaiting()` in the service worker and `clients.claim()` on activate, combined with an explicit "Update available — reload" prompt in the UI (don't force-reload silently, since the learner may be mid-problem).
- Use a network-first or stale-while-revalidate strategy for the app shell/content JSON, and cache-first only for truly static assets (fonts, icons).
- Never cache the service worker file itself.

**Warning signs:**
- After deploying a content fix, manually reloading the PWA on a phone doesn't show the fix (only a full uninstall/reinstall does).
- No visible "new version available" mechanism exists in the UI.
- Cache name is a static string that never changes across deploys.

**Phase to address:** PWA/offline-support phase — should include an explicit "update flow" as an acceptance criterion, verified by actually deploying a change and confirming a live install picks it up.

**Sources:** [web.dev — Update lifecycle](https://web.dev/learn/pwa/update/), [Taming PWA Cache Behavior](https://iinteractive.com/resources/blog/taming-pwa-cache-behavior)

---

### Pitfall 5: localStorage limits, eviction, and silent progress loss

**What goes wrong:**
Progress persistence (lesson position, problem scores) lives in `localStorage`, which is capped around 5 MiB per origin in most browsers (Safari iOS enforces this strictly), is subject to LRU eviction under device storage pressure, and — critically for Safari — **installed PWAs on iOS are exempt from the 7-day inactivity eviction that regular Safari tabs get, but data can still be cleared if the user clears site data, reinstalls the PWA, or hits the quota.** A `QuotaExceededError` thrown on write with no try/catch will silently fail to save progress, and the learner won't discover it until they lose work.

**Why it happens:**
5 MiB feels unlimited during early development with a handful of chapters, so quota handling is skipped. Nobody tests what happens when `localStorage.setItem` throws, or what happens to progress if the learner reinstalls the PWA or clears Safari data (a routine action many iOS users take periodically).

**How to avoid:**
- Wrap all `localStorage` writes in try/catch; on `QuotaExceededError`, alert the user visibly rather than failing silently.
- Keep persisted data lean: store scores/completion flags/timestamps, not full problem content or lesson text, in localStorage.
- Provide an explicit export/import (e.g., "copy your progress as text" or download a JSON file) so the learner has a manual backup path independent of browser storage — critical given this is a single learner with no backend/account system to fall back on.
- Consider `IndexedDB` instead of `localStorage` if stored data is expected to grow beyond a few hundred KB (more headroom, async, less eviction-prone) — but only if actually needed; don't over-engineer for a single user's small progress record.

**Warning signs:**
- No try/catch around any `localStorage.setItem` call.
- No way to view/export current progress outside the app UI.
- Testing only ever happens on desktop Chrome (which has generous storage) and never on iOS Safari, where quota and eviction behavior differs most.

**Phase to address:** Progress-persistence phase — acceptance criteria should include "handles quota exceeded gracefully" and "provides manual export," verified with an iOS Safari test pass.

**Sources:** [MDN — Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria), [WebKit — Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/)

---

### Pitfall 6: Single-huge-file maintainability collapse

**What goes wrong:**
A static site with no build step tends to accrete into one giant `index.html` (or one giant `app.js`/`lessons.json`) because that's the path of least resistance for a solo AI-assisted project — no bundler, no module system to set up. By chapter 6-7, the file is thousands of lines, every edit risks breaking unrelated lessons, and AI-assisted edits (this project is built via Claude Code sessions) become error-prone because the assistant has to re-read and reason about a huge blob of unrelated content just to touch one lesson.

**Why it happens:**
Static hosting (GitHub Pages) with "no build-time secrets" and a desire for simplicity nudges toward zero-tooling, and zero-tooling nudges toward one file. It's the natural growth pattern, not a deliberate choice — nobody decides "let's put everything in one file," it just ends up there because splitting requires setting up a fetch/import mechanism and nobody stops to do it before chapter 3.

**How to avoid:**
- Split content by chapter/lesson from the very first chapter: one JSON/Markdown file per lesson, loaded at runtime via `fetch()` (works fine on static hosting, no build step required) rather than one monolithic content file.
- Keep the app shell (HTML/CSS/JS for rendering, grading, persistence) separate from content data files — this also cleanly separates "engine work" from "content work" (reinforcing Pitfall 1's mitigation).
- If a lightweight build step is acceptable (bundling/minifying isn't required for GitHub Pages — plain ES modules work in modern browsers), prefer native ES modules (`<script type="module">`, `import`) over one script tag with everything inlined.
- Establish this file-per-lesson convention explicitly in an early phase so it's not retrofitted after 5 chapters are already tangled together.

**Warning signs:**
- Any single file exceeds ~500-800 lines and mixes content data with rendering/grading logic.
- Adding lesson N+1 requires editing a file that also contains lessons 1 through N.
- AI-assisted edit sessions start needing large context reads of one file just to add a single knowledge check.

**Phase to address:** Architecture/scaffolding phase (very first implementation phase) — the content/engine file-split convention should be decided before any chapter content is written, not refactored in later.

---

### Pitfall 7: Domain-content errors — modified accrual vs. full accrual mix-ups

**What goes wrong:**
Governmental accounting is unusually easy to get subtly wrong because it uses *two different bases of accounting for the same government*: governmental funds (General Fund, Special Revenue, Capital Projects, Debt Service, Permanent) use **modified accrual**, while proprietary and fiduciary funds — and the government-wide statements — use **full accrual**, just like private-sector accounting. AI-generated content (and human learners) commonly conflate the two: e.g., recording depreciation in a governmental fund's journal entries (wrong — no depreciation in governmental funds; capital outlay is an expenditure, not capitalized), recording long-term debt principal as a governmental-fund liability (wrong — it's an "other financing source" when issued and not carried as a fund liability), or treating grant revenue as recognized on receipt only, rather than "measurable and available" (the actual modified-accrual availability test, typically ~60 days).

**Why it happens:**
This is genuinely the hardest conceptual pivot in the textbook (Reck/Lowensohn/Neely) and the point where students most often get confused, because the same government produces two parallel sets of statements on two different bases and reconciles between them. An AI generating lesson content from general knowledge (rather than working problem-by-problem against a verified answer key) can plausibly generate an internally-consistent-sounding but technically wrong journal entry, especially for capital asset and long-term debt transactions in governmental funds — and a solo learner without an instructor has no one to catch the error.

**How to avoid:**
- For every journal-entry example or practice problem, explicitly tag which fund type and basis of accounting applies *before* writing the entry, and have that tag drive which rules apply (no depreciation/no long-term liabilities in governmental-fund entries; both required in proprietary-fund and government-wide entries).
- Build a small set of "golden" worked examples per topic (capital asset acquisition, bond issuance, grant revenue recognition) verified carefully against known GASB rules, and use those as the pattern/reference the AI content-generation process is checked against for every subsequent similar problem — don't generate each new problem from scratch with no anchor.
- Explicitly dedicate lesson content to the governmental-fund ↔ government-wide reconciliation (the required "conversion" worksheets), since this is where errors compound and where the job-description's "financial reports" duty actually lives.
- When generating content from AI knowledge (as this project does, per PROJECT.md), have the learner spot-check a sample of entries against the physical textbook periodically, especially for capital assets, long-term debt, and encumbrances — the three topics most prone to fund-basis mix-ups.

**Warning signs:**
- A governmental-fund (General Fund, Capital Projects Fund) journal entry includes a depreciation line or a long-term liability line — this should never happen.
- A lesson doesn't state which fund type / basis a problem applies to before presenting the entry.
- Practice problems never require the learner to convert governmental-fund entries to government-wide (full accrual) — this conversion is a core job-relevant skill and a common blind spot.

**Phase to address:** Content-generation phase(s) for Ch. 4-6 (General Fund, capital assets/projects, long-term liabilities/debt service) and Ch. 9 (government-wide reporting) — flag these chapters for extra verification/spot-check passes given they're the highest-error-risk topics.

**Sources:** [Debtbook — What is Modified Accrual Accounting?](https://www.debtbook.com/learn/blog/what-is-modified-accrual-accounting), [CPA Exams Mastery — Modified Accrual vs Full Accrual Conversions](https://cpaexamsmastery.com/bar/4/20/1/)

---

### Pitfall 8: Encumbrance-entry errors and budgetary-account confusion

**What goes wrong:**
Encumbrance accounting introduces budgetary accounts (Encumbrances, Budgetary Fund Balance — Assigned for Encumbrances) that look like real financial accounts but aren't — they never appear on actual fund financial statements and don't reduce true fund balance; they exist purely for internal budgetary control. Common content-generation errors: showing encumbrances flowing through to the government-wide (full accrual) statements (they don't — encumbrance accounting is not recognized there at all), treating "Encumbrances" as if it reduces cash or a real liability, or fumbling the reversal entry when a purchase order is fulfilled (encumbrance must be reversed for the *estimated* amount, then the actual expenditure recorded — the two amounts are often different, which is itself a teaching point often skipped).

**Why it happens:**
Encumbrance accounting is a budgetary-control overlay unique to (and often the most confusing part of) governmental fund accounting, with no private-sector analog for an AI or a learner to pattern-match against. It's also directly relevant to this learner's actual job duties (reviewing contracts/change orders for budget appropriateness), so getting it wrong has real on-the-job consequences, not just academic ones.

**How to avoid:**
- Always pair the encumbrance topic with an explicit statement of what it is *not*: not a real expenditure, not reflected in government-wide statements, does not appear in the operating statement.
- Include a full worked example showing the three-step lifecycle: (1) encumber at PO issuance, (2) reverse encumbrance + record actual expenditure at invoice/receipt (noting any variance from the encumbered estimate), (3) handle year-end lapsing/re-establishment of encumbrances in the following year.
- Because this maps directly to the job duty "reviews contracts/agreements for budget appropriateness" and "reviews Commissioners Court agenda items," treat this as a job-duty-mapped topic requiring a production-style (not multiple-choice) practice problem.

**Warning signs:**
- Encumbrance entries shown flowing into government-wide statements.
- No practice problem walks through the full encumber → reverse → expend lifecycle with a variance between estimated and actual amounts.

**Phase to address:** Content-generation phase for budgetary accounting (Ch. 3) — flag for extra scrutiny alongside Pitfall 7's topics.

**Sources:** [CPA Exams Mastery — Budgetary Accounting, Appropriations, and Encumbrances](https://cpaexamsmastery.com/far/governmental-reporting/budgetary-accounting-and-encumbrances/), [SuperfastCPA — Encumbrance Journal Entries](https://www.superfastcpa.com/bar-cpa-exam-how-to-prepare-journal-entries-to-record-encumbrances-of-state-and-local-governments/)

---

### Pitfall 9: AI-hallucinated content presented with false confidence

**What goes wrong:**
Because the entire curriculum is generated from an AI's training knowledge rather than sourced directly from the textbook (the PDF can't be transferred into this environment, per PROJECT.md), there's elevated risk of confident-sounding but subtly wrong content — a plausible-but-incorrect GASB threshold number, an invented account name, a misstated recognition rule. Recent education-research literature finds a substantial share of AI-generated educational content errors are hallucinations rather than simple omissions, and that these are especially dangerous because they're stated with the same confident tone as correct content, so a solo learner without an instructor has no natural check.

**Why it happens:**
LLM-generated technical content is fluent by default regardless of accuracy, and governmental accounting has enough genuinely arcane, numerically-specific rules (dollar thresholds for capital asset capitalization policies, specific GASB statement numbers, exact fund-balance classification criteria) that training-data recall can blur similar-but-distinct rules together, especially at the boundary between GASB statements (e.g., GASB 34 government-wide reporting vs. GASB 54 fund balance classifications vs. GASB 87 leases) if content ever touches more recent standards.

**How to avoid:**
- Prefer teaching *concepts and reasoning process* (why a fund is classified a certain way, why an entry follows from the rule) over memorized numeric thresholds or statement-number trivia that's easy to hallucinate and low-value for the job anyway.
- Where a specific GASB statement number or dollar threshold is asserted, flag it for the learner to verify against the physical book (the workaround PROJECT.md already anticipates: "the learner can paste specific book excerpts into chat anytime to fold them in") rather than presenting it as unverified fact.
- Build content iteratively with the learner in the loop as a fact-checker for at least the first pass of each chapter, since they own the authoritative source (the physical book) that the AI cannot access directly.
- Avoid inventing named examples or case studies that sound like they're drawn from the textbook (e.g., a named fictional city with GASB-specific figures) unless clearly original — this both reduces hallucination risk and reduces copyright-adjacency risk (Pitfall 10).

**Warning signs:**
- Numeric thresholds or GASB statement numbers appear in lesson content without a "verify against source" flag.
- Content for closely related topics (e.g., fund balance classifications: nonspendable/restricted/committed/assigned/unassigned) shows internal inconsistency across chapters, a common hallucination tell.
- The learner has never been prompted to spot-check a chapter against the physical book before it's marked "done."

**Phase to address:** Content-generation phase, ongoing — build a lightweight "verify against source" flagging convention into the content authoring process from Chapter 1, not as an afterthought.

**Sources:** [ResearchGate — Impact of AI-Generated Hallucinations in Educational Settings](https://www.researchgate.net/publication/398611293_The_Impact_of_AI-Generated_Hallucinations_in_Educational_Settings_Trends_Gaps_and_Future_Directions), [ScienceDirect — GenAI hallucinations in CS education](https://www.sciencedirect.com/science/article/pii/S2666920X26000329)

---

### Pitfall 10: Copyright discipline drift (public repo, verbatim-textbook risk)

**What goes wrong:**
PROJECT.md is explicit that the repo is public and content must be original, not verbatim textbook reproduction. The risk isn't usually a deliberate copy-paste of the book — it's *drift*: the learner pastes a book excerpt into chat "to fold it in" (an explicitly anticipated workflow), the AI paraphrases closely, and over many chapters the paraphrase-distance narrows until some passages are functionally a light rewording of the original text — especially for the book's own illustrative examples (which are often distinctive enough that close paraphrasing is recognizable) rather than generic accounting facts (which aren't copyrightable — GASB rules themselves are public standards, not the book's proprietary content).

**Why it happens:**
When a human pastes source text and asks an AI to "explain this" or "make a lesson from this," the natural output leans on the same structure, ordering, and phrasing as the source, especially for illustrative examples/numbers that are the book's own invention (as opposed to definitions of terms, which are effectively facts). This is a gradual, hard-to-notice drift over dozens of lessons rather than one obvious violation, so it's easy to miss without a deliberate check.

**How to avoid:**
- When book excerpts are pasted in, use them only to *verify accuracy*, not as the source text to paraphrase from — write the lesson explanation and examples independently, using the excerpt only to check correctness after the fact.
- Always invent original numbers, entity names, and scenarios for examples (don't reuse the book's named example governments/dollar figures) — GASB rules and terminology are facts and safely reusable; the book's specific illustrative scenarios are the part to avoid mirroring closely.
- Since the existing "Lesson 1" artifact already establishes an original example-first style (per PROJECT.md), use it as the template/precedent to check new content against for "does this feel like our own material or like a rewording of source" — style consistency doubles as an originality check.
- Periodically (e.g., every few chapters) do a quick side-by-side sanity check of a sample lesson against the book's corresponding section, specifically looking for close paraphrase of the book's own worked examples.

**Warning signs:**
- A lesson's worked example uses suspiciously specific details (the same city name, same dollar amounts) that showed up in a pasted book excerpt.
- Content review only ever checks accuracy, never originality/paraphrase-distance.

**Phase to address:** Content-generation workflow, ongoing — establish the "excerpts inform accuracy, not phrasing" rule explicitly at the start of the first content-authoring phase.

---

### Pitfall 11: Curriculum drift away from the target job duties

**What goes wrong:**
The project is explicitly scoped to a specific job description (county Accountant I), not general course completion, but the textbook's chapter order and depth don't map 1:1 to job relevance — e.g., the book likely spends significant depth on topics like fiduciary funds, government-wide financial-statement-preparation mechanics, and ACFR structure that are valuable conceptually but not equally weighted to daily job tasks like "creates and bills monthly/quarterly invoices" or "follows up past-due invoices" (which barely exist as textbook topics at all — they're operational AR/AP skills more than governmental-accounting-theory topics). Left on autopilot, content generation naturally follows the book's chapter weighting rather than the job's actual duty weighting, and by the time this is noticed, several chapters are already built in the "wrong" proportion.

**Why it happens:**
It's much easier to generate curriculum by "cover chapter N of the book" than to constantly cross-reference back to the job description's specific duty list and ask "does this duty have adequate coverage, and does this chapter's depth match how often the learner will actually do this at work." The path of least resistance is book-order, book-depth content generation.

**How to avoid:**
- Maintain the job-duty-mapping requirement (already an Active requirement in PROJECT.md) as a literal checklist/matrix — each of the ~7 job duties should map to specific lessons/problems, and gaps should be visible, not just aspirational.
- For duties with thin textbook coverage (invoicing/billing, past-due follow-up, asset-transfer-form review, agenda-item budget review), plan explicit supplementary lesson content that isn't chapter-driven at all — these need to be authored as job-duty-first content, not book-chapter-derived.
- When prioritizing which chapter to build next, weight by job-duty relevance, not just book order — e.g., budgetary accounting (Ch. 3) and General Fund (Ch. 4) are both high book-priority *and* high job-priority (early alignment is good here); fiduciary funds are book-standard but lower job-priority and can come later or be trimmed in depth.

**Warning signs:**
- The job-duty-mapping matrix has duties with zero mapped lessons/problems after several chapters are complete.
- Content-generation order is simply "next chapter in the book" with no duty-relevance check.
- Operational duties (invoicing, past-due follow-up, agenda-item review) have no dedicated content because "the book doesn't cover this."

**Phase to address:** Roadmap/curriculum-planning phase — the job-duty matrix should be a living artifact checked at each phase transition, not a one-time exercise at project start.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| One monolithic content file for all lessons | Faster to start, no fetch/loader code needed | Unmaintainable by chapter 5+, risky AI-assisted edits (Pitfall 6) | Never — split by lesson from chapter 1 |
| Exact-match grading (`===`) for numeric/text answers | Grading engine "works" in a day | Learner frustration, erodes trust in the app (Pitfall 3) | Only as a throwaway prototype, never shipped |
| Multiple-choice-only practice problems | Trivial to grade, fast to author | Doesn't build production skill needed for the job (Pitfall 2) | Acceptable for in-lesson concept checks only, never as the sole "practice problem" format |
| Static service-worker cache name | Works fine in dev/testing | Learner stuck on stale content after every deploy (Pitfall 4) | Never for a project with ongoing content updates |
| No localStorage error handling | Saves time initially, "just works" in testing | Silent progress loss on quota/eviction (Pitfall 5) | Never — try/catch is cheap and this is a real risk on iOS |
| Generating full chapters from AI knowledge with no source-check flag | Fast content production | Compounding subtle domain errors, hard to retroactively audit (Pitfall 9) | Only if paired with a lightweight "flag for verification" convention from the start |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|-------------------|
| GitHub Pages (static hosting) | Assuming client-side routing works like a server — deep links 404 on refresh | Use hash-based routing or a `404.html` fallback that redirects to `index.html` for SPA-style routing |
| Service worker registration on GitHub Pages | Registering the service worker at the wrong scope (project pages are served from a subpath, not root) | Register with the correct relative scope matching the repo's Pages subpath, and test on the actual deployed URL, not just `localhost` |
| Web App Manifest / "Add to Home Screen" on iOS | Assuming standard PWA install prompts work — iOS Safari has no automatic install banner | Provide manual "Add to Home Screen" instructions in-app for iOS users; test the installed-PWA experience specifically (it differs from browser-tab behavior, notably around storage eviction) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Loading all chapters' content JSON upfront on first load | Slow initial load, especially on mobile data | Lazy-load each chapter's content on demand (fetch when the learner navigates to it) | Noticeable once 5+ chapters exist with rich content/problems |
| Storing full problem history (every attempt, not just latest score) in localStorage | Slow app startup, approaching localStorage quota | Store only latest score/completion state per problem, not full attempt history, unless history view is an actual feature | Around a few hundred problems with verbose per-attempt logging |
| Re-rendering entire lesson DOM on every knowledge-check interaction | Janky feel on older/lower-end mobile devices | Scope re-renders to the specific component that changed | Noticeable on longer lessons with many interactive checks, especially on older phones |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing anything sensitive in localStorage under a public-repo static site | Low risk here (single learner, no accounts/PII beyond progress data) but worth confirming | Keep persisted data to non-sensitive progress/scores only; no credentials or personal identifiers ever touch localStorage |
| Client-side-only "grading" that could theoretically be inspected/manipulated via devtools | Low risk given single learner with no incentive to cheat themselves | Not worth engineering around — explicitly out of scope for a single-user trainer; note only so it's a conscious non-issue, not an oversight |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Grading gives only pass/fail with no explanation | Learner can't self-correct without a teacher | Always show the correct answer and a brief reason when marked wrong (critical for a self-paced, instructor-less app) |
| No "resume where I left off" on app open | Learner has to hunt for their place every session, especially painful on mobile | Persist and restore last lesson/problem position on load (already an Active requirement — keep it prioritized) |
| Silent progress loss on storage quota issues | Learner loses trust, may stop using the app entirely | Visible save-confirmation and visible error state if a save fails (ties to Pitfall 5) |
| Update-available with no in-app signal | Learner keeps using stale content unknowingly | Simple "new content available — reload" banner tied to service-worker update detection (ties to Pitfall 4) |

## "Looks Done But Isn't" Checklist

- [ ] **Lesson viewer:** Often missing lazy-loading of chapter content — verify it doesn't fetch all chapters on every load.
- [ ] **Grading engine:** Often missing tolerant numeric/text matching — verify with test cases like `"$1,200"` vs `"1200"` vs `"1,200.00"`, and journal-entry line order independence.
- [ ] **Offline support:** Often missing a tested update flow — verify by actually deploying a content change and confirming an already-installed PWA picks it up (not just that offline load works).
- [ ] **Progress persistence:** Often missing quota/error handling and export — verify `localStorage.setItem` failures are caught, and a manual export path exists.
- [ ] **Job-duty mapping:** Often aspirational rather than literal — verify every job-description duty has actual mapped lesson(s)/problem(s), not just a stated intent to cover it.
- [ ] **Domain content accuracy:** Often unverified for fund-basis correctness — verify governmental-fund entries never include depreciation or long-term-liability lines, and encumbrance entries never flow into government-wide statements.
- [ ] **Copyright discipline:** Often unchecked after the fact — verify no lesson's worked examples closely mirror a pasted book excerpt's specific named entities/figures.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|------------------|
| Content treadmill stall | MEDIUM | Freeze engine feature work entirely; batch-author remaining chapters against the existing content schema before touching the app again |
| Overly strict grading already shipped for several chapters | LOW | Grading logic is centralized (if built correctly) — fixing the normalization function fixes all chapters at once, no per-chapter rework needed |
| Service worker cache staleness affecting live install | LOW-MEDIUM | Bump cache version, add `skipWaiting`/`clients.claim`, and have the learner do one manual force-refresh (uninstall/reinstall PWA) once to clear the stuck state |
| Domain-content error discovered post-publication (e.g., wrong encumbrance entry) | LOW | Single learner, static content — fix the JSON/content file directly and redeploy; no data migration or user-facing incident needed |
| localStorage progress lost | HIGH if no export existed, LOW if it did | If export existed, re-import; if not, progress is simply gone — this is the reason export should be built early, not after a loss occurs |
| Copyright-adjacent content found in review | LOW-MEDIUM | Rewrite the specific example(s) with original entities/numbers; since GASB rules themselves are safely reusable, only the book's distinctive illustrative details need changing |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|--------------------|----------------|
| Content treadmill | Content architecture/first-chapter phase | One full chapter (lesson + checks + problems) ships before the engine is generalized further |
| Passive-reading-only practice | Grading-engine design phase | Every chapter's problem set includes at least one production-style (non-MC) task |
| Overly strict grading | Grading-engine design phase | Test suite includes formatting-variant "correct answer" cases and passes them |
| Service worker cache staleness | PWA/offline-support phase | A real deploy-and-reload test confirms an installed PWA picks up a content change |
| localStorage limits/eviction/loss | Progress-persistence phase | Quota-exceeded is handled without a crash; manual export exists and round-trips |
| Single-huge-file collapse | Architecture/scaffolding phase (first phase) | Content lives in per-lesson files loaded via fetch, decided before chapter 1 is authored |
| Modified/full accrual mix-ups | Content-generation phase(s) for Ch. 3-6, 9 | Every journal-entry example is tagged with fund type/basis before the entry is written; governmental-fund entries never show depreciation or LT liabilities |
| Encumbrance errors | Content-generation phase for Ch. 3 | Full encumber → reverse → expend lifecycle example exists with a variance case |
| AI hallucination | Content-generation phase, ongoing | Numeric/statement-number claims flagged for source verification; learner spot-checks a sample per chapter |
| Copyright drift | Content-generation workflow, ongoing | "Excerpts inform accuracy, not phrasing" rule applied whenever book text is pasted in |
| Curriculum drift from job duties | Roadmap/curriculum-planning phase, revisited each phase transition | Job-duty matrix has zero unmapped duties by end of curriculum build |

## Sources

- [web.dev — Update lifecycle for PWAs](https://web.dev/learn/pwa/update/)
- [Taming PWA Cache Behavior — Infinity Interactive](https://iinteractive.com/resources/blog/taming-pwa-cache-behavior)
- [8 PWA Integration Mistakes in 2026](https://webscraft.org/blog/8-kritichnih-pomilok-pri-integratsiyi-pwa-stsenariyi-prichini-ta-rishennya-z-kodom?lang=en)
- [MDN — Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [WebKit — Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [Debtbook — What is Modified Accrual Accounting?](https://www.debtbook.com/learn/blog/what-is-modified-accrual-accounting)
- [CPA Exams Mastery — Modified Accrual vs. Full Accrual Conversions](https://cpaexamsmastery.com/bar/4/20/1/)
- [CPA Exams Mastery — Budgetary Accounting, Appropriations, and Encumbrances](https://cpaexamsmastery.com/far/governmental-reporting/budgetary-accounting-and-encumbrances/)
- [SuperfastCPA — Encumbrance Journal Entries for State/Local Governments](https://www.superfastcpa.com/bar-cpa-exam-how-to-prepare-journal-entries-to-record-encumbrances-of-state-and-local-governments/)
- [ResearchGate — Impact of AI-Generated Hallucinations in Educational Settings](https://www.researchgate.net/publication/398611293_The_Impact_of_AI-Generated_Hallucinations_in_Educational_Settings_Trends_Gaps_and_Future_Directions)
- [ScienceDirect — Systematic review of GenAI impact on learning, hallucinations, problem-solving in CS education](https://www.sciencedirect.com/science/article/pii/S2666920X26000329)
- Project context: `.planning/PROJECT.md` (job description, constraints, existing "Lesson 1" artifact, copyright/content constraints)
- Domain knowledge: GASB fund accounting structure (modified accrual vs. full accrual, governmental/proprietary/fiduciary fund types), general knowledge of *Accounting for Governmental & Nonprofit Entities* (Reck, Lowensohn & Neely) chapter structure

---
*Pitfalls research for: educational web app / static PWA / AI-generated governmental-accounting curriculum*
*Researched: 2026-08-11*
