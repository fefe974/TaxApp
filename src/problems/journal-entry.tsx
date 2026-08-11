import { useState } from 'preact/hooks';
import type { JournalEntryProblem } from '../content/schema';
import {
  gradeJournalEntry,
  type JEGradeResult,
  type SubmittedLine,
} from '../lib/grade-je';
import { recordProblemAttempt } from '../lib/storage';

interface DraftLine {
  account: string;
  debit: string;
  credit: string;
}

const emptyLine = (): DraftLine => ({ account: '', debit: '', credit: '' });

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function toSubmitted(lines: DraftLine[]): SubmittedLine[] {
  const out: SubmittedLine[] = [];
  for (const line of lines) {
    const debit = parseAmount(line.debit);
    const credit = parseAmount(line.credit);
    if (line.account === '' && debit === null && credit === null) continue; // blank row
    out.push({
      account: line.account,
      side: debit !== null ? 'debit' : 'credit',
      amount: debit ?? credit ?? 0,
    });
  }
  return out;
}

const VERDICT_LABEL: Record<string, string> = {
  correct: 'Correct',
  'wrong-amount': 'Wrong amount',
  'wrong-side': 'Wrong side',
  extra: 'Extra line',
  missing: 'Missing',
};

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

interface Props {
  problem: JournalEntryProblem;
  chapterId: string;
  setId: string;
}

/**
 * Journal-entry practice engine: account picker from the problem's catalog,
 * debit/credit amount columns, tolerant grading with line-by-line verdicts,
 * explanation reveal, and retry. Scores recorded via the progress store.
 */
export function JournalEntryEngine({ problem, chapterId, setId }: Props) {
  const [lines, setLines] = useState<DraftLine[]>([emptyLine(), emptyLine()]);
  const [result, setResult] = useState<JEGradeResult | null>(null);
  const graded = result !== null;

  const setLine = (i: number, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  };

  const submitted = toSubmitted(lines);
  const totals = submitted.reduce(
    (t, l) => {
      if (l.side === 'debit') t.debit += l.amount;
      else t.credit += l.amount;
      return t;
    },
    { debit: 0, credit: 0 },
  );
  const balanced = Math.abs(totals.debit - totals.credit) < 0.005 && totals.debit > 0;
  const canGrade = submitted.length >= 2 && submitted.every((l) => l.account !== '');

  const check = () => {
    const grade = gradeJournalEntry(submitted, problem);
    setResult(grade);
    recordProblemAttempt(chapterId, setId, problem.id, grade.score);
  };

  const retry = () => {
    setResult(null);
  };

  // Verdicts are index-aligned with `submitted`; map back to draft rows.
  let submittedIdx = -1;
  const verdictFor = (line: DraftLine): string | null => {
    if (!result) return null;
    const debit = parseAmount(line.debit);
    const credit = parseAmount(line.credit);
    if (line.account === '' && debit === null && credit === null) return null;
    submittedIdx += 1;
    return result.lines[submittedIdx]?.kind ?? null;
  };

  return (
    <div class="ga-je">
      <div class="ga-je-lines">
        {lines.map((line, i) => {
          const verdict = verdictFor(line);
          const expected = verdict !== null && result
            ? result.lines[submittedIdx]?.expected
            : undefined;
          return (
            <div class="ga-je-line" key={i} data-verdict={verdict ?? undefined}>
              <div class="ga-je-line-top">
                <select
                  class="ga-je-account"
                  aria-label={`Line ${i + 1} account`}
                  disabled={graded}
                  value={line.account}
                  onChange={(e) => setLine(i, { account: (e.target as HTMLSelectElement).value })}
                >
                  <option value="">Choose account…</option>
                  {problem.accounts.map((a) => (
                    <option value={a} key={a}>
                      {a}
                    </option>
                  ))}
                </select>
                {lines.length > 2 && !graded && (
                  <button
                    type="button"
                    class="ga-je-remove"
                    aria-label={`Remove line ${i + 1}`}
                    onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div class="ga-je-amounts">
                <span class="ga-je-amount">
                  <label for={`je-${problem.id}-${i}-dr`}>Debit</label>
                  <input
                    id={`je-${problem.id}-${i}-dr`}
                    inputMode="decimal"
                    autocomplete="off"
                    placeholder="0.00"
                    disabled={graded || line.credit !== ''}
                    value={line.debit}
                    onInput={(e) => setLine(i, { debit: (e.target as HTMLInputElement).value })}
                  />
                </span>
                <span class="ga-je-amount">
                  <label for={`je-${problem.id}-${i}-cr`}>Credit</label>
                  <input
                    id={`je-${problem.id}-${i}-cr`}
                    inputMode="decimal"
                    autocomplete="off"
                    placeholder="0.00"
                    disabled={graded || line.debit !== ''}
                    value={line.credit}
                    onInput={(e) => setLine(i, { credit: (e.target as HTMLInputElement).value })}
                  />
                </span>
              </div>
              {verdict && (
                <div class="ga-je-verdict">
                  <span class="ga-verdict-badge" data-kind={verdict}>
                    {VERDICT_LABEL[verdict]}
                  </span>
                  {verdict === 'wrong-amount' && expected && (
                    <span>Right account and side — check the amount.</span>
                  )}
                  {verdict === 'wrong-side' && expected && (
                    <span>
                      {expected.account} belongs on the {expected.side} side here.
                    </span>
                  )}
                  {verdict === 'extra' && <span>The correct entry does not need this line.</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!graded && (
        <div class="ga-je-actions">
          <button
            type="button"
            class="ga-je-add"
            onClick={() => setLines((prev) => [...prev, emptyLine()])}
          >
            + Add line
          </button>
        </div>
      )}

      <div class="ga-je-totals" aria-live="polite">
        <span>
          Dr <b>{fmt(totals.debit)}</b>
        </span>
        <span>
          Cr <b>{fmt(totals.credit)}</b>
        </span>
        <span class={balanced ? 'ga-balanced' : 'ga-unbalanced'}>
          {balanced ? 'Balanced' : 'Not balanced'}
        </span>
      </div>

      {graded && result.missing.length > 0 && (
        <div class="ga-je-missing" style={{ marginTop: '10px' }}>
          <span class="ga-verdict-badge" data-kind="missing">
            Missing
          </span>{' '}
          Your entry still needs:{' '}
          {result.missing
            .map((m) => `${m.side === 'debit' ? 'Dr' : 'Cr'} ${m.account} ${fmt(m.amount)}`)
            .join('; ')}
        </div>
      )}

      {graded && (
        <div
          class={`ga-quiz-feedback ${result.correct ? 'ga-fb-right' : 'ga-fb-wrong'}`}
          role="status"
        >
          <strong>{result.correct ? 'Correct entry.' : `Score: ${Math.round(result.score * 100)}%`}</strong>
          {result.correct
            ? 'Debits equal credits and every line matches.'
            : 'Review the line-by-line verdicts above, then try again.'}
        </div>
      )}

      {graded && (
        <div class="ga-explain">
          <span class="ga-callout-tag ga-mono">Explanation</span>
          <p dangerouslySetInnerHTML={{ __html: problem.explanation }} />
        </div>
      )}

      <div class="ga-je-actions">
        {!graded ? (
          <button
            type="button"
            class="ga-btn ga-btn-primary"
            disabled={!canGrade}
            onClick={check}
          >
            Check my entry
          </button>
        ) : (
          <button type="button" class="ga-btn" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
