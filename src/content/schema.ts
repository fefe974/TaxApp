import { z } from 'zod';

/* =============================================================================
   Content schema — the contract every chapter module must satisfy.

   Authored content is typed as the *input* side of these schemas (defaults not
   yet applied) and is parsed through `chapterSchema` at load time in
   src/content/index.ts, so malformed AI-authored content fails loudly instead
   of rendering blank on the learner's phone.
   ========================================================================== */

/* ---------------- Knowledge checks / activation beats ---------------- */

/**
 * A single multiple-choice beat: used both as an "activation" prediction at
 * the top of a section and as an inline knowledge check. Immediate
 * explanatory feedback is shown after answering; never gates navigation.
 */
export const knowledgeCheckSchema = z
  .object({
    /** Small mono label above the prompt, e.g. "Predict first", "Your turn". */
    tag: z.string().default('Your turn'),
    /** Small time hint, e.g. "30 sec". */
    time: z.string().default('30 sec'),
    prompt: z.string().min(1),
    choices: z.array(z.string().min(1)).min(2),
    /** Index into `choices` of the correct answer. */
    answer: z.number().int().nonnegative(),
    /** Explanatory feedback shown after answering (HTML allowed). */
    explain: z.string().min(1),
  })
  .refine((c) => c.answer < c.choices.length, {
    message: 'answer index must point at an existing choice',
  });

/* ---------------- Lesson sections ---------------- */

export const lessonSectionSchema = z.object({
  /** Slug unique within the chapter, e.g. 'welcome'. */
  id: z.string().min(1),
  /** Short label for the rail / mobile stepper. */
  short: z.string().min(1),
  title: z.string().min(1),
  /** Mono kicker line above the title, e.g. 'Setting the stage'. */
  kicker: z.string().min(1),
  /** Optional prediction beat rendered before the prose. */
  activation: knowledgeCheckSchema.optional(),
  /**
   * The section body as HTML blocks using the app's design classes
   * (ga-lead, ga-figure, ga-example, ga-note, ga-takeaway, ...).
   */
  html: z.array(z.string().min(1)).min(1),
  /** Optional inline check rendered after the prose. */
  knowledgeCheck: knowledgeCheckSchema.optional(),
  /** County Accountant I job duties this section supports (Phase 3 groundwork). */
  jobDuties: z.array(z.string()).default([]),
});

/* ---------------- Problem types ---------------- */

/** One line of a journal-entry answer key. */
export const journalLineKeySchema = z.object({
  /** Canonical account name (shown in the account catalog). */
  account: z.string().min(1),
  /** Equivalent account names accepted by the grader. */
  aliases: z.array(z.string().min(1)).default([]),
  side: z.enum(['debit', 'credit']),
  amount: z.number().nonnegative(),
  /** Per-line tolerance override (defaults to the problem tolerance). */
  tolerance: z.number().nonnegative().optional(),
});

export const journalEntryProblemSchema = z
  .object({
    type: z.literal('journal-entry'),
    /** Slug unique within the chapter, e.g. 'je-receive-cash'. */
    id: z.string().min(1),
    title: z.string().min(1),
    /** The transaction narrative (HTML allowed). */
    scenario: z.string().min(1),
    /**
     * Account catalog offered by the picker. Must include every answer-key
     * account; should include plausible distractors.
     */
    accounts: z.array(z.string().min(1)).min(2),
    answerKey: z.array(journalLineKeySchema).min(2),
    /** Numeric tolerance for amounts. ±0.01 default; per-problem override. */
    tolerance: z.number().nonnegative().default(0.01),
    /** Teaching explanation revealed after grading (HTML allowed). */
    explanation: z.string().min(1),
  })
  .refine(
    (p) =>
      p.answerKey.every((line) =>
        p.accounts.some((a) => a.trim().toLowerCase() === line.account.trim().toLowerCase()),
      ),
    { message: 'every answer-key account must appear in the accounts catalog' },
  )
  .refine(
    (p) => {
      const sum = (side: 'debit' | 'credit') =>
        p.answerKey
          .filter((l) => l.side === side)
          .reduce((t, l) => t + l.amount, 0);
      return Math.abs(sum('debit') - sum('credit')) < 0.005;
    },
    { message: 'answer key must balance: total debits must equal total credits' },
  );

/** Sort items into categories (e.g. fund types, gov vs NFP vs business). */
export const classificationProblemSchema = z
  .object({
    type: z.literal('classification'),
    id: z.string().min(1),
    title: z.string().min(1),
    scenario: z.string().min(1),
    categories: z
      .array(z.object({ id: z.string().min(1), label: z.string().min(1) }))
      .min(2),
    items: z
      .array(
        z.object({
          id: z.string().min(1),
          text: z.string().min(1),
          /** id of the correct category. */
          answer: z.string().min(1),
          /** Per-item feedback (HTML allowed). */
          explain: z.string().optional(),
        }),
      )
      .min(1),
    explanation: z.string().min(1),
  })
  .refine(
    (p) => p.items.every((i) => p.categories.some((c) => c.id === i.answer)),
    { message: 'every item answer must reference an existing category id' },
  );

/**
 * Reconciliation worksheet: start from a balance, decide for each candidate
 * item whether it is added, subtracted, or excluded, arriving at a target.
 */
export const reconciliationProblemSchema = z.object({
  type: z.literal('reconciliation'),
  id: z.string().min(1),
  title: z.string().min(1),
  scenario: z.string().min(1),
  /** e.g. 'Balance per bank statement'. */
  startingLabel: z.string().min(1),
  startingBalance: z.number(),
  /** e.g. 'Adjusted balance per books'. */
  targetLabel: z.string().min(1),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        description: z.string().min(1),
        /** Positive magnitude; the learner chooses the treatment. */
        amount: z.number().nonnegative(),
        answer: z.enum(['add', 'subtract', 'exclude']),
        explain: z.string().optional(),
      }),
    )
    .min(1),
  tolerance: z.number().nonnegative().default(0.01),
  explanation: z.string().min(1),
});

/** Sub-problems allowed inside a multi-part problem (no nesting). */
export const multiPartSubProblemSchema = z.discriminatedUnion('type', [
  journalEntryProblemSchema,
  classificationProblemSchema,
  reconciliationProblemSchema,
]);

/**
 * CPA-simulation-style problem: one shared scenario, several graded parts,
 * each part being one of the other problem types.
 */
export const multiPartProblemSchema = z.object({
  type: z.literal('multi-part'),
  id: z.string().min(1),
  title: z.string().min(1),
  /** Shared scenario for all parts (HTML allowed). */
  scenario: z.string().min(1),
  parts: z
    .array(
      z.object({
        id: z.string().min(1),
        /** Lead-in for this part, e.g. 'Part (a): record the levy.' */
        intro: z.string().min(1),
        problem: multiPartSubProblemSchema,
      }),
    )
    .min(2),
  explanation: z.string().min(1),
});

export const problemSchema = z.discriminatedUnion('type', [
  journalEntryProblemSchema,
  classificationProblemSchema,
  reconciliationProblemSchema,
  multiPartProblemSchema,
]);

/* ---------------- Practice sets & chapters ---------------- */

export const practiceSetSchema = z.object({
  /** Slug unique within the chapter, e.g. 'set-a'. */
  id: z.string().min(1),
  title: z.string().min(1),
  blurb: z.string().default(''),
  problems: z.array(problemSchema).min(1),
  /**
   * Hide from navigation (schema-proving fixtures, not-yet-built engines).
   * Hidden sets are still validated.
   */
  hidden: z.boolean().default(false),
});

export const chapterSchema = z
  .object({
    /** Slug used in routes, e.g. 'ch01' → #/chapter/ch01. */
    id: z.string().regex(/^ch\d{2}$/, "chapter id must look like 'ch01'"),
    number: z.number().int().positive(),
    title: z.string().min(1),
    /** Topic alignment note, e.g. 'Reck/Lowensohn/Neely 18e, Chapter 1'. */
    bookAlignment: z.string().min(1),
    /** County Accountant I duties this chapter serves. */
    jobDuties: z.array(z.string()).default([]),
    /** Card blurb on the home screen. */
    blurb: z.string().min(1),
    /** Rough lesson length in minutes, for the chapter card. */
    minutes: z.number().int().positive().default(20),
    sections: z.array(lessonSectionSchema).min(1),
    practiceSets: z.array(practiceSetSchema).default([]),
  })
  .refine(
    (c) => new Set(c.sections.map((s) => s.id)).size === c.sections.length,
    { message: 'section ids must be unique within a chapter' },
  )
  .refine(
    (c) => new Set(c.practiceSets.map((s) => s.id)).size === c.practiceSets.length,
    { message: 'practice-set ids must be unique within a chapter' },
  );

/* ---------------- Inferred types ---------------- */

/** Parsed (defaults applied) — what the app consumes. */
export type KnowledgeCheck = z.output<typeof knowledgeCheckSchema>;
export type LessonSection = z.output<typeof lessonSectionSchema>;
export type JournalLineKey = z.output<typeof journalLineKeySchema>;
export type JournalEntryProblem = z.output<typeof journalEntryProblemSchema>;
export type ClassificationProblem = z.output<typeof classificationProblemSchema>;
export type ReconciliationProblem = z.output<typeof reconciliationProblemSchema>;
export type MultiPartProblem = z.output<typeof multiPartProblemSchema>;
export type Problem = z.output<typeof problemSchema>;
export type PracticeSet = z.output<typeof practiceSetSchema>;
export type Chapter = z.output<typeof chapterSchema>;

/** Authoring types (defaults optional) — what chapter modules export. */
export type KnowledgeCheckInput = z.input<typeof knowledgeCheckSchema>;
export type LessonSectionInput = z.input<typeof lessonSectionSchema>;
export type JournalEntryProblemInput = z.input<typeof journalEntryProblemSchema>;
export type ClassificationProblemInput = z.input<typeof classificationProblemSchema>;
export type ReconciliationProblemInput = z.input<typeof reconciliationProblemSchema>;
export type MultiPartProblemInput = z.input<typeof multiPartProblemSchema>;
export type ProblemInput = z.input<typeof problemSchema>;
export type PracticeSetInput = z.input<typeof practiceSetSchema>;
export type ChapterInput = z.input<typeof chapterSchema>;
