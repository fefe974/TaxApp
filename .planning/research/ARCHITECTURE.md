# Architecture Research

**Domain:** Content-heavy, offline-capable static educational web app (single learner, GitHub Pages)
**Researched:** 2026-08-11
**Confidence:** HIGH (architecture patterns are well-established for this class of app; specific GitHub Pages/service-worker gotchas verified against current sources)

## Key Tension: Single HTML File vs Multi-File Static Site

**Recommendation: Multi-file static site, no build step.** Content as data files, engine as ES modules, deployed as-is to GitHub Pages.

**Why not the single-file approach (like Lesson 1 / the prior PWA):**
- A single self-contained HTML file works beautifully for *one* lesson (easy to share, paste into chat, no tooling). It breaks down as a strategy once you have ~12 chapters × (lessons + multiple problem types):
  - The file becomes a multi-thousand-line blob mixing markup, engine logic, and content — every content edit risks touching engine code and vice versa, which directly violates the stated requirement ("new chapters must be pure content, no engine changes").
  - Browser has to parse/execute the *entire* app (all 12 chapters of content + engine) on every load — no per-chapter lazy loading, no meaningful caching granularity, slow first paint on mobile.
  - Diffs in git become unreadable (one giant file, everything colocated) — hard to review, hard to resume a session against.
  - No natural place to isolate the 4 problem-type renderers (journal entry, reconciliation, classification, multi-part) from each other or from lesson rendering.
- The single-file pattern's *strengths* (no build step, trivially portable, works offline immediately) are not unique to single-file — they're achievable with a multi-file static site too, as long as no bundler/transpiler is introduced.

**Why not a bundler/build-step site (Vite/Astro/Next static export, etc.):**
- Adds tooling the solo learner has to maintain across Claude Code cloud sessions with restricted network egress (package registry access is allowed, but every new dependency is a future maintenance/version-drift cost for a project with no team to absorb it).
- GitHub Pages serves whatever is committed — a build step means either committing build output (dist/ in git, awkward) or wiring GitHub Actions to build on push (extra moving part, extra failure mode, harder to debug in a constrained dev environment).
- Nothing about this app's requirements (single learner, ~12 chapters of text + structured problems, offline via service worker) needs bundling, code-splitting, SSR, or a framework's reactivity model. It's a content renderer plus a grading engine — vanilla JS with native ES modules is sufficient and verified as a current, supported pattern for exactly this class of site (confirmed via 2026 sources on no-build-step static sites deployed to GitHub Pages).

**The recommended middle path:** many small files (one JS/JSON module per chapter of content, small focused engine modules), loaded via native `<script type="module">` / dynamic `import()`, with **zero build step** — committed files are the served files. This keeps the "no tooling" virtue of the single-file approach while solving its scaling problem.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser (client-only)                       │
├─────────────────────────────────────────────────────────────────────┤
│  App Shell (index.html + shell.js)                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐                 │
│  │   Router     │  │ Theme/Nav   │  │  View Mount  │                 │
│  │ (hash-based) │  │  Controls   │  │   (main #app)│                 │
│  └──────┬───────┘  └─────────────┘  └──────┬───────┘                 │
│         │                                   │                        │
├─────────┴───────────────────────────────────┴────────────────────────┤
│                        Rendering Layer                               │
│  ┌────────────────────────┐   ┌───────────────────────────────────┐ │
│  │   Lesson Renderer       │   │   Problem Engine                  │ │
│  │  (sections, examples,   │   │  ┌───────────┐ ┌────────────────┐│ │
│  │   knowledge checks)     │   │  │ Core       │ │ Type Renderers ││ │
│  │                         │   │  │ (prompt,   │ │ journal-entry  ││ │
│  │                         │   │  │  grading   │ │ reconciliation ││ │
│  │                         │   │  │  dispatch) │ │ classification ││ │
│  │                         │   │  └───────────┘ │ multi-part     ││ │
│  │                         │   │                └────────────────┘│ │
│  └───────────┬─────────────┘   └───────────────┬───────────────────┘ │
│              │                                  │                    │
├──────────────┴──────────────────────────────────┴────────────────────┤
│                     Content Data Layer (pure data, no logic)         │
│  content/chapters/ch01.js … ch12.js                                  │
│  each exports: { lesson: {...}, problems: [...] }                    │
├────────────────────────────────────────────────────────────────────┤
│                          Persistence Layer                           │
│  ┌────────────────┐        ┌──────────────────────────────────┐     │
│  │ Progress Store  │        │  Service Worker (offline cache)   │     │
│  │ (localStorage   │        │  (precache shell + engine +       │     │
│  │  wrapper)       │        │   content on install)             │     │
│  └────────────────┘        └──────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|-------------------------|
| App Shell | Page chrome, top-level layout, theme toggle, mounts current view | `index.html` + `js/shell.js`, plain DOM APIs |
| Router | Maps URL hash (`#/ch03/lesson`, `#/ch03/problems/3`) to a view; no server routing needed on GH Pages | Hash-based router, ~50-line hand-rolled module (no library needed) |
| Lesson Renderer | Turns a lesson data object into DOM: narrative sections, worked examples, per-section knowledge checks | `js/lesson-renderer.js`, pure function `render(lessonData) → DOM` |
| Problem Engine (core) | Generic problem lifecycle: load problem, render via correct type renderer, collect answer, grade, report result to Progress Store | `js/problems/engine.js`, dispatches by `problem.type` |
| Problem Type Renderers | One module per problem type; knows how to render inputs for that type and how to grade a submitted answer against the answer key | `js/problems/journal-entry.js`, `reconciliation.js`, `classification.js`, `multi-part.js` |
| Content Data Layer | Per-chapter lesson + problem definitions as plain data (no functions, no DOM) | `content/chapters/ch01.js` … `ch12.js`, each a JS module exporting a data object (or `.json` + `fetch`) |
| Progress Store | Reads/writes localStorage; tracks last position, per-lesson completion, per-problem scores | `js/progress-store.js`, small key-namespaced wrapper with versioned schema |
| Service Worker | Precaches shell/engine/content on install, cache-first for static assets, enables offline use after first load | `sw.js` at repo root, versioned `CACHE_NAME` |

## Recommended Project Structure

```
/
├── index.html                  # App shell entry point, loads shell.js as module
├── manifest.webmanifest        # PWA manifest (name, icons, theme colors)
├── sw.js                       # Service worker (root scope, relative paths only)
├── css/
│   └── styles.css              # Shared design system (light/dark theme, green accent — matches Lesson 1)
├── js/
│   ├── shell.js                # Boot sequence, theme toggle, nav rendering
│   ├── router.js                # Hash-based route table → view loader
│   ├── lesson-renderer.js       # Lesson section/knowledge-check rendering
│   ├── progress-store.js        # localStorage wrapper (get/set/reset progress)
│   ├── content-loader.js        # Resolves chapter id → dynamic import() of content module
│   └── problems/
│       ├── engine.js             # Generic grade/submit/report lifecycle, type dispatch
│       ├── journal-entry.js      # Renderer + grader for T-account/JE style problems
│       ├── reconciliation.js     # Renderer + grader for bank/GL reconciliation problems
│       ├── classification.js     # Renderer + grader for categorize/sort problems
│       └── multi-part.js         # Renderer + grader for composite multi-step problems
├── content/
│   └── chapters/
│       ├── ch01.js               # { lesson: {...}, problems: [...] } — pure data
│       ├── ch02.js
│       └── ... ch12.js           # Added over time; touches nothing outside this folder
└── assets/
    └── icons/                    # PWA icons, favicon
```

### Structure Rationale

- **`content/chapters/`:** One file per chapter is the core scalability decision. Adding chapter 7 means adding `ch07.js` and one line to a chapter index/manifest — zero changes to `js/`. This directly satisfies "content grows to ~12 chapters without touching engine code."
- **`js/problems/` split by type:** Each problem type (journal entry, reconciliation, classification, multi-part) has genuinely different input UI and grading logic. Splitting them into separate modules keeps `engine.js` a thin dispatcher and lets you add a 5th problem type later without touching the other four.
- **`js/` vs `content/` separation:** This is the single most important boundary in the whole system. `js/` contains *no* subject-matter content (no lesson text, no problem prompts, no answer keys) — only rendering/grading *mechanics*. `content/` contains *no* logic — only data. This mirrors the schema/engine separation used by nearly every content-heavy learning app (Duolingo-style course files, docs-as-data static sites) and is what makes "12 chapters as pure content" achievable.
- **Flat `content/chapters/` (not nested per-chapter folders with sub-files):** At this scale (12 chapters, single learner, no CMS), one file per chapter is simpler to author and review than splitting lesson/problems/answer-keys into separate files per chapter. Revisit only if a single chapter file grows unwieldy (>1000 lines) — split that one chapter's problems into a sibling file at that point, not preemptively.
- **No `src/` + `dist/` split:** Because there is no build step, the served files *are* the source files. This is intentional — keeps `git diff` meaningful and avoids a build pipeline.

## Architectural Patterns

### Pattern 1: Content-as-Data (Schema-Driven Rendering)

**What:** Lessons and problems are plain JS/JSON objects following a fixed schema. All rendering and grading code is generic — it walks the schema and produces UI/results, never hardcodes chapter-specific logic.
**When to use:** Any time content volume will grow faster than UI variety (exactly this project's shape: 12 chapters, ~4 problem types).
**Trade-offs:** Requires disciplined upfront schema design (a schema that's too narrow forces engine changes later — the very thing you're trying to avoid). Slightly more indirection than hardcoding one chapter, but pays for itself immediately at chapter 2.

**Example lesson schema:**
```javascript
// content/chapters/ch04.js
export default {
  lesson: {
    id: "ch04-general-fund",
    chapterNumber: 4,
    title: "The General Fund",
    learningObjectives: ["LO 4-1: Record General Fund transactions under modified accrual"],
    sections: [
      {
        id: "ch04-s1",
        type: "narrative",       // narrative | example | knowledgeCheck
        heading: "Why the General Fund exists",
        body: "..."               // markdown or HTML string
      },
      {
        id: "ch04-s2",
        type: "example",
        heading: "Worked example: property tax levy",
        body: "...",
        journalEntry: { debits: [...], credits: [...] }
      },
      {
        id: "ch04-s3",
        type: "knowledgeCheck",
        prompt: "Which basis of accounting does the General Fund use?",
        choices: ["Cash", "Modified accrual", "Full accrual"],
        correctIndex: 1,
        explanation: "..."
      }
    ]
  },
  problems: [
    {
      id: "ch04-p1",
      type: "journal-entry",     // journal-entry | reconciliation | classification | multi-part
      prompt: "Record the levy of $500,000 in property taxes...",
      data: { /* type-specific setup, e.g. amounts, accounts available */ },
      answerKey: { /* type-specific grading structure, see below */ },
      pointValue: 10
    }
  ]
};
```

**Example problem answer-key convention (type-specific, but consistent shape):**
```javascript
// journal-entry grading contract (js/problems/journal-entry.js consumes this)
answerKey: {
  entries: [
    { account: "Taxes Receivable", side: "debit", amount: 500000 },
    { account: "Revenues — Property Tax", side: "credit", amount: 500000 }
  ],
  tolerance: 0        // exact-match grading for amounts
}

// classification grading contract
answerKey: {
  correctBuckets: { "General Fund": ["item1", "item3"], "Special Revenue Fund": ["item2"] }
}

// multi-part grading contract — composes other types
answerKey: {
  parts: [
    { type: "journal-entry", answerKey: { ... } },
    { type: "classification", answerKey: { ... } }
  ],
  weighting: "equal"   // or per-part pointValue
}
```

Each problem-type module exports a consistent interface so the engine never needs to know the internals:
```javascript
// contract every js/problems/*.js module implements
export function render(problem, container) { /* build inputs, return a handle to read answers */ }
export function grade(problem, submittedAnswer) { /* returns { score, maxScore, feedback[] } */ }
```

### Pattern 2: Thin Generic Engine, Fat Type Modules

**What:** `problems/engine.js` contains no subject-matter or UI-specific logic — only the lifecycle (load → render via `type` dispatch → collect submission → grade via `type` dispatch → persist score). Each `problems/<type>.js` module owns everything specific to that problem type.
**When to use:** Whenever you expect the *number of problem types* to be small and stable (4 here) but the *number of problem instances* to grow large (dozens per chapter × 12 chapters).
**Trade-offs:** Adding a genuinely new problem type still requires an engine code change (register the new type in the dispatch table) — but this is rare and intentional; adding new *problems* of existing types is pure content and requires none.

```javascript
// js/problems/engine.js
import * as journalEntry from './journal-entry.js';
import * as reconciliation from './reconciliation.js';
import * as classification from './classification.js';
import * as multiPart from './multi-part.js';

const renderers = { 'journal-entry': journalEntry, reconciliation, classification, 'multi-part': multiPart };

export function renderProblem(problem, container) {
  return renderers[problem.type].render(problem, container);
}
export function gradeProblem(problem, submittedAnswer) {
  return renderers[problem.type].grade(problem, submittedAnswer);
}
```

### Pattern 3: Native ES Modules, No Bundler

**What:** Use `<script type="module" src="js/shell.js">` in `index.html`; components `import` each other directly; content chapters are loaded via dynamic `import()` (or `fetch()` if using `.json`) at route time, not all upfront.
**When to use:** Static content sites without a team/CI budget for build tooling — confirmed as a current, viable 2026 pattern for GitHub Pages sites (no build step is a first-class strategy, not a legacy fallback).
**Trade-offs:** No JSX-like templating (use template literals or DOM APIs directly — fine at this scale); no automatic minification (acceptable — text-heavy content compresses well via HTTP gzip/br which GitHub Pages provides automatically; JS payload stays small because there's no framework runtime). Browser support for ESM + dynamic import is universal in any browser this learner would use on mobile in 2026.

```javascript
// js/content-loader.js
export async function loadChapter(chapterId) {
  const module = await import(`../content/chapters/${chapterId}.js`);
  return module.default;
}
```

## Data Flow

### Lesson View Flow

```
User navigates to #/ch04/lesson
    ↓
Router matches route → calls content-loader.loadChapter('ch04')
    ↓
content-loader dynamic-imports content/chapters/ch04.js → returns { lesson, problems }
    ↓
lesson-renderer.render(lesson) → builds DOM sections in #app
    ↓
User answers a knowledgeCheck inline → lesson-renderer grades it locally (simple, no engine needed)
    ↓
On section/lesson completion → progress-store.markLessonSectionComplete(lessonId, sectionId)
    ↓
progress-store writes to localStorage (namespaced key, versioned schema)
```

### Problem-Solving Flow

```
User navigates to #/ch04/problems/ch04-p1
    ↓
Router loads chapter data (same content-loader as above) → finds problem by id
    ↓
problems/engine.renderProblem(problem, container) → dispatches to journal-entry.render()
    ↓
User fills inputs → submits
    ↓
problems/engine.gradeProblem(problem, submittedAnswer) → dispatches to journal-entry.grade()
    ↓
grade() compares submittedAnswer to problem.answerKey → returns { score, maxScore, feedback }
    ↓
Result rendered to user (correct/incorrect + explanation)
    ↓
progress-store.recordProblemScore(problemId, score, maxScore) → localStorage
```

### Offline / Service Worker Flow

```
First visit (online)
    ↓
sw.js registers → 'install' event → precache: app shell, css, js/**, content/chapters/**
    ↓
'activate' event → deletes old-versioned caches (cache name includes a version string)
    ↓
Subsequent visits (online or offline)
    ↓
'fetch' event → cache-first for same-origin GET requests → falls back to network → 
   on successful network fetch, updates cache for next time
    ↓
App fully usable offline after first successful full load (all 12 chapters' content is small
   text/data, well within service worker cache storage limits)
```

### Key Data Flows

1. **Content is read-only at runtime.** Nothing in `js/` ever mutates a chapter data object — content flows one direction (data → renderer → DOM). This is what keeps content additions safe/isolated.
2. **Progress is the only mutable client state**, and it lives entirely in `localStorage` via `progress-store.js`. No other component reads/writes localStorage directly — always go through the store module, so the storage schema can change in one place if the app evolves (e.g., v1 → v2 migration logic lives only in `progress-store.js`).
3. **Grading is local and synchronous.** Answer keys ship in the same content bundle as the problem (no server round-trip, no separate "secure" answer store needed — this is a single-learner trainer, not a proctored exam).

## Scaling Considerations

This app will never need to scale to concurrent users (single learner, static hosting) — "scaling" here means *content volume* and *maintainability over ~12 chapters*, not traffic.

| Scale | Architecture Adjustments |
|-------|---------------------------|
| 1–3 chapters (MVP) | Structure as designed above; even a flat `content/` folder with no chapter index needed — router can hardcode 1-3 routes |
| 4–8 chapters | Introduce a `content/chapter-index.js` (or generated manifest) listing chapter ids/titles/order, so nav/router don't hardcode a growing list; still zero build step — this file is hand-edited like content itself |
| 9–12 chapters (target) | No structural change needed — this is exactly the scale the folder-per-chapter-file design targets. Only risk is total precache payload size for the service worker; verify it stays well under typical mobile Safari/Chrome cache quota (usually hundreds of MB available — 12 chapters of text content is likely single-digit MB) |
| Beyond 12 (v2, other book sections) | Same pattern extends — add `content/chapters/ch13.js` etc. If problem types diversify significantly, revisit whether `problems/engine.js` dispatch table needs a plugin-style registration instead of a static import map |

### Scaling Priorities

1. **First real risk: content schema getting bent to fit chapter 1's needs, then breaking for chapter 5.** Mitigate by explicitly designing the lesson/problem schema against the *diversity* of the curriculum up front (governmental fund types, reconciliations, capital assets, debt service, government-wide statements) even while only chapter 1 content exists — this is why schema design should happen in an early phase, not be inferred from a single chapter.
2. **Second risk: service worker cache invalidation as content updates.** Every content change requires bumping the service worker's `CACHE_NAME` (or using a content-hash/version file it checks) so returning users get updated lessons rather than being stuck on a stale offline cache. Build this versioning convention in from the start, not as an afterthought.

## Anti-Patterns

### Anti-Pattern 1: Growing the Single-File Artifact Indefinitely

**What people do:** Keep appending each new chapter's HTML/JS/content into the existing single-file artifact (the natural instinct, since Lesson 1 already exists and "works").
**Why it's wrong:** File becomes unmaintainable well before chapter 12 (mixing engine and content defeats the "add chapters without touching engine" requirement), git diffs become unreviewable, load performance degrades, and problem-engine logic for 4 problem types cannot be cleanly isolated in one file without heavy internal namespacing that just reinvents modules by hand.
**Do this instead:** Use the single-file Lesson 1 artifact purely as the *design reference* for visual style and lesson pedagogy (example-first, activation predictions, knowledge checks, light/dark theme) — port its CSS and interaction patterns into `css/styles.css` and `lesson-renderer.js`, but do not keep extending the file itself as the app.

### Anti-Pattern 2: Content Files That Contain Rendering Logic

**What people do:** Put a `render()` function or JSX-like markup directly inside a chapter's content file "because it's easier right now."
**Why it's wrong:** Immediately couples content to engine internals — the moment content contains logic, "add a chapter without touching engine code" becomes false, and every content author (even future-you) has to understand rendering internals to write a lesson.
**Do this instead:** Content files are strictly data (objects/arrays/strings). If a lesson needs a visual element the current renderer doesn't support (e.g., a new diagram type), that's a signal to extend the *schema* (add a new `section.type`) and the *renderer* (handle that type) — a deliberate, reviewed engine change — not a one-off escape hatch in content.

### Anti-Pattern 3: Absolute Paths Breaking GitHub Pages Project Subpath

**What people do:** Reference assets/routes with root-absolute paths (`/js/shell.js`, `/sw.js` fetch scope assuming root `/`) assuming the site is served at domain root.
**Why it's wrong:** A GitHub Pages *project* site (not a `username.github.io` user site) is served at `https://username.github.io/repo-name/`, not at the domain root. Absolute paths starting with `/` resolve to the domain root and 404. This is a very common GitHub Pages gotcha for both asset links and service worker scope/cache URLs.
**Do this instead:** Use relative paths everywhere (`./js/shell.js`, `./sw.js`) and register the service worker with a relative scope; verify manifest.webmanifest's `start_url` and icon paths are also relative. Confirm final deployment target (project page vs. custom domain vs. user page) before hardcoding any path.

## Integration Points

### External Services

None. This is intentionally a fully client-side, zero-backend app (per project constraints: no server, no build-time secrets, static GitHub Pages hosting). No external API integration points exist or are needed.

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|----------------|-------|
| `content/` ↔ `js/` (renderer + engine) | One-directional data import (`import()`/`fetch()`), read-only | This is the boundary the whole "12 chapters as pure content" requirement depends on — keep it strict |
| `js/problems/engine.js` ↔ `js/problems/<type>.js` | Function-call dispatch via a fixed `{render, grade}` interface | Adding a 5th problem type = adding one module + one dispatch-table entry, not touching existing type modules |
| `js/lesson-renderer.js` / `js/problems/engine.js` ↔ `js/progress-store.js` | Direct function calls (`recordProblemScore`, `markLessonSectionComplete`) — store is the only localStorage writer | Keeps storage schema changes localized to one file |
| `js/router.js` ↔ everything else | Router owns which view is mounted; views don't navigate each other directly, they call `router.navigate(hash)` | Keeps navigation logic centralized, avoids scattered `location.hash =` calls |
| App ↔ `sw.js` | Standard `navigator.serviceWorker.register()` at boot; no direct message-passing needed for this app's simplicity (no background sync required) | Keep service worker logic itself dependency-free (it can't `import` app modules easily in all browsers without `type: 'module'` worker support) — treat it as a separate, small, self-contained script |

## Suggested Build Order

This ordering resolves dependencies: schema before content, content before renderer, renderer before engine, engine before offline layer.

1. **Design and lock the content schema** (lesson sections incl. knowledgeCheck; problem types incl. answerKey shape for all 4 types) — do this against the full curriculum's likely needs, not just chapter 1, since schema changes later ripple into every existing chapter file.
2. **Author chapter 1 content** as the first `content/chapters/ch01.js`, reusing Lesson 1's actual pedagogical content as the source — this both produces real content and stress-tests the schema.
3. **Build app shell + router** (static nav, no offline yet) — minimal HTML/CSS matching Lesson 1's visual design (light/dark, green accent).
4. **Build lesson renderer** consuming the schema, rendering chapter 1 end-to-end (narrative, example, knowledge checks).
5. **Build progress store** (localStorage wrapper) and wire lesson-section completion into it — validates the persistence contract early, before problems add complexity.
6. **Build problem engine core** + first problem-type module (journal-entry is the most central to the job-duty mapping) — validates the render/grade contract.
7. **Add remaining problem-type modules** (reconciliation, classification, multi-part) — each is additive, doesn't touch the first.
8. **Add service worker** for offline caching, with cache versioning convention established — do this after the app's file set has stabilized somewhat, since every structural change means updating the precache list.
9. **Scale content to remaining chapters (2–12)** as pure data additions — this step should require zero code changes if steps 1–8 were done correctly; treat any need to touch `js/` at this stage as a signal the schema/engine wasn't general enough.

## Sources

- Kody Wildfeuer, "Building a Static Site in Pure HTML/CSS/JS in 2026 — The Anti-Framework Case" (confirms no-build-step static sites remain a viable, current 2026 pattern for approachable small projects) — MEDIUM confidence (single blog source, but consistent with well-established platform capabilities: native ESM + dynamic import are stable browser features)
- WebSearch synthesis on GitHub Pages static hosting patterns and Jekyll/build-step alternatives — MEDIUM confidence, cross-checked against known GitHub Pages behavior (project-site subpath serving is HIGH confidence — well-documented, longstanding GitHub Pages behavior)
- WebSearch synthesis on service worker caching strategies (cache-first for static assets, precaching on install, root-scope registration, cache versioning for invalidation) — MEDIUM confidence, consistent with MDN/web.dev's longstanding documented service worker lifecycle (install/activate/fetch) and cache-first pattern, which is HIGH confidence as a documented Web API pattern
- Project context: existing "Governmental Accounting — Lesson 1" single-file artifact examined via `.planning/PROJECT.md` description — used as design-language reference, not as the structural pattern to continue at scale

---
*Architecture research for: content-heavy static educational web app (offline-capable, single learner, GitHub Pages)*
*Researched: 2026-08-11*
