# Stack Research

**Domain:** Static, offline-capable, content-heavy educational web app (single-user, mobile-first, GitHub Pages)
**Researched:** 2026-08-11
**Confidence:** HIGH (versions verified directly against npm registry; architectural patterns cross-checked against current GitHub Pages / vite-plugin-pwa community guidance)

## The Core Decision: Bundled Vite App, Not a Single Monolithic HTML File

The prior app and the well-liked "Lesson 1" artifact were both single self-contained HTML files (inline CSS/JS, no build step). That pattern is **excellent for one throwaway artifact** but does not scale to this milestone's requirements: a shared nav/theme shell, a progress dashboard, a job-duty-mapping index, and localStorage-backed state that spans dozens of lessons and problems. Duplicating a full `<style>`/`<script>` block into every lesson file, by hand, across many Claude Code sessions, is exactly the kind of drift-prone busywork a build step exists to eliminate.

**Recommendation: keep the single-file *spirit*, lose the single-file *file*.** Use Vite to build one small app shell (nav, theme toggle, progress store, router) and author each lesson/problem as its own small, self-contained **content module** (a `.ts` file per lesson) — structurally this is the same "one file, one lesson, easy for an AI to write in one sitting" workflow the learner already validated, it just plugs into a shared renderer instead of re-implementing the page chrome every time.

This is also why **no server-rendering framework (Next.js, Astro SSR, SvelteKit adapter-node, etc.) is appropriate** — there is no server. Pure client-side Vite build → static `dist/` → GitHub Pages is the entire deployment story.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 8.2.1 | Build tool / dev server | The de facto standard bundler for framework-light static SPAs in 2025/2026. Zero-config static `dist/` output, trivial `base` path config for GitHub Pages project sites, native TS support, and the best-supported PWA plugin ecosystem (`vite-plugin-pwa`). No reason to hand-roll a bundler or use webpack/Parcel here. |
| TypeScript | 7.0.2 | Language for app + content modules | Confirmed current on npm (the Microsoft native/Go-ported compiler line; `7.1.0` is already in `next`). Type safety matters more than usual here because content is authored by an AI across many disconnected sessions with no human code review step before it ships to production — a missing field in a lesson/problem module should fail `tsc`/build, not silently render blank on the learner's phone. |
| Preact | 10.29.8 | UI component model | ~3-4KB runtime, React-compatible hooks/JSX API (so LLM-generated React patterns transfer directly with almost no translation), and first-class Vite + vite-plugin-pwa support. Gives you reusable components for the repeated patterns this app needs (lesson section, knowledge-check widget, graded-problem form, progress bar) without React's ~45KB+ payload — payload size directly affects service-worker precache size and mobile install/update speed. |
| @preact/signals | 2.11.0 | Reactive state (progress, theme, in-progress answers) | Fine-grained reactivity without a Redux/Zustand-style store. A `progressSignal` that lessons and the dashboard both read/write, synced to `localStorage` on change, is enough state management for a single-user app — anything heavier is unjustified complexity. |
| vite-plugin-pwa | 1.3.0 | Service worker generation, manifest, offline precache | Wraps Workbox's `generateSW` strategy to auto-precache the built app shell + all lesson/problem JS chunks + CSS on first load, so the app is fully usable offline afterward — matching the "works offline once loaded" requirement and the prior app's PWA behavior. Actively maintained (framework integrations list explicitly includes Vanilla, Preact, React, Svelte, SolidJS). |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| marked | 18.0.9 | Markdown → HTML for long narrative prose blocks inside lesson content | Author the *narrative teaching text* of a lesson section as a Markdown string inside the TS content module (easy for an AI to write, easy to skim/edit), then render it through `marked.parse()` at runtime (or precompute at build time via a small Vite plugin/script if you want zero runtime Markdown parsing cost). Do **not** use Markdown for structural fields (knowledge-check answers, problem grading data) — those need to be typed objects, not prose. |
| zod | 4.4.3 | Runtime schema validation for content modules | Add a `lesson.schema.ts` / `problem.schema.ts` and validate every content module against it in a `npm run lint:content` script (or a Vitest test that imports every module and parses it). This is your safety net against malformed AI-authored content shipping silently — there's no human QA server, no staging environment, just the learner's phone. |
| vitest | 4.1.10 | Unit tests for grading logic | The most important thing to test in this app is *"does the grader correctly mark this journal entry / reconciliation right or wrong."* Vite-native, zero extra config, fast. Write a test per problem type (exact-match, tolerance-based numeric, multi-line journal entry) rather than per individual problem. |
| wouter | 3.10.0 | Client-side router (optional) | Only pull this in if hand-rolled hash routing (see below) starts feeling unwieldy once you have lesson lists, a dashboard, and deep-linkable problem pages. 1.5KB, Preact-compatible, hash-mode supported out of the box. For the scope described in PROJECT.md (lessons + practice problems + a dashboard), a ~30-line custom hash router is likely sufficient and keeps one less dependency in the install graph. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint 10 + typescript-eslint 8.67.0 | Lint app code and content modules | Catch AI-authoring mistakes (unused vars, unreachable branches in grading logic) before build. |
| GitHub Actions (`actions/upload-pages-artifact` + `actions/deploy-pages`) | Deploy `dist/` to GitHub Pages | This is GitHub's current officially supported Pages deployment path — no `gh-pages` branch, no personal access token, just a workflow that builds with Vite and deploys the artifact on push to `main`. Prefer this over the `gh-pages` npm package (6.3.0), which pushes a build to a `gh-pages` branch via git — an older pattern that still works but adds an extra moving part (branch management, git credentials in CI) for no benefit on a repo that already has Actions available. |
| Vite PWA offline dev tooling (`vite-plugin-pwa`'s `devOptions.enabled`) | Test service worker behavior in dev | Service workers don't run by default under `vite dev`; enable `devOptions.enabled: true` during development so you can actually test offline behavior (DevTools → Application → Offline) before shipping, since this is a hard functional requirement, not a nice-to-have. |

## Installation

```bash
# Scaffold
npm create vite@latest . -- --template preact-ts

# Core additions
npm install @preact/signals
npm install -D vite-plugin-pwa

# Content authoring support
npm install marked zod

# Testing
npm install -D vitest

# Lint
npm install -D eslint typescript-eslint
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Vite + Preact (bundled SPA) | Vanilla JS + hand-rolled SPA, no framework | If the app stays to a handful of lesson templates with little repeated UI, a framework-free `Vite` + vanilla TS + template literals setup works and shaves a few KB. Given this curriculum spans 12+ chapters with knowledge checks, multiple graded-problem types, and a progress dashboard, the repeated-component win from Preact outweighs the marginal bundle cost (~4KB gzip). |
| Vite + Preact | Vite + React 19.2.8 | Use React only if you specifically want its larger ecosystem (component libraries, more AI training-data coverage of edge-case patterns) and don't mind ~10x the runtime weight for a single-user offline app where every extra KB is permanently cached. Not justified here. |
| Vite + Preact | Vite + Svelte 5.56.8 | Svelte's compiled output is even smaller than Preact's and its reactivity model is arguably more elegant, but its `.svelte` single-file-component syntax is a different authoring mental model than plain TS/JSX. Given content modules are AI-authored across sessions, staying in "it's just TypeScript" (Preact/JSX) reduces the surface area for structural mistakes compared to introducing a compiler-specific file format. |
| TS content modules (+ Markdown strings for prose) | Pure JSON content files | JSON is simpler and is fine if problems are pure data (a prompt + one correct answer). This project's "graded practice problems" need real grading logic (multi-line journal entries, tolerance-based numeric comparison, partial credit) — that's code, not data, so JSON alone can't express it without a second parallel logic layer. TS modules colocate content and grading function and get type-checked. |
| Hand-rolled hash router | React Router / wouter with `BrowserRouter` (history API) | `BrowserRouter`-style routing requires the server to rewrite unknown paths back to `index.html`. GitHub Pages project sites don't do this natively (you'd need the community 404.html-redirect hack). Hash-based routing (`#/lesson/3-2`) needs zero server cooperation and is the standard, low-friction pattern for GitHub Pages SPAs. |
| Hand-written CSS custom properties (design tokens) | Tailwind CSS 4.3.3 + `@tailwindcss/vite` | Tailwind is the dominant utility-CSS choice in 2025/2026 and integrates cleanly with Vite if the UI surface grows large or multiple contributors join. This app already has a *validated* design language (green-accented light/dark theme) from the Lesson 1 artifact — porting that to a small shared stylesheet of CSS custom properties (`--accent`, `--bg`, `--surface`, etc.) preserves the proven look with less new tooling. Revisit Tailwind if the component/variant count grows past what hand-written tokens comfortably manage. |
| `localStorage` for progress | IndexedDB (via `idb` 8.0.3) | Progress data here is small — completion flags, scores, timestamps per lesson/problem, easily under a few hundred KB even for the full curriculum. `localStorage`'s synchronous `JSON.parse`/`stringify` API is simpler to reason about and sufficient. Move to IndexedDB only if you later store large blobs (e.g., full answer history/replay data) that would make synchronous read/write noticeably slow. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| Any runtime CDN dependency (Google Fonts `<link>`, CDN-hosted React/Vue, CDN icon fonts, analytics scripts) | The app must work fully offline after first load, and the dev environment itself has restricted egress to arbitrary CDNs. A CDN font/script that isn't cached by the service worker will silently fail to load offline, and one that *is* cross-origin may not even be cacheable without extra CORS/opaque-response handling. | Bundle everything through Vite (`npm install`), self-host any fonts as static assets, let `vite-plugin-pwa` precache the full asset graph. |
| `react-router` `BrowserRouter` / any server-rewrite-dependent routing | No server exists to rewrite paths; GitHub Pages will 404 on refresh of any nested route without extra 404.html tricks. | Hash-based routing (custom or `wouter` in hash mode). |
| Redux, MobX, Zustand, or other general-purpose state libraries | Massive overkill for one user's lesson-progress state. Adds bundle weight and indirection with no corresponding benefit — there's no multi-actor state coordination problem to solve. | `@preact/signals` (or even plain `useState`/`useReducer` + a `localStorage` sync effect). |
| Full monolithic single-file `index.html` for the whole app (continuing the old pattern as-is) | Works for one artifact; becomes an unmaintainable wall of inline `<script>`/`<style>` once you have 12+ lesson chapters, multiple problem types, a dashboard, and shared theming — every content update risks touching unrelated code. | Vite-built app shell + one small TS content module per lesson/problem (see Content Structure below). |
| `localStorage` writes without a schema version or try/catch | Private browsing mode / storage-full errors throw; a future content-model change (e.g., adding partial credit) can silently corrupt or misread old saved progress. | Wrap all reads/writes in a small `storage.ts` util: versioned schema (`{ version: 2, ... }`), migration function for version bumps, try/catch around every `localStorage` call with an in-memory fallback. |
| `gh-pages` npm package pushing to a `gh-pages` branch | An older deployment pattern; works, but is an unnecessary extra moving part (branch + git credentials in CI) when GitHub Actions' native Pages deployment is available and is what GitHub now recommends. | GitHub Actions workflow using `actions/upload-pages-artifact` + `actions/deploy-pages`. |
| Injecting a hand-written service worker from scratch | Cache-invalidation bugs (stale precached lesson content, "why isn't my update showing up") are the single most common offline-PWA failure mode, and Workbox already solves versioned precaching correctly. | `vite-plugin-pwa` with the default `generateSW` strategy; only reach for `injectManifest` (custom SW logic) if you need runtime caching rules Workbox's generateSW config can't express, which is unlikely for this app. |

## Stack Patterns by Variant

**PWA registration / update behavior:**
- Use `registerType: 'autoUpdate'` in `vite-plugin-pwa` config for a single-user personal app — new content should just take effect on next visit rather than nagging the learner with an "update available" prompt every time a lesson is edited. If you want to avoid an update interrupting a lesson mid-session, pair with `periodicSyncForUpdates` or check-for-updates only on navigation-idle, not mid-problem.
- Set `workbox.globPatterns` broadly enough to capture all lesson/problem JS chunks (`['**/*.{js,css,html,svg,png,woff2}']`) so first-load precaching genuinely covers the whole curriculum, not just the shell — otherwise "offline" only works for whichever lesson happens to be in the runtime cache already.

**Content structure (lesson/problem modules):**
```ts
// content/lessons/1-1-environment.ts
import type { Lesson } from '../schema'

export const lesson_1_1: Lesson = {
  id: '1-1',
  chapter: 1,
  title: 'The Governmental Accounting Environment',
  jobDuties: ['gl-reconciliation'],           // job-duty mapping requirement
  sections: [
    {
      kind: 'narrative',
      activationPrediction: 'Before reading: why would a city need different accounting rules than a business?',
      bodyMarkdown: `...narrative teaching text, Markdown string...`,
    },
    {
      kind: 'knowledgeCheck',
      question: '...',
      choices: ['...', '...'],
      correctIndex: 1,
    },
  ],
}
```
```ts
// content/problems/journal-entry-3-2.ts
import type { Problem } from '../schema'

export const problem_je_3_2: Problem = {
  id: 'je-3-2',
  prompt: '...',
  grade: (answer) => {
    // typed grading logic: compare debits/credits, tolerance, partial credit
  },
}
```
Both are plain TS, statically imported by a small lesson/problem index that the router/dashboard iterates over — no dynamic file-system scanning needed (Vite resolves static imports at build time, which also means the service worker's precache manifest correctly includes every content chunk).

**Progress persistence (`localStorage`):**
```ts
// storage.ts
const KEY = 'gsd-accounting-progress-v1'
interface ProgressState { version: 1; lessons: Record<string, { completed: boolean; lastVisited: string }>; problems: Record<string, { attempts: number; bestScore: number }> }

export function loadProgress(): ProgressState { /* try/catch, default on parse failure */ }
export function saveProgress(state: ProgressState): void { /* try/catch */ }
export function exportProgress(): string { /* JSON.stringify for manual backup/copy-paste since there's no backend */ }
```
Since there's no backend and no accounts, consider a simple "export/import progress as JSON" affordance (copy to clipboard / paste to restore) so the learner isn't locked to one browser/device — this is the offline-app equivalent of a save file.

**If the curriculum's UI surface grows beyond lessons + problems + dashboard** (e.g., search, filtering by job duty, a glossary): reach for `wouter` over hand-rolled routing at that point, and consider Tailwind if the hand-written CSS token system starts sprawling.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `vite@8.2.1` | `vite-plugin-pwa@1.3.0` | vite-plugin-pwa has required Vite 5+ since its own v0.17; current 1.x line tracks current Vite majors. Confirm compatibility in the plugin's peerDependencies at install time (`npm install` will warn on mismatch). |
| `vite@8.2.1` | Node.js ≥ 20.19 / 22.12 | Vite 7+ dropped Node 18 support; verify the Claude Code cloud session's Node version meets this before scaffolding (`node -v`). |
| `preact@10.29.8` | `@preact/signals@2.11.0`, `@preact/preset-vite@2.10.6` | Use `@preact/preset-vite` (not `@vitejs/plugin-react`) for JSX-in-Preact — it configures the correct `jsxImportSource` automatically. |
| `typescript@7.0.2` | `vitest@4.1.10`, `typescript-eslint@8.67.0` | TS 7 is the newer native-compiler line; if any tool in the chain hasn't yet published explicit TS7 support, pin to the latest TS 5.x line (`~5.9`) as a fallback — check `npm ls` / peerDependency warnings after first install before committing to TS7 for the whole project. |

## Sources

- npm registry (`npm view <pkg> version` / `dist-tags`, run directly against the live registry) — HIGH confidence, all core version numbers verified 2026-08-11: `vite@8.2.1`, `vite-plugin-pwa@1.3.0`, `preact@10.29.8`, `@preact/signals@2.11.0`, `typescript@7.0.2`, `vitest@4.1.10`, `marked@18.0.9`, `zod@4.4.3`, `wouter@3.10.0`, `tailwindcss@4.3.3`, `gh-pages@6.3.0`, `eslint@10.8.1`, `typescript-eslint@8.67.0`.
- https://github.com/vite-pwa/vite-plugin-pwa (README fetched) — confirms Workbox-based offline support and Vanilla/Preact/React/Svelte/SolidJS framework coverage. MEDIUM confidence (full docs site `vite-pwa-org.netlify.app` was blocked by network egress policy in this environment; registerType/generateSW specifics are drawn from well-established, stable plugin API documented in prior training data, cross-checked against the fetched README's framework-support claims).
- https://vite.dev/blog/announcing-vite7 and related WebSearch results — confirms Vite 7 raised minimum Node to 20.19/22.12 and changed default browser targets; Vite 8 (Rolldown/Oxc-based) confirmed current via npm registry directly. HIGH confidence.
- WebSearch on GitHub Pages SPA routing (multiple sources: dev.to, Medium, GitHub Community Discussions) — confirms the base-path + hash-routing (or 404.html-copy) pattern as the standard workaround for GitHub Pages' lack of server-side rewrites. MEDIUM confidence (community sources, but consistent across many independent write-ups and matches well-known GitHub Pages behavior).
- PROJECT.md (`.planning/PROJECT.md`) — source of hard constraints (static hosting, offline, mobile-first, single-user, restricted egress, existing validated lesson artifact style).

---
*Stack research for: static, offline-capable, content-heavy educational web app*
*Researched: 2026-08-11*
