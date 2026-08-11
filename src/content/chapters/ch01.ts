import type { ChapterInput } from '../schema';

/**
 * STUB CHAPTER — placeholder so the app runs end-to-end.
 * Plan 02 replaces this with the full Chapter 1 curriculum
 * ("Government and Not-for-Profit Environment", book Ch. 1 alignment).
 */
const ch01: ChapterInput = {
  id: 'ch01',
  number: 1,
  title: 'Government and Not-for-Profit Environment',
  bookAlignment: 'Reck, Lowensohn & Neely 18e — Chapter 1 (topic alignment)',
  jobDuties: ['GL reconciliation', 'Journal entries'],
  blurb:
    'Why governments are a different accounting world from business — and why a county has no bottom line. Full lesson content arriving with the next update.',
  minutes: 20,
  sections: [
    {
      id: 'welcome',
      short: 'Welcome',
      title: 'Welcome: a different kind of accounting',
      kicker: 'Setting the stage',
      activation: {
        tag: 'Predict first',
        time: '30 sec',
        prompt:
          'Commit to an answer before you read. A county collects $10 million in taxes and spends $9 million. Did the county have a good year?',
        choices: [
          'Yes — a $1 million surplus means it performed well',
          'No — a surplus means it overtaxed its residents',
          'You cannot tell from those two numbers alone',
        ],
        answer: 2,
        explain:
          'Hold onto that. Without a market linking taxes to services, a surplus by itself measures nothing — that is why governmental accounting is built around accountability instead of a bottom line.',
      },
      html: [
        '<p class="ga-lead">This is a placeholder section. The full Chapter 1 lesson — the government vs. business exchange, GASB vs. FASB, funds, and how it all maps to your county Accountant I duties — ships with the next content update.</p>',
        '<p>In the meantime, everything around it is real: the section stepper, the knowledge checks, the graded journal-entry practice, and your saved progress.</p>',
        '<div class="ga-takeaway"><span class="ga-callout-tag ga-mono">Key takeaway</span><p>Governments are not businesses with a different logo. The exchange between a government and the people who fund it is fundamentally different — so the accounting must be different too.</p></div>',
      ],
      knowledgeCheck: {
        tag: 'Your turn',
        time: '30 sec',
        prompt: 'Who owns a county government?',
        choices: [
          'Its bondholders',
          'No one — there are no ownership interests',
          'The state it sits in',
        ],
        answer: 1,
        explain:
          'There are no shares of a county to buy, sell, or redeem — one of the defining characteristics separating governments from business organizations.',
      },
    },
  ],
  practiceSets: [
    {
      id: 'set-a',
      title: 'Warm-up: record a cash receipt',
      blurb: 'One trivial entry to prove the practice engine end-to-end.',
      problems: [
        {
          type: 'journal-entry',
          id: 'je-stub-cash-receipt',
          title: 'Receive cash for services',
          scenario:
            'The county receives <strong>$500</strong> cash for copies of public records. Record the entry in the General Fund.',
          accounts: [
            'Cash',
            'Accounts Receivable',
            'Revenues — Charges for Services',
            'Expenditures',
            'Accounts Payable',
          ],
          answerKey: [
            { account: 'Cash', side: 'debit', amount: 500 },
            {
              account: 'Revenues — Charges for Services',
              aliases: ['Charges for Services', 'Revenues'],
              side: 'credit',
              amount: 500,
            },
          ],
          explanation:
            'Cash (an asset) increases, so it is debited. The county earned revenue from a service charge, so Revenues — Charges for Services is credited for the same amount. Debits equal credits: $500 = $500.',
        },
      ],
    },
  ],
};

export default ch01;
