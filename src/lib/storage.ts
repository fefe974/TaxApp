import { signal } from '@preact/signals';
import type { ReadonlySignal } from '@preact/signals';

/* =============================================================================
   Progress store — the ONLY module allowed to touch localStorage.

   - Versioned schema ({ version: 1, ... }) with a migration seam
   - Every localStorage call wrapped in try/catch (private mode, quota, etc.)
   - In-memory fallback: the app keeps working for the session if persistence
     is unavailable; it just will not survive a reload
   - Single writer: all mutations go through update(); UI consumes the
     read-only `progress` signal
   ========================================================================== */

export type ThemePref = 'system' | 'light' | 'dark';

export interface CheckRecord {
  /** Index of the choice the learner picked. */
  choice: number;
  correct: boolean;
}

export interface ProblemRecord {
  attempts: number;
  /** Best score across attempts, 0..1. */
  bestScore: number;
  /** Score of the most recent attempt, 0..1. */
  lastScore: number;
  /** True once any attempt scored 1. */
  solved: boolean;
}

export interface ProgressV1 {
  version: 1;
  theme: ThemePref;
  /** Last hash route visited, e.g. '#/chapter/ch01/lesson/2'. */
  lastLocation: string | null;
  /** sectionKey(chapterId, sectionId) -> completed */
  sections: Record<string, true>;
  /** checkKey(...) -> answer record (activation + knowledge checks) */
  checks: Record<string, CheckRecord>;
  /** problemKey(...) -> score/attempt record */
  problems: Record<string, ProblemRecord>;
}

const STORAGE_KEY = 'gat:progress'; // also read by the index.html theme bootstrap

function defaults(): ProgressV1 {
  return {
    version: 1,
    theme: 'system',
    lastLocation: null,
    sections: {},
    checks: {},
    problems: {},
  };
}

/** Best-effort migration of whatever was found in storage to V1. */
function migrate(raw: unknown): ProgressV1 {
  if (typeof raw !== 'object' || raw === null) return defaults();
  const r = raw as Record<string, unknown>;
  if (r.version !== 1) {
    // Unknown/future version: start fresh rather than misread it.
    return defaults();
  }
  const base = defaults();
  const theme = r.theme;
  if (theme === 'light' || theme === 'dark' || theme === 'system') base.theme = theme;
  if (typeof r.lastLocation === 'string') base.lastLocation = r.lastLocation;
  if (typeof r.sections === 'object' && r.sections !== null) {
    base.sections = r.sections as Record<string, true>;
  }
  if (typeof r.checks === 'object' && r.checks !== null) {
    base.checks = r.checks as Record<string, CheckRecord>;
  }
  if (typeof r.problems === 'object' && r.problems !== null) {
    base.problems = r.problems as Record<string, ProblemRecord>;
  }
  return base;
}

function load(): ProgressV1 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) return migrate(JSON.parse(raw));
  } catch {
    /* private mode / corrupted JSON / storage disabled — fall through */
  }
  return defaults();
}

const state = signal<ProgressV1>(load());

/** Read-only view for the UI. Mutate only via the functions below. */
export const progress: ReadonlySignal<ProgressV1> = state;

function persist(next: ProgressV1): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* QuotaExceededError / private mode — in-memory only for this session */
  }
}

/** Single writer: apply a mutation, publish the new value, persist. */
function update(mutator: (draft: ProgressV1) => void): void {
  const next: ProgressV1 = {
    ...state.value,
    sections: { ...state.value.sections },
    checks: { ...state.value.checks },
    problems: { ...state.value.problems },
  };
  mutator(next);
  state.value = next;
  persist(next);
}

/* ---------------- Keys ---------------- */

export function sectionKey(chapterId: string, sectionId: string): string {
  return `${chapterId}/${sectionId}`;
}

export function checkKey(
  chapterId: string,
  sectionId: string,
  slot: 'activation' | 'check',
): string {
  return `${chapterId}/${sectionId}/${slot}`;
}

export function problemKey(chapterId: string, setId: string, problemId: string): string {
  return `${chapterId}/${setId}/${problemId}`;
}

/* ---------------- Mutations ---------------- */

export function setTheme(theme: ThemePref): void {
  update((d) => {
    d.theme = theme;
  });
}

export function recordLocation(hash: string): void {
  update((d) => {
    d.lastLocation = hash;
  });
}

export function markSectionComplete(chapterId: string, sectionId: string): void {
  update((d) => {
    d.sections[sectionKey(chapterId, sectionId)] = true;
  });
}

export function recordCheckAnswer(
  chapterId: string,
  sectionId: string,
  slot: 'activation' | 'check',
  choice: number,
  correct: boolean,
): void {
  update((d) => {
    d.checks[checkKey(chapterId, sectionId, slot)] = { choice, correct };
  });
}

export function recordProblemAttempt(
  chapterId: string,
  setId: string,
  problemId: string,
  score: number,
): void {
  update((d) => {
    const key = problemKey(chapterId, setId, problemId);
    const prev = d.problems[key];
    const clamped = Math.max(0, Math.min(1, score));
    d.problems[key] = {
      attempts: (prev?.attempts ?? 0) + 1,
      bestScore: Math.max(prev?.bestScore ?? 0, clamped),
      lastScore: clamped,
      solved: (prev?.solved ?? false) || clamped >= 1,
    };
  });
}

/* ---------------- Reads ---------------- */

export function isSectionComplete(chapterId: string, sectionId: string): boolean {
  return sectionKey(chapterId, sectionId) in state.value.sections;
}

export function getCheckAnswer(
  chapterId: string,
  sectionId: string,
  slot: 'activation' | 'check',
): CheckRecord | undefined {
  return state.value.checks[checkKey(chapterId, sectionId, slot)];
}

export function getProblemRecord(
  chapterId: string,
  setId: string,
  problemId: string,
): ProblemRecord | undefined {
  return state.value.problems[problemKey(chapterId, setId, problemId)];
}
