import type { ClassificationProblemInput } from '../schema';

/** Fixture proving the classification problem type is representable. */
export const classificationFixture: ClassificationProblemInput = {
  type: 'classification',
  id: 'fx-class-fund-categories',
  title: 'Sort the funds',
  scenario:
    'Place each fund into its fund category: governmental, proprietary, or fiduciary.',
  categories: [
    { id: 'governmental', label: 'Governmental funds' },
    { id: 'proprietary', label: 'Proprietary funds' },
    { id: 'fiduciary', label: 'Fiduciary funds' },
  ],
  items: [
    {
      id: 'general-fund',
      text: 'General Fund',
      answer: 'governmental',
      explain: 'The General Fund is the default governmental fund every government has.',
    },
    {
      id: 'water-utility',
      text: 'Water utility enterprise fund',
      answer: 'proprietary',
      explain: 'Enterprise funds charge customers for services, business-style — proprietary.',
    },
    {
      id: 'pension-trust',
      text: 'Employee pension trust fund',
      answer: 'fiduciary',
      explain: 'Resources held in trust for others are fiduciary — not the government’s own money.',
    },
  ],
  explanation:
    'Governmental funds track general government services; proprietary funds run business-like activities; fiduciary funds hold resources the government manages for someone else.',
};
