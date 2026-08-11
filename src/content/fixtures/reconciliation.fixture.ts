import type { ReconciliationProblemInput } from '../schema';

/** Fixture proving the reconciliation problem type is representable. */
export const reconciliationFixture: ReconciliationProblemInput = {
  type: 'reconciliation',
  id: 'fx-recon-bank',
  title: 'Bank reconciliation — General Fund checking',
  scenario:
    'The bank statement shows <strong>$48,200</strong>. Decide how each item affects the bank balance to reach the adjusted cash balance.',
  startingLabel: 'Balance per bank statement',
  startingBalance: 48_200,
  targetLabel: 'Adjusted bank balance',
  items: [
    {
      id: 'deposits-in-transit',
      description: 'Deposits in transit',
      amount: 3_500,
      answer: 'add',
      explain: 'Receipts recorded on the books but not yet by the bank — add to the bank side.',
    },
    {
      id: 'outstanding-checks',
      description: 'Outstanding checks',
      amount: 5_120,
      answer: 'subtract',
      explain: 'Checks written but not yet cleared — subtract from the bank side.',
    },
    {
      id: 'bank-service-fee',
      description: 'Bank service fee (already on the statement)',
      amount: 45,
      answer: 'exclude',
      explain: 'The fee adjusts the book side, not the bank side — exclude it here.',
    },
  ],
  tolerance: 0.01,
  explanation:
    'Adjusted bank balance = $48,200 + $3,500 − $5,120 = $46,580. The service fee belongs on the book side of the reconciliation.',
};
