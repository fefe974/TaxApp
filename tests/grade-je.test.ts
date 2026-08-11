import { describe, expect, it } from 'vitest';
import { gradeJournalEntry, normalizeAccount, type JEGradeSpec } from '../src/lib/grade-je';

/* Answer key used across cases:
     Dr Taxes Receivable — Current           1,000,000
        Cr Allowance for Uncollectible Taxes    20,000
        Cr Revenues — Property Taxes           980,000
*/
const spec: JEGradeSpec = {
  tolerance: 0.01,
  answerKey: [
    {
      account: 'Taxes Receivable — Current',
      aliases: ['Taxes Receivable', 'Property Taxes Receivable'],
      side: 'debit',
      amount: 1_000_000,
    },
    {
      account: 'Allowance for Uncollectible Taxes',
      aliases: ['Estimated Uncollectible Taxes'],
      side: 'credit',
      amount: 20_000,
    },
    {
      account: 'Revenues — Property Taxes',
      aliases: ['Property Tax Revenues'],
      side: 'credit',
      amount: 980_000,
    },
  ],
};

const perfect = [
  { account: 'Taxes Receivable — Current', side: 'debit' as const, amount: 1_000_000 },
  { account: 'Allowance for Uncollectible Taxes', side: 'credit' as const, amount: 20_000 },
  { account: 'Revenues — Property Taxes', side: 'credit' as const, amount: 980_000 },
];

describe('gradeJournalEntry', () => {
  it('grades a fully correct entry as correct with score 1', () => {
    const result = gradeJournalEntry(perfect, spec);
    expect(result.correct).toBe(true);
    expect(result.score).toBe(1);
    expect(result.missing).toHaveLength(0);
    expect(result.lines.map((l) => l.kind)).toEqual(['correct', 'correct', 'correct']);
  });

  it('is order-insensitive: reordered lines still grade correct', () => {
    const reordered = [perfect[2], perfect[0], perfect[1]];
    const result = gradeJournalEntry(reordered, spec);
    expect(result.correct).toBe(true);
    expect(result.score).toBe(1);
    expect(result.lines.map((l) => l.kind)).toEqual(['correct', 'correct', 'correct']);
  });

  it('accepts account aliases (and ignores case/punctuation differences)', () => {
    const aliased = [
      { account: 'property taxes receivable', side: 'debit' as const, amount: 1_000_000 },
      { account: 'ESTIMATED UNCOLLECTIBLE TAXES', side: 'credit' as const, amount: 20_000 },
      { account: 'Property Tax Revenues', side: 'credit' as const, amount: 980_000 },
    ];
    const result = gradeJournalEntry(aliased, spec);
    expect(result.correct).toBe(true);
    expect(result.score).toBe(1);
  });

  it('accepts amounts within the ±0.01 tolerance', () => {
    const rounded = [
      { account: 'Taxes Receivable — Current', side: 'debit' as const, amount: 1_000_000.01 },
      { account: 'Allowance for Uncollectible Taxes', side: 'credit' as const, amount: 19_999.99 },
      { account: 'Revenues — Property Taxes', side: 'credit' as const, amount: 980_000 },
    ];
    const result = gradeJournalEntry(rounded, spec);
    expect(result.correct).toBe(true);
    expect(result.score).toBe(1);
  });

  it('honors a per-line tolerance override', () => {
    const loose: JEGradeSpec = {
      tolerance: 0.01,
      answerKey: [
        { account: 'Cash', aliases: [], side: 'debit', amount: 100, tolerance: 1 },
        { account: 'Revenues', aliases: [], side: 'credit', amount: 100 },
      ],
    };
    const result = gradeJournalEntry(
      [
        { account: 'Cash', side: 'debit', amount: 100.75 },
        { account: 'Revenues', side: 'credit', amount: 100 },
      ],
      loose,
    );
    expect(result.correct).toBe(true);
  });

  it('flags an amount outside tolerance as wrong-amount', () => {
    const wrongAmount = [
      perfect[0],
      { account: 'Allowance for Uncollectible Taxes', side: 'credit' as const, amount: 25_000 },
      perfect[2],
    ];
    const result = gradeJournalEntry(wrongAmount, spec);
    expect(result.correct).toBe(false);
    expect(result.score).toBeCloseTo(2 / 3);
    expect(result.lines[1].kind).toBe('wrong-amount');
    expect(result.lines[1].expected?.account).toBe('Allowance for Uncollectible Taxes');
  });

  it('flags a debit/credit reversal as wrong-side', () => {
    const flipped = [
      { account: 'Taxes Receivable — Current', side: 'credit' as const, amount: 1_000_000 },
      perfect[1],
      perfect[2],
    ];
    const result = gradeJournalEntry(flipped, spec);
    expect(result.correct).toBe(false);
    expect(result.lines[0].kind).toBe('wrong-side');
    expect(result.lines[0].expected?.side).toBe('debit');
  });

  it('reports an omitted key line as missing', () => {
    const short = [perfect[0], perfect[2]];
    const result = gradeJournalEntry(short, spec);
    expect(result.correct).toBe(false);
    expect(result.score).toBeCloseTo(2 / 3);
    expect(result.missing).toHaveLength(1);
    expect(result.missing[0].account).toBe('Allowance for Uncollectible Taxes');
  });

  it('reports a superfluous line as extra (and not correct overall)', () => {
    const withExtra = [
      ...perfect,
      { account: 'Cash', side: 'debit' as const, amount: 1 },
    ];
    const result = gradeJournalEntry(withExtra, spec);
    expect(result.correct).toBe(false);
    expect(result.score).toBe(1); // all key lines matched…
    expect(result.lines[3].kind).toBe('extra'); // …but the entry is not clean
  });

  it('does not let a wrong-side match steal an exact match for the same account', () => {
    // Two lines hit the same account; the exact one must claim it first.
    const twoCash: JEGradeSpec = {
      answerKey: [
        { account: 'Cash', aliases: [], side: 'debit', amount: 500 },
        { account: 'Revenues', aliases: [], side: 'credit', amount: 500 },
      ],
    };
    const result = gradeJournalEntry(
      [
        { account: 'Cash', side: 'credit', amount: 500 }, // wrong-side attempt
        { account: 'Cash', side: 'debit', amount: 500 }, // exact
        { account: 'Revenues', side: 'credit', amount: 500 },
      ],
      twoCash,
    );
    expect(result.lines[1].kind).toBe('correct');
    // The duplicate attempt is left over once the exact match claims the key
    // line, so it is an extra line — not a wrong-side downgrade of the match.
    expect(result.lines[0].kind).toBe('extra');
  });
});

describe('normalizeAccount', () => {
  it('collapses case, whitespace, and punctuation', () => {
    expect(normalizeAccount('  Revenues — Property   Taxes ')).toBe('revenues property taxes');
    expect(normalizeAccount('REVENUES-PROPERTY TAXES')).toBe('revenues property taxes');
  });
});
