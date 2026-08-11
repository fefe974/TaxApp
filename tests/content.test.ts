import { describe, expect, it } from 'vitest';
import {
  chapterSchema,
  journalEntryProblemSchema,
  classificationProblemSchema,
  reconciliationProblemSchema,
  multiPartProblemSchema,
  problemSchema,
} from '../src/content/schema';
import { journalEntryFixture } from '../src/content/fixtures/journal-entry.fixture';
import { classificationFixture } from '../src/content/fixtures/classification.fixture';
import { reconciliationFixture } from '../src/content/fixtures/reconciliation.fixture';
import { multiPartFixture } from '../src/content/fixtures/multi-part.fixture';

describe('chapter modules', () => {
  // Every module under src/content/chapters/ must zod-parse cleanly.
  const modules = import.meta.glob<{ default: unknown }>('../src/content/chapters/*.ts', {
    eager: true,
  });
  const entries = Object.entries(modules);

  it('finds at least one chapter module', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  for (const [path, mod] of entries) {
    it(`zod-parses ${path.split('/').pop()}`, () => {
      const parsed = chapterSchema.parse(mod.default);
      expect(parsed.sections.length).toBeGreaterThan(0);
    });
  }
});

describe('problem-type fixtures (schema representability proof)', () => {
  it('journal-entry fixture parses', () => {
    const parsed = journalEntryProblemSchema.parse(journalEntryFixture);
    expect(parsed.tolerance).toBe(0.01);
    expect(parsed.answerKey.length).toBeGreaterThanOrEqual(2);
  });

  it('classification fixture parses', () => {
    const parsed = classificationProblemSchema.parse(classificationFixture);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(2);
  });

  it('reconciliation fixture parses', () => {
    const parsed = reconciliationProblemSchema.parse(reconciliationFixture);
    expect(parsed.items.length).toBeGreaterThan(0);
  });

  it('multi-part fixture parses', () => {
    const parsed = multiPartProblemSchema.parse(multiPartFixture);
    expect(parsed.parts.length).toBeGreaterThanOrEqual(2);
  });

  it('all four types parse through the discriminated union', () => {
    for (const fixture of [
      journalEntryFixture,
      classificationFixture,
      reconciliationFixture,
      multiPartFixture,
    ]) {
      expect(() => problemSchema.parse(fixture)).not.toThrow();
    }
  });
});

describe('schema invariants', () => {
  it('rejects an unbalanced journal-entry answer key', () => {
    const unbalanced = {
      ...journalEntryFixture,
      answerKey: [
        { account: 'Taxes Receivable — Current', side: 'debit', amount: 100 },
        { account: 'Revenues — Property Taxes', side: 'credit', amount: 90 },
      ],
    };
    expect(() => journalEntryProblemSchema.parse(unbalanced)).toThrow();
  });

  it('rejects an answer-key account missing from the catalog', () => {
    const offCatalog = {
      ...journalEntryFixture,
      answerKey: [
        { account: 'Not In Catalog', side: 'debit', amount: 100 },
        { account: 'Revenues — Property Taxes', side: 'credit', amount: 100 },
      ],
    };
    expect(() => journalEntryProblemSchema.parse(offCatalog)).toThrow();
  });

  it('rejects a knowledge-check answer index out of range', () => {
    const badChapter = {
      id: 'ch99',
      number: 99,
      title: 'Bad',
      bookAlignment: 'n/a',
      blurb: 'bad',
      sections: [
        {
          id: 's1',
          short: 'S1',
          title: 'S1',
          kicker: 'k',
          html: ['<p>x</p>'],
          knowledgeCheck: {
            prompt: 'q',
            choices: ['a', 'b'],
            answer: 5,
            explain: 'e',
          },
        },
      ],
    };
    expect(() => chapterSchema.parse(badChapter)).toThrow();
  });
});
