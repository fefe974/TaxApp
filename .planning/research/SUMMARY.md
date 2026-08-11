# Research Summary — Governmental Accounting Trainer

**Synthesized:** 2026-08-11
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

## Executive Summary

Build a static, offline-capable, mobile-first learning app hosted on GitHub Pages: an app shell + lesson renderer + data-driven practice-problem engine, with each chapter authored as a pure content file. The core product loop is **read a short example-first lesson section → answer an inline knowledge check → work graded practice problems (journal entries first)**. The single highest project risk is the content treadmill (engine finished, curriculum never finished); the roadmap counters it by shipping one complete chapter end-to-end as the first vertical slice and treating every later chapter as content-only work.

## Stack Decision (conflict resolved)

STACK.md recommends Vite + Preact + TypeScript + vite-plugin-pwa; ARCHITECTURE.md recommends a no-build-step multi-file vanilla ES-module site. **Resolution: no-build-step vanilla ES modules** (ARCHITECTURE.md's position), for these reasons:

1. **All development happens in AI cloud sessions committing directly to git.** A build step adds a CI deploy dependency and toolchain state that every future session must reconstruct; plain files pushed to the branch are immediately servable by GitHub Pages.
2. **The learner never runs tooling** — they open a URL on a phone. There is no local dev loop to speed up.
3. **The app's engine scope is modest** (shell, router, lesson renderer, 4 problem-type modules, progress store, service worker) — comfortably within vanilla ESM scale. The scaling dimension is *content*, which is pure data either way.
4. **Adopted from STACK.md anyway:** content-module validation (a small Node script run in-session before commit, replacing zod/tsc as the malformed-content safety net), grading-logic unit tests (plain Node test script), export/import progress as JSON, versioned service-worker cache with visible update prompt, relative paths for the GitHub Pages subpath.

Escape hatch: the content-as-data boundary survives a later migration to Vite/TypeScript unchanged if engine complexity ever demands it.

## Key Findings

**Architecture (HIGH confidence)**
- Hard boundary: `content/` is pure data (one file per chapter, no logic); `js/` is engine (no chapter-specific content). New chapters = new data files, zero engine edits.
- Problem engine: generic `engine.js` dispatches by `problem.type` to per-type modules (`journal-entry`, `classification`, `reconciliation`, `multi-part`), each implementing `{render, grade}` against a data-driven `answerKey`.
- Progress store is the only localStorage writer; all components go through it.
- GitHub Pages serves project sites from `/TaxApp/` subpath — all paths must be relative; service worker scope/registration included.

**Features (MEDIUM-HIGH confidence)**
- Table stakes: journal-entry forms (dropdown/typeahead account picker + debit/credit amounts — NOT drag-and-drop; mobile), instant per-answer feedback, resume-where-you-left-off, progress by chapter.
- The multi-step per-step-graded problem format mirrors CPA Task-Based Simulations — proven, not experimental.
- Job-duty→curriculum mapping is a genuine differentiator; mostly content tagging, cheap to build.
- Missed-problem review/retry = a simple filtered view (satisfies "revisit weak areas" without violating the no-flashcards/no-SRS boundary).
- Shared dependencies to build once: answer-checking/feedback component; progress persistence.
- Mobile grid layout for JE/reconciliation/statement UIs is the top design risk — every reviewed product assumes desktop.

**Pitfalls (MEDIUM-HIGH confidence)**
1. **Content treadmill (#1 risk):** ship one full chapter (lesson + checks + graded problems + persistence) before generalizing the engine.
2. **Grading strictness:** tolerant matching from day one — numeric tolerance, order-insensitive JE lines, accept equivalent account names. Multiple-choice-only practice won't build job skill.
3. **Service worker staleness:** versioned cache names + `skipWaiting`/`clients.claim` + visible "update available" prompt; deploy-and-verify the update flow.
4. **localStorage:** ~5MB Safari quota, silent eviction — handle `QuotaExceededError`, provide JSON export/import as the save-file mechanism.
5. **Domain-content error hot spots:** modified accrual vs full accrual (no depreciation/LT debt in governmental funds), encumbrance entries, fund-type classification — Ch. 3–6 and 9 need extra verification passes during content authoring.
6. **Copyright discipline:** book excerpts pasted by the learner are used to verify accuracy only, never as phrasing source; repo is public.
7. **Curriculum drift:** job-duty mapping is a living checklist revisited each content phase, not a one-time exercise.

## Implications for Roadmap

- Phase order: schema design (against the FULL curriculum's needs, not just Ch. 1) → vertical slice (shell + renderer + progress + Ch. 1 lesson + JE problems, deployed) → remaining problem types + tolerant grading + review/retry → job-duty dashboard + offline PWA + export/import → content scale-out (Ch. 2–12 as data-only phases).
- Content authoring must include a validation script gate (schema check) and a domain-accuracy self-review step for the flagged hot-spot chapters.
- Deploy to GitHub Pages from the FIRST vertical slice so the learner can start studying immediately (Vertical MVP mode).

## Gaps / Open Questions

- Multi-part problem data schema not validated against a working example — prototype during the vertical slice before freezing the schema.
- Lightweight mobile fund-statement UI has no precedent — small design spike when that problem type is built.
- Service worker cache behavior for ~12 chapters on mobile Safari — likely fine (text-only), verify at PWA phase.
