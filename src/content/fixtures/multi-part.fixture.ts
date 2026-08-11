import type { MultiPartProblemInput } from '../schema';

/** Fixture proving the multi-part problem type is representable. */
export const multiPartFixture: MultiPartProblemInput = {
  type: 'multi-part',
  id: 'fx-multi-tax-cycle',
  title: 'Property tax cycle — levy through collection',
  scenario:
    'The county levies <strong>$200,000</strong> of property taxes, expecting 1% to be uncollectible, then collects $150,000 of them in cash. Work each part in order.',
  parts: [
    {
      id: 'part-a',
      intro: 'Part (a): classify the transaction stream.',
      problem: {
        type: 'classification',
        id: 'fx-multi-part-a',
        title: 'Exchange or nonexchange?',
        scenario: 'Property taxes are which kind of transaction?',
        categories: [
          { id: 'exchange', label: 'Exchange transaction' },
          { id: 'nonexchange', label: 'Nonexchange transaction' },
        ],
        items: [
          {
            id: 'prop-tax',
            text: 'Property tax levy',
            answer: 'nonexchange',
            explain: 'The taxpayer receives no proportionate good or service in return.',
          },
        ],
        explanation: 'Taxes are imposed nonexchange revenues — value flows one way.',
      },
    },
    {
      id: 'part-b',
      intro: 'Part (b): record the levy.',
      problem: {
        type: 'journal-entry',
        id: 'fx-multi-part-b',
        title: 'Record the levy',
        scenario: 'Record the $200,000 levy with 1% estimated uncollectible.',
        accounts: [
          'Taxes Receivable — Current',
          'Allowance for Uncollectible Current Taxes',
          'Revenues — Property Taxes',
          'Cash',
        ],
        answerKey: [
          { account: 'Taxes Receivable — Current', side: 'debit', amount: 200_000 },
          {
            account: 'Allowance for Uncollectible Current Taxes',
            side: 'credit',
            amount: 2_000,
          },
          { account: 'Revenues — Property Taxes', side: 'credit', amount: 198_000 },
        ],
        explanation:
          'Levy the full receivable; credit the allowance for the estimated uncollectible portion and revenues for the net.',
      },
    },
  ],
  explanation:
    'The full cycle — classify, levy, collect — mirrors how a county actually books its largest revenue source.',
};
