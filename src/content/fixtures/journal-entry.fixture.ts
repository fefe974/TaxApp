import type { JournalEntryProblemInput } from '../schema';

/** Fixture proving the journal-entry problem type is representable. */
export const journalEntryFixture: JournalEntryProblemInput = {
  type: 'journal-entry',
  id: 'fx-je-property-tax-levy',
  title: 'Record the property tax levy',
  scenario:
    'The county levies property taxes of <strong>$1,000,000</strong>. Past experience shows about 2% will prove uncollectible. Record the levy in the General Fund.',
  accounts: [
    'Taxes Receivable — Current',
    'Allowance for Uncollectible Current Taxes',
    'Revenues — Property Taxes',
    'Cash',
    'Deferred Inflows of Resources',
  ],
  answerKey: [
    {
      account: 'Taxes Receivable — Current',
      aliases: ['Taxes Receivable', 'Property Taxes Receivable'],
      side: 'debit',
      amount: 1_000_000,
    },
    {
      account: 'Allowance for Uncollectible Current Taxes',
      aliases: ['Allowance for Uncollectible Taxes', 'Estimated Uncollectible Taxes'],
      side: 'credit',
      amount: 20_000,
    },
    {
      account: 'Revenues — Property Taxes',
      aliases: ['Property Tax Revenues', 'Revenues'],
      side: 'credit',
      amount: 980_000,
    },
  ],
  tolerance: 0.01,
  explanation:
    'The receivable is debited for the full levy. Because governmental funds record revenue net of estimated uncollectibles (no bad debt expense), the allowance is credited for $20,000 and Revenues for the $980,000 expected to be collected.',
};
