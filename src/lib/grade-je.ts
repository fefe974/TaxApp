import type { JournalLineKey } from '../content/schema';

/* =============================================================================
   Tolerant journal-entry grader — a PURE function. No DOM, no storage.

   - Order-insensitive line matching
   - Account alias acceptance (case/whitespace/punctuation-insensitive)
   - Numeric tolerance: ±0.01 default, per-problem and per-line override
   - Line-by-line verdicts: correct / wrong-amount / wrong-side / missing / extra
   ========================================================================== */

export interface SubmittedLine {
  account: string;
  side: 'debit' | 'credit';
  amount: number;
}

export type SubmittedVerdictKind = 'correct' | 'wrong-amount' | 'wrong-side' | 'extra';

export interface SubmittedVerdict {
  kind: SubmittedVerdictKind;
  /** The key line this submitted line was matched against (absent for 'extra'). */
  expected?: JournalLineKey;
}

export interface JEGradeResult {
  /** True when every answer-key line is correct and there are no extra lines. */
  correct: boolean;
  /** Correct key lines / total key lines, 0..1. */
  score: number;
  /** One verdict per submitted line, index-aligned with the submission. */
  lines: SubmittedVerdict[];
  /** Answer-key lines with no matching submitted line. */
  missing: JournalLineKey[];
}

export interface JEGradeSpec {
  answerKey: JournalLineKey[];
  /** Problem-level tolerance; defaults to 0.01. */
  tolerance?: number;
}

/** Case/whitespace/punctuation-insensitive account-name normalization. */
export function normalizeAccount(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function accountMatches(key: JournalLineKey, submittedAccount: string): boolean {
  const norm = normalizeAccount(submittedAccount);
  if (norm.length === 0) return false;
  if (normalizeAccount(key.account) === norm) return true;
  return (key.aliases ?? []).some((alias) => normalizeAccount(alias) === norm);
}

function amountMatches(key: JournalLineKey, amount: number, problemTolerance: number): boolean {
  const tol = key.tolerance ?? problemTolerance;
  return Math.abs(amount - key.amount) <= tol + 1e-9;
}

/**
 * Grade a submitted journal entry against an answer key.
 *
 * Matching passes (greedy, each submitted/key line used at most once):
 *   1. account + side + amount(±tol)  → correct
 *   2. account + side                 → wrong-amount
 *   3. account (side differs)         → wrong-side
 * Unmatched key lines are 'missing'; unmatched submitted lines are 'extra'.
 */
export function gradeJournalEntry(
  submitted: SubmittedLine[],
  spec: JEGradeSpec,
): JEGradeResult {
  const tolerance = spec.tolerance ?? 0.01;
  const key = spec.answerKey;

  const keyMatched: (number | null)[] = key.map(() => null); // submitted index
  const keyKind: ('correct' | 'wrong-amount' | 'wrong-side' | 'missing')[] = key.map(
    () => 'missing',
  );
  const subUsed: boolean[] = submitted.map(() => false);

  const passes: Array<{
    kind: 'correct' | 'wrong-amount' | 'wrong-side';
    match: (k: JournalLineKey, s: SubmittedLine) => boolean;
  }> = [
    {
      kind: 'correct',
      match: (k, s) =>
        accountMatches(k, s.account) && k.side === s.side && amountMatches(k, s.amount, tolerance),
    },
    {
      kind: 'wrong-amount',
      match: (k, s) => accountMatches(k, s.account) && k.side === s.side,
    },
    {
      kind: 'wrong-side',
      match: (k, s) => accountMatches(k, s.account) && k.side !== s.side,
    },
  ];

  for (const pass of passes) {
    key.forEach((k, ki) => {
      if (keyMatched[ki] !== null) return;
      for (let si = 0; si < submitted.length; si++) {
        if (subUsed[si]) continue;
        if (pass.match(k, submitted[si])) {
          keyMatched[ki] = si;
          keyKind[ki] = pass.kind;
          subUsed[si] = true;
          break;
        }
      }
    });
  }

  const lines: SubmittedVerdict[] = submitted.map((_, si) => {
    const ki = keyMatched.indexOf(si);
    if (ki === -1) return { kind: 'extra' };
    return { kind: keyKind[ki] as SubmittedVerdictKind, expected: key[ki] };
  });

  const missing = key.filter((_, ki) => keyMatched[ki] === null);
  const correctCount = keyKind.filter((k) => k === 'correct').length;
  const score = key.length === 0 ? 0 : correctCount / key.length;
  const correct = correctCount === key.length && lines.every((l) => l.kind !== 'extra');

  return { correct, score, lines, missing };
}
