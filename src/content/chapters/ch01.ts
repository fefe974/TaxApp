import type { ChapterInput } from '../schema';

/**
 * Chapter 1 — The Government and Not-for-Profit Environment.
 * Topic alignment: Reck, Lowensohn & Neely 18e, Chapter 1 (LO 1-1 … 1-5).
 * All prose is original. Example-first pedagogy per the validated Lesson 1
 * artifact: hook → teach → figure/comparison → takeaway, with an activation
 * prediction or knowledge check as the interactive beat of every section.
 */
const ch01: ChapterInput = {
  id: 'ch01',
  number: 1,
  title: 'The Government and Not-for-Profit Environment',
  bookAlignment: 'Reck, Lowensohn & Neely 18e — Chapter 1 (LO 1-1 through 1-5, topic alignment)',
  jobDuties: [
    'gl-reconciliation',
    'journal-entries',
    'budget-review',
    'grant-reporting',
    'invoicing',
    'fixed-assets',
    'year-end',
    'financial-reports',
  ],
  blurb:
    'Why a county has no bottom line — and why that changes everything. Who follows GASB vs. FASB vs. FASAB, what accountability and interperiod equity actually mean, how funds work, and how all of it maps to your real job duties.',
  minutes: 45,
  sections: [
    /* ---------------- Section 1: A different kind of accounting ---------------- */
    {
      id: 'different-kind',
      short: 'A different world',
      title: 'A different kind of accounting',
      kicker: 'Setting the stage',
      jobDuties: [],
      activation: {
        tag: 'Predict first',
        time: '30 sec',
        prompt:
          'Commit to an answer before you read. A county collects $10 million in taxes this year and spends $9 million. Did the county have a good year?',
        choices: [
          'Yes — a $1 million surplus means it performed well',
          'No — a surplus means it overtaxed its residents',
          'You cannot tell from those two numbers alone',
        ],
        answer: 2,
        explain:
          'Hold onto that instinct. Maybe the county ran a tight ship — or maybe it overtaxed people, skipped road maintenance, or pushed bills into next year. Without a market connecting the taxes in to the services out, a surplus by itself measures nothing. Later this chapter we will give that idea a name: <em>interperiod equity</em> — the question of whether this year’s taxpayers actually paid for this year’s services.',
      },
      html: [
        '<p class="ga-lead">You already know how to keep books for a business: revenues when you earn them, expenses when you incur them, and at the bottom, one number that says whether you won or lost. Before we write a single journal entry in this course, I want to show you why that logic quietly breaks the moment you walk into a county courthouse.</p>',
        '<p>Think about the last thing you bought. You looked at a price, decided the thing was worth it, handed over your money, and walked away with exactly what you paid for. Every number in business accounting stands on that <strong>voluntary exchange</strong>. Now let me ask you a question: when you pay your county property tax bill, what exactly did you buy?</p>',
        [
          '<div class="ga-figure">',
          '  <div class="ga-figure-label ga-mono">The exchange you know vs. the one you are about to study</div>',
          '  <div class="ga-compare-cards">',
          '    <div class="ga-cc ga-cc-biz">',
          '      <strong>The business world</strong>',
          '      <div class="ga-cc-flow"><span>You pay the coffee shop $6</span><span class="ga-arrow">&rarr;</span><span>You get the latte you ordered</span></div>',
          '      <p>A voluntary exchange at an agreed price. If the coffee is bad, you take your $6 across the street tomorrow — and the shop feels it.</p>',
          '    </div>',
          '    <div class="ga-cc ga-cc-gov">',
          '      <strong>The county world</strong>',
          '      <div class="ga-cc-flow"><span>You pay the county $3,800 in property tax</span><span class="ga-arrow">&rarr;</span><span>You get&hellip; what, exactly?</span></div>',
          '      <p>Roads you may never drive, a jail you hope never to see, a sheriff&rsquo;s patrol at 3 a.m. whether you called or not. And you must pay either way.</p>',
          '    </div>',
          '  </div>',
          '</div>',
        ].join('\n'),
        '<p>Accountants have a name for that second kind of transaction: a <strong>nonexchange transaction</strong>. The taxpayer hands over resources without receiving a specific good or service of equal value in return, and without any choice in the matter. That one fact knocks out the load-bearing wall of business accounting. Revenue is no longer &ldquo;earned&rdquo; by delivering a product. There is no customer deciding whether the price was worth it. There is no market signal at all.</p>',
        '<p>And here is a second crack in the foundation: you can buy a share of a company this afternoon and sell it tomorrow. Can you sell your share of the county? Of course not — <strong>there are no ownership interests</strong>. Nobody owns the county the way shareholders own a corporation, no one receives dividends from it, and if it ever dissolved, no investor would line up for a cut of the courthouse.</p>',
        '<div class="ga-note"><span class="ga-callout-tag ga-mono">Keep these two questions handy</span><p>Whenever this material feels strange, come back to two questions: <em>Who owns this organization?</em> and <em>What do the people who fund it get back?</em> For a business those answers are easy. For a government, those answers change everything about the accounting — and this whole course is the story of how.</p></div>',
        '<div class="ga-takeaway"><span class="ga-callout-tag ga-mono">Key takeaway</span><p>Business accounting is built on voluntary exchange and ownership. A government has neither: taxes are involuntary nonexchange transactions, and nobody owns a county. So the accounting model has to be rebuilt from the ground up — which is exactly what the rest of this course does.</p></div>',
      ],
      knowledgeCheck: {
        tag: 'Your turn',
        time: '30 sec',
        prompt:
          'Your neighbor shrugs: “The county is basically a business — money comes in, money goes out.” What is the biggest flaw in that statement?',
        choices: [
          'Counties handle less money than most businesses, so the comparison fails on size',
          'Taxes are involuntary payments with no agreed-upon product in return, so “money in” does not measure a sale to a willing customer',
          'There is no flaw — a county really is just a business with a different logo',
        ],
        answer: 1,
        explain:
          'Size is not the issue — plenty of counties out-budget plenty of businesses. The flaw is the nature of the exchange. A sale is a voluntary trade at an agreed price; a tax is a nonexchange transaction the payer cannot refuse and gets no specific product for. Once “revenue” no longer means “a customer chose to buy,” the business scoreboard stops working.',
      },
    },

    /* ---------------- Section 2: Who's who ---------------- */
    {
      id: 'whos-who',
      short: 'Who’s who',
      title: 'Who&rsquo;s who: the players and the rulebooks they follow',
      kicker: 'Meet the players',
      jobDuties: ['financial-reports'],
      html: [
        '<p class="ga-lead">Before we learn any rules, let us map the territory — because this is not a niche corner of the economy. It is a massive one, and knowing which kind of organization you are looking at tells you which rulebook applies.</p>',
        [
          '<div class="ga-stats">',
          '  <div class="ga-stat"><strong>51</strong><i></i><span>the federal government plus 50 states</span></div>',
          '  <div class="ga-stat"><strong>&asymp;90,000</strong><i></i><span>local governments — counties, cities, school districts, special districts</span></div>',
          '  <div class="ga-stat"><strong>&asymp;1.6M</strong><i></i><span>tax-exempt not-for-profit organizations</span></div>',
          '</div>',
        ].join('\n'),
        '<h3>General purpose governments</h3>',
        '<p>States, counties, cities, towns, townships. The key word is <strong>general</strong>: they do many jobs at once — law enforcement, roads and bridges, parks, courts, elections, public health. Your county is a general purpose government, and that is exactly why an Accountant I there touches so many different kinds of transactions.</p>',
        '<h3>Special purpose governments</h3>',
        '<p>School districts, public colleges and universities, water districts, fire protection districts, transit authorities. The key word is <strong>special</strong>: each exists to do <em>one job</em> or a small handful. Do not let the narrow mission fool you — state law gives many of them genuine governmental power, including the power to levy taxes. Breadth of services, not size of budget, is the test.</p>',
        '<div class="ga-example"><span class="ga-callout-tag ga-mono">Real-world example</span><p>Pull up one property tax bill for a single house. You may find the <strong>county</strong>, a <strong>city</strong>, a <strong>school district</strong>, and a <strong>mosquito abatement district</strong> all taxing the same address. Same front porch, four different governments — one general purpose doing many jobs, three special purpose doing one job each.</p></div>',
        '<h3>Not-for-profit organizations</h3>',
        '<p>Private colleges, charitable hospitals, food banks, museums, churches, trade associations — roughly 1.6 million of them. They are <em>private</em>, not governmental, but they are not businesses either: donors fund them without expecting anything back, no one owns them, and their purpose is a mission rather than a profit.</p>',
        [
          '<div class="ga-figure">',
          '  <div class="ga-figure-label ga-mono">The map of the territory</div>',
          '  <div class="ga-tree" role="img" aria-label="Tree diagram: the government and not-for-profit world splits into governments (general purpose and special purpose) and private not-for-profit organizations">',
          '    <div class="ga-tree-root">The government &amp; not-for-profit world</div>',
          '    <div class="ga-tree-stem"></div>',
          '    <div class="ga-tree-branches">',
          '      <div class="ga-tree-node">',
          '        <strong>Governments</strong>',
          '        <small>federal &middot; state &middot; &asymp;90,000 local</small>',
          '        <div class="ga-tree-leaves">',
          '          <div class="ga-leaf"><strong>General purpose</strong>States, counties, cities, townships — a wide range of services</div>',
          '          <div class="ga-leaf"><strong>Special purpose</strong>School districts, public universities, special districts — one job or a few</div>',
          '        </div>',
          '      </div>',
          '      <div class="ga-tree-node">',
          '        <strong>Not-for-profits</strong>',
          '        <small>private &middot; mission-driven &middot; no owners</small>',
          '        <div class="ga-chips"><span>Private colleges</span><span>Charitable hospitals</span><span>Food banks</span><span>Museums</span><span>Religious organizations</span><span>Trade associations</span></div>',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>',
        ].join('\n'),
        '<h3>Who writes the rules?</h3>',
        '<p>Here is the part that trips people up on exams and in real life. Three different boards set generally accepted accounting principles (GAAP) in the United States, and the split is by <strong>who you are</strong>, not what you do:</p>',
        [
          '<div class="ga-figure">',
          '  <div class="ga-figure-label ga-mono">Three standards setters, divided by ownership — not by activity</div>',
          '  <table class="ga-table">',
          '    <thead><tr><th>Board</th><th>Sets GAAP for</th><th>Watch for</th></tr></thead>',
          '    <tbody>',
          '      <tr><td>GASB</td><td data-label="Sets GAAP for">State and local governments — including government-owned universities, hospitals, and utilities</td><td data-label="Watch for">Your county follows GASB. So does the state university, even though it looks like a private one.</td></tr>',
          '      <tr><td>FASB</td><td data-label="Sets GAAP for">Businesses <em>and</em> nongovernmental not-for-profits</td><td data-label="Watch for">One board, two audiences: FASB covers the corner store and the private charity alike.</td></tr>',
          '      <tr><td>FASAB</td><td data-label="Sets GAAP for">The federal government and its agencies</td><td data-label="Watch for">Federal only. A county spending federal grant money still follows GASB, not FASAB.</td></tr>',
          '    </tbody>',
          '  </table>',
          '</div>',
        ].join('\n'),
        '<div class="ga-example"><span class="ga-callout-tag ga-mono">The tricky case: three hospitals, one street</span><p>Picture three hospitals on the same road, doing identical work. <strong>County General</strong> is owned by the county — it follows <strong>GASB</strong>. <strong>St. Anne&rsquo;s</strong> is a private charitable hospital — it follows <strong>FASB</strong> (not-for-profit standards). The <strong>VA Medical Center</strong> is federal — it follows <strong>FASAB</strong>. Same scrubs, same scanners, three rulebooks. The activity never decides the standards setter; the ownership does.</p></div>',
        '<div class="ga-takeaway"><span class="ga-callout-tag ga-mono">Key takeaway</span><p>Governments come in general purpose (many jobs) and special purpose (one job) flavors, and both hold real governmental power. Standards follow ownership: GASB for state and local governments, FASB for businesses and private not-for-profits, FASAB for the federal government.</p></div>',
      ],
      knowledgeCheck: {
        tag: 'Your turn',
        time: '30 sec',
        prompt:
          'A large state university runs a teaching hospital, a bookstore, and a football stadium. Whose accounting standards does the university follow?',
        choices: [
          'FASB — universities are not-for-profit organizations',
          'GASB — it is owned by a state government',
          'FASAB — universities receive federal research money',
        ],
        answer: 1,
        explain:
          'Ownership decides, never activity and never funding source. A state university is a government-owned institution, so GASB sets its standards — hospital, bookstore, stadium and all. A <em>private</em> university doing the exact same things would follow FASB, and federal money in the mix changes nothing about which board applies.',
      },
    },

    /* ---------------- Section 3: Why no bottom line ---------------- */
    {
      id: 'no-bottom-line',
      short: 'No bottom line',
      title: 'Why there is no bottom line',
      kicker: 'The scoreboard problem',
      jobDuties: ['budget-review', 'financial-reports'],
      html: [
        '<p class="ga-lead">Back to the prediction you made at the start of this chapter: the county collected $10 million and spent $9 million. You said — correctly — that you cannot tell whether that was a good year. Now let us build the full answer, because it is the single most important idea in governmental accounting.</p>',
        '<p>In business, net income works as a scoreboard because every revenue dollar was volunteered by a customer in a competitive market. Take away the voluntary exchange and the competition — taxpayers must pay, and there is no second sheriff&rsquo;s office across the street — and the surplus stops carrying information. Maybe management was efficient. Maybe residents were overtaxed. Maybe the roads quietly crumbled while the cash pile grew. The number cannot tell you which.</p>',
        '<h3>So what replaces profit? Accountability.</h3>',
        '<p>Governmental financial reporting is built around one paramount objective: <strong>accountability</strong>. The government took the public&rsquo;s money — under compulsion — and it owes the public an answer to a very specific question: <em>did you do what you said you would do with it?</em> Did spending stay within the budget the elected board adopted? Were restricted dollars used only for their restricted purpose? What services did the money actually buy?</p>',
        '<h3>Interperiod equity: the fairness clock</h3>',
        '<p>Inside accountability lives a concept with an intimidating name and a simple meaning. <strong>Interperiod equity</strong> asks: did <em>this year&rsquo;s</em> taxpayers pay for <em>this year&rsquo;s</em> services — or did the government shift the bill to people who have not even moved to the county yet?</p>',
        '<div class="ga-example"><span class="ga-callout-tag ga-mono">Real-world example</span><p>Two counties each spend $2 million this year repaving roads. County A pays from this year&rsquo;s taxes: this year&rsquo;s drivers paid for this year&rsquo;s asphalt. County B issues 25-year bonds to cover its routine repaving: drivers in 2050 will still be paying for asphalt that wore out decades earlier. Both counties report the same roads and the same spending — but County B just billed the future for the present, and only accountability-focused reporting will surface that.</p></div>',
        '<h3>Two flavors of accountability</h3>',
        '<p>Because &ldquo;did you keep your promises&rdquo; is really two different questions on two different clocks, governmental reporting answers both — and you will see this split everywhere in later chapters:</p>',
        [
          '<div class="ga-figure">',
          '  <div class="ga-figure-label ga-mono">Two questions, two clocks</div>',
          '  <div class="ga-compare-cards">',
          '    <div class="ga-cc ga-cc-gov">',
          '      <strong>Fiscal accountability</strong>',
          '      <div class="ga-cc-flow"><span>Short term</span><span class="ga-arrow">&rarr;</span><span>This year&rsquo;s money</span></div>',
          '      <p>Did the government raise and spend money according to the adopted budget and the law — this period? Answered by the <em>fund</em> financial statements you will live in as an Accountant I.</p>',
          '    </div>',
          '    <div class="ga-cc ga-cc-biz">',
          '      <strong>Operational accountability</strong>',
          '      <div class="ga-cc-flow"><span>Long term</span><span class="ga-arrow">&rarr;</span><span>The full cost of services</span></div>',
          '      <p>Is the government covering the whole cost of what it does — including wearing out its buildings and roads — or living off the future? Answered by the <em>government-wide</em> statements.</p>',
          '    </div>',
          '  </div>',
          '</div>',
        ].join('\n'),
        '<div class="ga-note"><span class="ga-callout-tag ga-mono">Why this matters to your desk</span><p>This dual view is why a government&rsquo;s annual report looks &ldquo;doubled&rdquo; compared to a company&rsquo;s — the same year told twice, once through each lens. When you reconcile accounts or help close the year, you are feeding both stories, and later chapters teach you exactly how the two reconcile to each other.</p></div>',
        '<div class="ga-takeaway"><span class="ga-callout-tag ga-mono">Key takeaway</span><p>No market prices, no voluntary customers, no meaningful net income. Accountability replaces profit as the paramount objective, interperiod equity asks whether today&rsquo;s taxpayers paid for today&rsquo;s services, and reporting answers on two clocks: fiscal (this year, the budget, the law) and operational (the long run, the full cost).</p></div>',
      ],
      knowledgeCheck: {
        tag: 'Your turn',
        time: '45 sec',
        prompt:
          'The county pays for this year’s routine road maintenance by issuing 20-year bonds. Which idea does that most directly strain?',
        choices: [
          'Interperiod equity — future taxpayers are being billed for services already consumed',
          'Nothing — borrowing is a normal financing choice with no reporting significance',
          'Fiscal accountability — bonds are illegal for maintenance spending',
        ],
        answer: 0,
        explain:
          'Borrowing itself is not evil — debt-financing a bridge that serves drivers for 40 years lines the payments up with the people who benefit. The strain comes from borrowing long for services consumed <em>now</em>: taxpayers in year 20 are paying for asphalt that wore out in year 1. That mismatch between who benefits and who pays is precisely what interperiod equity measures, and why reporting must reveal it.',
      },
    },

    /* ---------------- Section 4: Funds ---------------- */
    {
      id: 'funds',
      short: 'Funds',
      title: 'Funds: how governments keep the books',
      kicker: 'One county, many wallets',
      jobDuties: ['journal-entries', 'gl-reconciliation'],
      html: [
        '<p class="ga-lead">If you opened the county&rsquo;s general ledger expecting one big set of books — the way a company has one — here is your next surprise: you will find many small ones. Each is called a <strong>fund</strong>, and funds are the signature move of governmental accounting.</p>',
        '<p>A fund is a self-contained set of books: its own cash, its own receivables, its own liabilities, its own revenues and spending, its own balance. Debits equal credits <em>inside each fund</em>, and every entry you post as an Accountant I lands in some specific fund.</p>',
        '<h3>Why on earth would anyone do this?</h3>',
        '<p>Because public money comes with strings attached. The gas-tax money state law restricts to road work cannot legally buy office chairs. The federal grant for senior meals cannot pay a deputy&rsquo;s salary. Bond proceeds raised to build a jail must build the jail. Mixing all of it into one pot would make proving compliance nearly impossible — so governments never mix the pot in the first place. Separate strings, separate books.</p>',
        '<div class="ga-example"><span class="ga-callout-tag ga-mono">Real-world example</span><p>My grandmother ran her house on envelopes: one marked <em>rent</em>, one marked <em>groceries</em>, one marked <em>church</em>. Money went into a specific envelope and could only come out of that envelope for that purpose. Funds are the county doing exactly this — at a hundred-million-dollar scale, with the force of law behind each envelope.</p></div>',
        '<h3>The three fund families</h3>',
        '<p>Every fund a government uses belongs to one of three families, and there are eleven fund types in total. For now, learn the three families cold and just wave hello to the eleven types — each gets its own chapter-level treatment later.</p>',
        [
          '<div class="ga-figure">',
          '  <div class="ga-figure-label ga-mono">Three families, eleven fund types — preview depth only</div>',
          '  <div class="ga-tree" role="img" aria-label="Tree diagram: funds split into governmental funds (five types), proprietary funds (two types), and fiduciary funds (four types)">',
          '    <div class="ga-tree-root">Every fund the county has</div>',
          '    <div class="ga-tree-stem"></div>',
          '    <div class="ga-tree-branches">',
          '      <div class="ga-tree-node">',
          '        <strong>Governmental funds</strong>',
          '        <small>general government services &middot; where you will live</small>',
          '        <div class="ga-chips"><span>General</span><span>Special Revenue</span><span>Debt Service</span><span>Capital Projects</span><span>Permanent</span></div>',
          '      </div>',
          '      <div class="ga-tree-node">',
          '        <strong>Proprietary funds</strong>',
          '        <small>business-style: customers pay for what they use</small>',
          '        <div class="ga-chips"><span>Enterprise</span><span>Internal Service</span></div>',
          '      </div>',
          '      <div class="ga-tree-node">',
          '        <strong>Fiduciary funds</strong>',
          '        <small>other people&rsquo;s money, held in trust or custody</small>',
          '        <div class="ga-chips"><span>Pension Trust</span><span>Investment Trust</span><span>Private-Purpose Trust</span><span>Custodial</span></div>',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>',
        ].join('\n'),
        '<p>A quick feel for each family. <strong>Governmental funds</strong> carry the classic tax-supported work — patrol, roads, parks — headlined by the General Fund, the county&rsquo;s main operating fund and the place most of your entries will land. <strong>Proprietary funds</strong> run the county&rsquo;s business-like operations, such as a water utility that bills customers for usage. <strong>Fiduciary funds</strong> hold money that is not the county&rsquo;s at all — pension assets for employees, or taxes collected on behalf of the school district — where the county is merely the trusted middleman.</p>',
        '<div class="ga-note"><span class="ga-callout-tag ga-mono">Preview depth only</span><p>Resist the urge to memorize all eleven types today. The exam-worthy skill right now is sorting an activity into the right <em>family</em> — governmental, proprietary, or fiduciary. The eleven types, and the different accounting each family uses, arrive one chapter at a time.</p></div>',
        '<div class="ga-takeaway"><span class="ga-callout-tag ga-mono">Key takeaway</span><p>Funds exist because public money is legally earmarked, and separate books are how compliance stays provable. Three families: governmental (tax-supported services), proprietary (business-style operations), fiduciary (other people&rsquo;s money). The General Fund — a governmental fund — is where a county Accountant I spends most of the day.</p></div>',
      ],
      knowledgeCheck: {
        tag: 'Your turn',
        time: '30 sec',
        prompt:
          'The state shares gas-tax money with the county, and state law says every dollar must be spent on streets and bridges. Which fund family accounts for it?',
        choices: [
          'Governmental — restricted tax money supporting a general government service',
          'Proprietary — the county “earns” it like a business',
          'Fiduciary — the money belongs to the state, not the county',
        ],
        answer: 0,
        explain:
          'It is the county’s own money — the state shared it, not parked it — so fiduciary is out. Nobody is billing customers for street use here, so proprietary is out. Restricted tax revenue supporting a core government service belongs in the governmental family; specifically it would land in a Special Revenue Fund, one of the five governmental fund types you just previewed.',
      },
    },

    /* ---------------- Section 5: The reporting landscape ---------------- */
    {
      id: 'reporting',
      short: 'Reporting',
      title: 'The reporting landscape',
      kicker: 'What gets published, and where you fit',
      jobDuties: ['financial-reports', 'grant-reporting', 'year-end', 'budget-review'],
      html: [
        '<p class="ga-lead">Everything we have discussed — accountability, interperiod equity, funds — eventually gets written down and published. A county&rsquo;s year ends in paper (well, PDFs), and an Accountant I&rsquo;s fingerprints are all over it. Let us tour the three big reporting streams.</p>',
        '<h3>1. The ACFR: the annual report</h3>',
        '<p>The flagship document is the <strong>Annual Comprehensive Financial Report</strong> — the ACFR. It tells the county&rsquo;s complete financial story once a year, and it always has the same three-part shape:</p>',
        [
          '<div class="ga-figure">',
          '  <div class="ga-figure-label ga-mono">The ACFR at a glance</div>',
          '  <div class="ga-flow" role="img" aria-label="Flow diagram: the Annual Comprehensive Financial Report divides into an introductory section, a financial section, and a statistical section">',
          '    <div class="ga-flow-node ga-flow-people">The ACFR<small>the county&rsquo;s complete annual financial story</small></div>',
          '    <span class="ga-flow-arrow">three sections &darr;</span>',
          '    <div class="ga-flow-branches">',
          '      <div class="ga-flow-node">Introductory<small>transmittal letter, org chart, officials — unaudited</small></div>',
          '      <div class="ga-flow-node">Financial<small>auditor&rsquo;s report, MD&amp;A, the financial statements, notes — the audited heart</small></div>',
          '      <div class="ga-flow-node">Statistical<small>ten-year trends and context — unaudited</small></div>',
          '    </div>',
          '  </div>',
          '</div>',
        ].join('\n'),
        '<p>The financial section is the heart: the independent auditor&rsquo;s opinion, management&rsquo;s discussion and analysis, the basic financial statements (both the government-wide and the fund statements you met last section), and the notes. When people say &ldquo;the audit,&rdquo; this is what gets audited.</p>',
        '<h3>2. The budget: the law you post against</h3>',
        '<p>Before the year even starts, the elected board adopts a <strong>budget</strong> — and in government, the budget is not a plan, it is <em>law</em>. Each <strong>appropriation</strong> is a legal ceiling on spending. That is why budget-to-actual comparisons get reported, and why part of reviewing an invoice or a contract is confirming that an appropriation exists with room left under the ceiling before anything gets paid.</p>',
        '<h3>3. Grant and federal reporting: the strings report back</h3>',
        '<p>Remember that grant money arrives with strings attached. The strings report back: each grantor agency gets periodic financial reports on its grant, the county compiles a schedule of everything federal it spent during the year (the SEFA — Schedule of Expenditures of Federal Awards), and once federal spending crosses a threshold, a <strong>Single Audit</strong> examines whether the county followed the federal rules. Sloppy grant accounting is how governments end up returning money.</p>',
        '<h3>Where an Accountant I touches each stream</h3>',
        [
          '<ol class="ga-five">',
          '  <li><strong>Reconciliations feed the audit:</strong> the monthly GL and bank reconciliations you perform are what make the ACFR&rsquo;s financial section auditable.</li>',
          '  <li><strong>Journal entries and year-end close build the statements:</strong> accruals, corrections, and closing entries turn twelve months of activity into the annual statements.</li>',
          '  <li><strong>Budget checking guards the appropriations:</strong> reviewing invoices and contracts against remaining appropriation balances keeps spending inside the legal ceilings.</li>',
          '  <li><strong>Grant reports roll up into the SEFA:</strong> the reimbursement requests and grant reports you prepare become the Single Audit&rsquo;s raw material.</li>',
          '  <li><strong>Trend data fills the statistical section:</strong> the revenue, spending, and asset schedules you help maintain supply the ACFR&rsquo;s ten-year tables.</li>',
          '</ol>',
        ].join('\n'),
        '<div class="ga-takeaway"><span class="ga-callout-tag ga-mono">Key takeaway</span><p>Three reporting streams: the ACFR (introductory, financial, statistical — with the audited financial section as its heart), the legally binding budget with its appropriation ceilings, and grant reporting up to grantors including the SEFA and Single Audit. Daily Accountant I work — recons, entries, budget checks, grant reports — is the supply chain for all three.</p></div>',
      ],
      knowledgeCheck: {
        tag: 'Your turn',
        time: '30 sec',
        prompt:
          'The independent auditor’s opinion and the basic financial statements live in which section of the ACFR?',
        choices: [
          'The introductory section',
          'The financial section',
          'The statistical section',
        ],
        answer: 1,
        explain:
          'The financial section is the audited heart of the ACFR: auditor’s report, MD&A, basic financial statements, and notes. The introductory section (transmittal letter, org chart) and the statistical section (ten-year trends) frame the story but are unaudited — a favorite exam distinction and a useful thing to know when someone asks you “where is that number in the ACFR?”',
      },
    },

    /* ---------------- Section 6: Your job through this lens ---------------- */
    {
      id: 'your-job',
      short: 'Your job',
      title: 'Your job through this lens',
      kicker: 'The road ahead',
      jobDuties: [
        'gl-reconciliation',
        'journal-entries',
        'budget-review',
        'grant-reporting',
        'invoicing',
        'fixed-assets',
        'year-end',
        'financial-reports',
      ],
      html: [
        '<p class="ga-lead">Let us end where this course began: with the job description in one hand and everything you just learned in the other. Every duty of a county Accountant I is really one of this chapter&rsquo;s ideas wearing work clothes — and every one of them has a home in the chapters ahead.</p>',
        [
          '<div class="ga-figure">',
          '  <div class="ga-figure-label ga-mono">Duty by duty: where this course trains it</div>',
          '  <table class="ga-table">',
          '    <thead><tr><th>Duty</th><th>Through this chapter&rsquo;s lens</th><th>Trained in</th></tr></thead>',
          '    <tbody>',
          '      <tr><td>GL reconciliation</td><td data-label="Through this lens">Keeping each fund&rsquo;s self-balancing books provably right — the raw material of fiscal accountability</td><td data-label="Trained in">Chapters 2&ndash;4, then throughout</td></tr>',
          '      <tr><td>Journal entries</td><td data-label="Through this lens">Recording nonexchange revenues and fund-level activity under rules built for accountability</td><td data-label="Trained in">Chapters 3&ndash;4 (core), 5&ndash;8 (specialized)</td></tr>',
          '      <tr><td>Contract &amp; budget review</td><td data-label="Through this lens">Enforcing appropriations — legal spending ceilings, not suggestions</td><td data-label="Trained in">Chapter 3 (budgetary accounting)</td></tr>',
          '      <tr><td>Grant reporting</td><td data-label="Through this lens">Answering the strings: restricted money, reported back up to the grantor</td><td data-label="Trained in">Chapters 4 and 11 (Single Audit)</td></tr>',
          '      <tr><td>Invoicing &amp; receivables</td><td data-label="Through this lens">Billing and collecting the county&rsquo;s exchange-like revenues and interfund charges</td><td data-label="Trained in">Chapter 4</td></tr>',
          '      <tr><td>Fixed assets</td><td data-label="Through this lens">Tracking capital assets that governmental funds expense but the government-wide view capitalizes</td><td data-label="Trained in">Chapter 5</td></tr>',
          '      <tr><td>Year-end close</td><td data-label="Through this lens">Converting a year of fund activity into statements that answer both accountability questions</td><td data-label="Trained in">Chapters 4 and 9</td></tr>',
          '      <tr><td>Financial reports</td><td data-label="Through this lens">Producing GAAP/GASB statements — the ACFR&rsquo;s financial section itself</td><td data-label="Trained in">Chapter 9</td></tr>',
          '    </tbody>',
          '  </table>',
          '</div>',
        ].join('\n'),
        '<p>Notice the pattern in that right-hand column: Chapters 3 and 4 — the General Fund, budgets, and day-to-day transactions — train the bulk of the job. That is not an accident. The General Fund is where a county Accountant I lives, so this course gets you there fast and keeps coming back.</p>',
        '<div class="ga-note"><span class="ga-callout-tag ga-mono">Before you move on</span><p>This chapter comes with two practice sets. <strong>Foundations: Debits &amp; Credits Bootcamp</strong> makes sure the double-entry machinery is automatic — county-flavored, but plain accounting. <strong>General Fund: First Look</strong> then gives you your first genuine taste of governmental entries, and every explanation flags exactly where the rules bend away from business accounting. Do both; the second one is where this chapter becomes real.</p></div>',
        '<div class="ga-takeaway"><span class="ga-callout-tag ga-mono">The road ahead</span><p>You now hold the lens: involuntary money, no owners, no bottom line — so accountability is the scoreboard, funds are the filing system, and the ACFR, the budget, and grant reports are the outputs. Every chapter from here teaches one piece of that machine, in the order a working Accountant I needs it. Next stop: the principles and the fund structure in depth.</p></div>',
      ],
      knowledgeCheck: {
        tag: 'Your turn',
        time: '30 sec',
        prompt:
          'Most of a county Accountant I’s daily work — reconciliations, journal entries, budget checks — happens in which part of the fund structure?',
        choices: [
          'The fiduciary funds, because counties mostly manage other people’s money',
          'The proprietary funds, because government is run like a business',
          'The governmental funds — above all the General Fund, the county’s main operating fund',
        ],
        answer: 2,
        explain:
          'The General Fund is the county’s main operating fund: patrol, roads, courts, parks, and the payroll and payables that support them all flow through it. Proprietary and fiduciary funds matter — a water utility here, pension assets there — but the center of gravity for an Accountant I is squarely in the governmental family, which is why the next several chapters live there.',
      },
    },
  ],

  practiceSets: [
    /* ---------------- Set A: Debits & Credits Bootcamp ---------------- */
    {
      id: 'ch01-bootcamp',
      title: 'Foundations: Debits & Credits Bootcamp',
      blurb:
        'Five quick entries in plain double-entry mechanics — county-flavored, but no governmental quirks yet. Prove the machinery is automatic before we add the twist.',
      problems: [
        {
          type: 'journal-entry',
          id: 'je-supplies-on-account',
          title: 'Buy office supplies on account',
          scenario:
            'The Public Works Department orders office supplies from Cardinal Office Products for <strong>$850</strong>. The supplies arrive today with an invoice due in 30 days. The county records supplies as an asset until they are used. Record the purchase.',
          accounts: [
            'Supplies',
            'Cash',
            'Accounts Payable',
            'Accounts Receivable',
            'Prepaid Expenses',
          ],
          answerKey: [
            {
              account: 'Supplies',
              aliases: ['Office Supplies', 'Supplies Inventory', 'Supplies on Hand'],
              side: 'debit',
              amount: 850,
            },
            {
              account: 'Accounts Payable',
              aliases: ['Vouchers Payable', 'Trade Payables'],
              side: 'credit',
              amount: 850,
            },
          ],
          explanation:
            'The rule: assets increase with debits, liabilities increase with credits. Supplies (an asset) arrived, so debit Supplies for $850. Nothing was paid yet — the county owes the vendor — so credit Accounts Payable for $850. Governments often call this account Vouchers Payable; the grader accepts both. Debits equal credits: $850 = $850.',
        },
        {
          type: 'journal-entry',
          id: 'je-pay-vendor',
          title: 'Pay the vendor invoice',
          scenario:
            'Thirty days later, the Auditor&rsquo;s Office approves the Cardinal Office Products invoice and the county issues a check for <strong>$850</strong>. Record the payment.',
          accounts: [
            'Accounts Payable',
            'Cash',
            'Supplies',
            'Accounts Receivable',
            'Prepaid Expenses',
          ],
          answerKey: [
            {
              account: 'Accounts Payable',
              aliases: ['Vouchers Payable', 'Trade Payables'],
              side: 'debit',
              amount: 850,
            },
            {
              account: 'Cash',
              aliases: ['Cash in Bank'],
              side: 'credit',
              amount: 850,
            },
          ],
          explanation:
            'The rule: paying a liability decreases it with a debit, and paying out cash decreases that asset with a credit. Notice what is <em>not</em> here — no Supplies and no expense. The supplies were recorded when they arrived; this entry only settles the debt. Payments of previously recorded invoices are pure balance-sheet moves.',
        },
        {
          type: 'journal-entry',
          id: 'je-bill-dispatch',
          title: 'Bill another government for services',
          scenario:
            'The county provides 911 dispatch service to the Town of Maple Grove under an annual contract. The county bills the town <strong>$3,750</strong> for July dispatch services, payable within 30 days. Record the billing.',
          accounts: [
            'Accounts Receivable',
            'Cash',
            'Revenues — Charges for Services',
            'Unearned Revenue',
            'Accounts Payable',
          ],
          answerKey: [
            {
              account: 'Accounts Receivable',
              aliases: ['Due from Other Governments', 'Receivables'],
              side: 'debit',
              amount: 3750,
            },
            {
              account: 'Revenues — Charges for Services',
              aliases: ['Charges for Services', 'Service Revenue', 'Revenues'],
              side: 'credit',
              amount: 3750,
            },
          ],
          explanation:
            'The rule: revenue is recognized when it is earned, not when cash arrives. The dispatch service for July has been fully provided, so credit Revenues — Charges for Services for $3,750, and debit Accounts Receivable — the county&rsquo;s right to collect — for the same amount. This is one of the few county revenues that actually works like a business sale: a service delivered for an agreed price.',
        },
        {
          type: 'journal-entry',
          id: 'je-collect-dispatch',
          title: 'Collect the receivable',
          scenario:
            'Maple Grove&rsquo;s payment of <strong>$3,750</strong> for July dispatch services arrives and is deposited. Record the collection.',
          accounts: [
            'Cash',
            'Accounts Receivable',
            'Revenues — Charges for Services',
            'Unearned Revenue',
          ],
          answerKey: [
            {
              account: 'Cash',
              aliases: ['Cash in Bank'],
              side: 'debit',
              amount: 3750,
            },
            {
              account: 'Accounts Receivable',
              aliases: ['Due from Other Governments', 'Receivables'],
              side: 'credit',
              amount: 3750,
            },
          ],
          explanation:
            'The rule: never record the same revenue twice. The revenue was recognized when the town was billed; collecting it merely swaps one asset for another — Cash up (debit), Accounts Receivable down (credit). If you were tempted to credit Revenues here, that is the classic double-counting trap this problem exists to catch.',
        },
        {
          type: 'journal-entry',
          id: 'je-accrue-payroll',
          title: 'Accrue salaries at month end',
          scenario:
            'At the June 30 fiscal year end, the county road crew has earned <strong>$18,200</strong> of wages that will not be paid until the July 5 payroll run. Record the accrual as of June 30.',
          accounts: [
            'Salaries and Wages Expense',
            'Salaries and Wages Payable',
            'Cash',
            'Prepaid Expenses',
            'Accounts Payable',
          ],
          answerKey: [
            {
              account: 'Salaries and Wages Expense',
              aliases: ['Salaries Expense', 'Wages Expense', 'Payroll Expense'],
              side: 'debit',
              amount: 18200,
            },
            {
              account: 'Salaries and Wages Payable',
              aliases: [
                'Salaries Payable',
                'Wages Payable',
                'Accrued Salaries Payable',
                'Accrued Payroll',
              ],
              side: 'credit',
              amount: 18200,
            },
          ],
          explanation:
            'The rule: record an expense in the period the work was performed, whether or not cash has moved. The crew earned the wages in June, so debit Salaries and Wages Expense for $18,200 and credit Salaries and Wages Payable — a liability for the amount owed. No cash is touched until the July payroll actually pays it. Year-end accruals exactly like this one are a core part of the close you will help run.',
        },
      ],
    },

    /* ---------------- Set B: General Fund First Look ---------------- */
    {
      id: 'ch01-genfund',
      title: 'General Fund: First Look',
      blurb:
        'Four first-look General Fund entries. Same debit-and-credit machinery — but watch the account names: every explanation flags exactly where governmental accounting bends away from the business rules you just refreshed.',
      problems: [
        {
          type: 'journal-entry',
          id: 'je-tax-levy',
          title: 'Record the property tax levy',
          scenario:
            'On July 1, the county levies property taxes of <strong>$500,000</strong> for the new fiscal year. Collection history says about <strong>2%</strong> will never be collected. Record the levy in the General Fund.',
          accounts: [
            'Taxes Receivable — Current',
            'Allowance for Uncollectible Current Taxes',
            'Revenues — Property Taxes',
            'Cash',
            'Bad Debt Expense',
            'Deferred Inflows of Resources',
          ],
          answerKey: [
            {
              account: 'Taxes Receivable — Current',
              aliases: [
                'Taxes Receivable',
                'Property Taxes Receivable',
                'Property Taxes Receivable — Current',
              ],
              side: 'debit',
              amount: 500000,
            },
            {
              account: 'Allowance for Uncollectible Current Taxes',
              aliases: [
                'Allowance for Uncollectible Taxes',
                'Estimated Uncollectible Current Taxes',
                'Estimated Uncollectible Taxes',
              ],
              side: 'credit',
              amount: 10000,
            },
            {
              account: 'Revenues — Property Taxes',
              aliases: ['Property Tax Revenues', 'Revenues'],
              side: 'credit',
              amount: 490000,
            },
          ],
          explanation:
            'Debit Taxes Receivable — Current for the full $500,000 levied, credit the allowance for the $10,000 (2%) expected never to arrive, and credit Revenues — Property Taxes for the $490,000 expected to be collected.<br><br><strong>What is different from business accounting:</strong> two things. First, revenue is recognized at the <em>levy</em> — nothing was sold and no customer was billed; an involuntary nonexchange revenue is recorded when it is measurable and available to finance the year. Second, there is <em>no Bad Debt Expense</em>: governmental funds record revenue net of estimated uncollectibles, so the allowance reduces revenue directly instead of creating an expense.',
        },
        {
          type: 'journal-entry',
          id: 'je-collect-taxes',
          title: 'Collect current taxes',
          scenario:
            'By October 31, county taxpayers have paid <strong>$460,000</strong> of the current-year levy. Record the collections in the General Fund.',
          accounts: [
            'Cash',
            'Taxes Receivable — Current',
            'Revenues — Property Taxes',
            'Allowance for Uncollectible Current Taxes',
            'Deferred Inflows of Resources',
          ],
          answerKey: [
            {
              account: 'Cash',
              aliases: ['Cash in Bank'],
              side: 'debit',
              amount: 460000,
            },
            {
              account: 'Taxes Receivable — Current',
              aliases: [
                'Taxes Receivable',
                'Property Taxes Receivable',
                'Property Taxes Receivable — Current',
              ],
              side: 'credit',
              amount: 460000,
            },
          ],
          explanation:
            'Debit Cash and credit Taxes Receivable — Current for $460,000. No revenue is recorded now — all $490,000 of expected revenue was already recognized on levy day.<br><br><strong>What is different from business accounting:</strong> the mechanics look familiar (collecting any receivable works this way), but notice <em>when</em> the revenue happened: at the levy, by law and estimate, rather than when a sale was earned. Collections are just the receivable turning into cash, and watching receivable balances fall as collections come in is exactly what your GL reconciliations will verify.',
        },
        {
          type: 'journal-entry',
          id: 'je-pay-expenditure',
          title: 'Pay for signal repairs — an expenditure',
          scenario:
            'The county receives and immediately pays a <strong>$12,500</strong> invoice from Brightline Signal Co. for repairing traffic signals. Record it in the General Fund.',
          accounts: [
            'Expenditures',
            'Cash',
            'Repairs Expense',
            'Vouchers Payable',
            'Accounts Receivable',
          ],
          answerKey: [
            {
              account: 'Expenditures',
              aliases: [
                'Expenditures — Public Works',
                'Expenditures — Repairs and Maintenance',
              ],
              side: 'debit',
              amount: 12500,
            },
            {
              account: 'Cash',
              aliases: ['Cash in Bank'],
              side: 'credit',
              amount: 12500,
            },
          ],
          explanation:
            'Debit Expenditures — not Repairs Expense — for $12,500 and credit Cash.<br><br><strong>What is different from business accounting:</strong> the word. Governmental funds do not record <em>expenses</em>; they record <strong>expenditures</strong> — outflows of current financial resources. It is more than vocabulary: because the measurement focus is on spendable resources, even buying a $40,000 truck would be a debit to Expenditures in the General Fund — no asset on the fund&rsquo;s books, and <em>no depreciation ever</em> in governmental funds. (The government-wide statements capitalize and depreciate; that reconciliation is a later chapter.)',
        },
        {
          type: 'journal-entry',
          id: 'je-transfer-out',
          title: 'Transfer cash to the Debt Service Fund',
          scenario:
            'The county board orders a routine <strong>$50,000</strong> cash transfer from the General Fund to the Debt Service Fund to cover an upcoming bond payment. Record the General Fund side of the transfer.',
          accounts: [
            'Other Financing Uses — Interfund Transfers Out',
            'Cash',
            'Expenditures',
            'Due to Other Funds',
            'Revenues — Property Taxes',
          ],
          answerKey: [
            {
              account: 'Other Financing Uses — Interfund Transfers Out',
              aliases: [
                'Interfund Transfers Out',
                'Transfers Out',
                'Other Financing Uses — Transfers Out',
                'Other Financing Uses',
              ],
              side: 'debit',
              amount: 50000,
            },
            {
              account: 'Cash',
              aliases: ['Cash in Bank'],
              side: 'credit',
              amount: 50000,
            },
          ],
          explanation:
            'Debit Other Financing Uses — Interfund Transfers Out for $50,000 and credit Cash.<br><br><strong>What is different from business accounting:</strong> this transaction barely exists in business — a company moving cash between its own bank accounts records nothing but cash. Because each fund is its own set of books, moving money between funds must be recorded in <em>both</em>. But the county did not buy anything, so this is not an Expenditure — and the Debt Service Fund did not earn anything, so its side is not Revenue. The Other Financing Uses / Other Financing Sources pair keeps interfund transfers from inflating either number, preserving what expenditures and revenues actually mean.',
        },
      ],
    },

    /* ---------------- Hidden set: classification groundwork ---------------- */
    {
      id: 'ch01-fund-id',
      title: 'Fund Families: Sort It Out',
      blurb:
        'Classification practice groundwork for Phase 2 — hidden until the classification engine ships.',
      hidden: true,
      problems: [
        {
          type: 'classification',
          id: 'cl-fund-families',
          title: 'Which fund family?',
          scenario:
            'For each county activity below, pick the fund family it would be accounted for in: governmental, proprietary, or fiduciary.',
          categories: [
            { id: 'governmental', label: 'Governmental funds' },
            { id: 'proprietary', label: 'Proprietary funds' },
            { id: 'fiduciary', label: 'Fiduciary funds' },
          ],
          items: [
            {
              id: 'pothole-patching',
              text: 'Patching potholes on county roads, paid for with general tax dollars',
              answer: 'governmental',
              explain:
                'Tax-supported general government services are the governmental family&rsquo;s home turf — this activity lives in the General Fund.',
            },
            {
              id: 'water-utility',
              text: 'A county water utility that bills customers monthly for the water they use',
              answer: 'proprietary',
              explain:
                'Customers paying for what they use is the business-style pattern — an Enterprise Fund, in the proprietary family.',
            },
            {
              id: 'pension-assets',
              text: 'Investments held to pay future retirement benefits for county employees',
              answer: 'fiduciary',
              explain:
                'These assets belong to the employees, not the county — held in a Pension Trust Fund, in the fiduciary family.',
            },
            {
              id: 'gas-tax-roads',
              text: 'State gas-tax money that state law restricts to street and bridge work',
              answer: 'governmental',
              explain:
                'It is the county&rsquo;s own money, restricted to a general government purpose — a Special Revenue Fund, in the governmental family.',
            },
            {
              id: 'school-tax-custody',
              text: 'Property taxes the county collects on behalf of the school district and holds until remitted',
              answer: 'fiduciary',
              explain:
                'The county is only the middleman — money held for another government sits in a Custodial Fund, in the fiduciary family.',
            },
          ],
          explanation:
            'The sorting test: whose money is it, and how is it raised? The government&rsquo;s own money supporting general services (even when restricted) is governmental; the government&rsquo;s own money earned business-style from customers is proprietary; money held for someone else is fiduciary.',
        },
      ],
    },
  ],
};

export default ch01;
