// Verification harness. Loads index.html in a real browser and asserts the
// things this app actually promises, so "it works" is a command with output
// rather than an opinion.
//
//   node scripts/verify.js          run everything
//   node scripts/verify.js --shots  also write screenshots to /tmp
//
// Exits non-zero on the first failing assertion group.

const { chromium } = require('playwright');
const path = require('path');

const FILE = 'file://' + path.join(__dirname, '..', 'index.html');
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

let pass = 0;
const failures = [];

function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ok   ' + name); }
  else { failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC });
  const errors = [];

  // ---------------------------------------------------------------
  console.log('\nACCOUNTING ARITHMETIC');
  // ---------------------------------------------------------------
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(FILE);
  await page.waitForTimeout(500);

  const acct = await page.evaluate(() => {
    const t = totalsUpTo(999);
    // Every intermediate state must balance too, not just the final one.
    const perStep = [];
    for (let s = 0; s <= 9; s++) {
      const x = totalsUpTo(s);
      perStep.push({ step: s, a: assetsOf(x), c: claimsOf(x) });
    }
    // Pull the figures the statements actually print.
    const num = str => Number(String(str).replace(/[^0-9.-]/g, ''));
    const line = (key, label) => {
      const l = STMT[key].lines.find(x => x !== 'gap' && x[0] === label);
      return l ? num(l[1]) : null;
    };
    return {
      totals: t,
      assets: assetsOf(t),
      claims: claimsOf(t),
      perStep,
      is: { rev: line('income', 'Service revenue'), exp: line('income', 'Total expenses'), ni: line('income', 'Net income') },
      re: { add: line('retained', 'Add: Net income'), end: line('retained', 'Retained earnings, July 31') },
      bs: { cash: line('balance', 'Cash'), ar: line('balance', 'Accounts receivable'), eq: line('balance', 'Equipment'),
            ta: line('balance', 'Total assets'), tl: line('balance', 'Total liabilities'),
            cs: line('balance', 'Common stock'), rex: line('balance', 'Retained earnings'),
            tle: line('balance', 'Total liabilities and equity') }
    };
  });

  check('ledger balances at every one of the 10 intermediate states',
    acct.perStep.every(s => s.a === s.c),
    acct.perStep.filter(s => s.a !== s.c).map(s => 'step' + s.step + ' ' + s.a + '!=' + s.c).join(', '));
  check('final assets equal final claims', acct.assets === acct.claims, acct.assets + ' vs ' + acct.claims);
  check('income statement revenue matches the ledger revenue column', acct.is.rev === acct.totals.rev, acct.is.rev + ' vs ' + acct.totals.rev);
  check('income statement expenses match the ledger expense column', acct.is.exp === acct.totals.exp, acct.is.exp + ' vs ' + acct.totals.exp);
  check('net income equals revenue minus expenses', acct.is.ni === acct.is.rev - acct.is.exp, acct.is.ni + ' vs ' + (acct.is.rev - acct.is.exp));
  check('retained earnings statement carries net income in', acct.re.add === acct.is.ni, acct.re.add + ' vs ' + acct.is.ni);
  check('ending retained earnings = 0 + net income - dividends', acct.re.end === acct.is.ni - acct.totals.div);
  check('balance sheet cash matches the ledger cash column', acct.bs.cash === acct.totals.cash, acct.bs.cash + ' vs ' + acct.totals.cash);
  check('balance sheet receivable matches the ledger', acct.bs.ar === acct.totals.ar);
  check('balance sheet equipment matches the ledger', acct.bs.eq === acct.totals.eq);
  check('total assets = cash + receivable + equipment', acct.bs.ta === acct.bs.cash + acct.bs.ar + acct.bs.eq);
  check('total liabilities = notes + accounts payable', acct.bs.tl === acct.totals.np + acct.totals.ap);
  check('balance sheet retained earnings matches the RE statement', acct.bs.rex === acct.re.end);
  check('balance sheet common stock matches the ledger', acct.bs.cs === acct.totals.cs);
  check('balance sheet balances', acct.bs.tle === acct.bs.ta && acct.bs.tle === acct.bs.tl + acct.bs.cs + acct.bs.rex,
    acct.bs.tle + ' vs assets ' + acct.bs.ta);

  // ---------------------------------------------------------------
  console.log('\nENTRY WIRING');
  // ---------------------------------------------------------------
  // Every figure an entry shows has to come out of LEDGER, not out of prose
  // typed beside it. This walks the two together.
  const wiring = await page.evaluate(() => {
    const bad = [];
    if (ENTRIES.length !== LEDGER.length) bad.push('ENTRIES and LEDGER are different lengths');
    ENTRIES.forEach((e, i) => {
      const row = LEDGER[i];
      if (!row) return;
      if (e.id !== row.id) bad.push('entry ' + i + ' is id ' + e.id + ' but ledger row ' + i + ' is ' + row.id);
      const moved = COLS.filter(c => row[c.k]).map(c => c.k).sort().join(',');
      const shown = effectsOf(row).map(x => x.k).sort().join(',');
      if (moved !== shown) bad.push('entry ' + e.id + ' shows ' + shown + ' but moves ' + moved);
      // The two effects have to land on opposite sides, or on the same side
      // netting to zero — anything else would not balance.
      const d = effectsOf(row).reduce((n, x) => n + (x.side === 'a' ? x.delta : -x.delta), 0);
      if (d !== 0) bad.push('entry ' + e.id + ' leaves the equation out by ' + d);
      if (!WORK_TX[e.id]) bad.push('entry ' + e.id + ' has no transaction text');
      if (!e.rule || !e.concept || !e.why.length) bad.push('entry ' + e.id + ' is missing its explanation');
      if (!e.scene || !e.scene.other || !e.scene.give || !e.scene.get) bad.push('entry ' + e.id + ' has no complete flow scene');
    });
    return bad;
  });
  check('every entry is wired to the ledger row it describes', wiring.length === 0, wiring.join('; '));

  const coverage = await page.evaluate(() => ({
    rows: LEDGER.length, entries: ENTRIES.length, reports: REPORTS.length,
    // Reports name the columns they draw on; those have to be real columns.
    badFeeds: REPORTS.filter(r => r.feeds).flatMap(r =>
      r.feeds.filter(k => !COLS.some(c => c.k === k)).map(k => r.id + ':' + k))
  }));
  check('all 9 ledger rows have an entry', coverage.rows === 9 && coverage.entries === 9,
    'rows=' + coverage.rows + ' entries=' + coverage.entries);
  check('13 screens replace the old 17', coverage.entries + coverage.reports === 13,
    'total=' + (coverage.entries + coverage.reports));
  check('every report draws on real columns', coverage.badFeeds.length === 0, coverage.badFeeds.join(','));

  // ---------------------------------------------------------------
  console.log('\nDASHBOARD');
  // ---------------------------------------------------------------
  await page.evaluate(() => localStorage.clear());
  await page.goto(FILE);
  await page.waitForTimeout(500);

  const dash = await page.evaluate(() => {
    const sc = document.querySelector('#pane-guide .scroll');
    const cards = [...document.querySelectorAll('[data-open]')];
    return {
      cards: cards.length,
      x: sc.scrollWidth - sc.clientWidth,
      d: document.documentElement.scrollWidth - window.innerWidth,
      label: document.getElementById('prog-label').textContent,
      rail: document.querySelectorAll('#rail i').length,
      read: document.querySelectorAll('[data-open].read').length,
      // Each card states the running position after its own entry.
      runs: [...document.querySelectorAll('.card-run')].map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      next: document.getElementById('next-label').textContent,
      backHidden: document.getElementById('btn-prev').hidden
    };
  });
  check('the dashboard lists every entry and report', dash.cards === 13, 'cards=' + dash.cards);
  check('the dashboard does not overflow at 390px', dash.x <= 0 && dash.d <= 0, `pane +${dash.x}, doc +${dash.d}`);
  check('nothing is marked read before anything is opened',
    dash.read === 0 && /0 of 13/.test(dash.label), dash.read + ' / ' + dash.label);
  check('the rail has one tick per screen', dash.rail === 13, 'rail=' + dash.rail);
  check('the dashboard offers Start, not Back', dash.next === 'Start' && dash.backHidden);

  // The running balance on each card must match the ledger cumulatively.
  const runsOk = await page.evaluate(() => {
    const bad = [];
    const cards = [...document.querySelectorAll('.card-run')];
    let t = {};
    COLS.forEach(c => (t[c.k] = 0));
    LEDGER.forEach((r, i) => {
      COLS.forEach(c => { if (r[c.k]) t[c.k] += r[c.k]; });
      const want = '$' + assetsOf(t).toLocaleString('en-US');
      const got = (cards[i] || {}).textContent || '';
      if (got.split(want).length - 1 !== 2) bad.push('row ' + r.id + ' should read ' + want + ' twice, got "' + got.trim() + '"');
    });
    return bad;
  });
  check('each card shows the running balance after its own entry', runsOk.length === 0, runsOk.slice(0, 2).join('; '));

  // ---------------------------------------------------------------
  console.log('\nNAVIGATION');
  // ---------------------------------------------------------------
  const N = await page.evaluate(() => ENTRIES.length + REPORTS.length);
  let navOk = true, overflow = [];
  await page.click('#btn-next');                    // Start → first entry
  for (let i = 0; i < N; i++) {
    await page.waitForTimeout(60);
    const o = await page.evaluate(() => {
      const sc = document.querySelector('#pane-guide .scroll');
      return {
        x: sc.scrollWidth - sc.clientWidth,
        d: document.documentElement.scrollWidth - window.innerWidth,
        label: document.getElementById('prog-label').textContent,
        h1: document.querySelectorAll('h1').length,
        viz: document.querySelectorAll('.viz').length
      };
    });
    if (o.x > 0 || o.d > 0) { overflow.push('screen ' + i + ' +' + o.x); navOk = false; }
    if (o.h1 !== 1) { overflow.push('screen ' + i + ' h1=' + o.h1); navOk = false; }
    if (o.viz < 1) { overflow.push('screen ' + i + ' has no illustration'); navOk = false; }
    if (!new RegExp('\\b' + (i + 1) + ' of ' + N + '\\b').test(o.label)) {
      overflow.push('screen ' + i + ' labelled "' + o.label + '"'); navOk = false;
    }
    if (i < N - 1) await page.click('#btn-next');
  }
  check('all ' + N + ' screens open with an illustration, one h1 and no overflow', navOk, overflow.slice(0, 3).join(', '));

  const finished = await page.evaluate(() => document.getElementById('next-label').textContent);
  check('the last screen finishes rather than dead-ending', finished === 'Finish', finished);
  await page.click('#btn-next');
  await page.waitForTimeout(150);
  const afterFinish = await page.evaluate(() => ({
    cards: document.querySelectorAll('[data-open]').length,
    read: document.querySelectorAll('[data-open].read').length,
    label: document.getElementById('prog-label').textContent
  }));
  check('Finish returns to the dashboard with everything marked read',
    afterFinish.cards === 13 && afterFinish.read === 13 && /13 of 13/.test(afterFinish.label),
    JSON.stringify(afterFinish));

  await page.goto(FILE + '#lo21-5');
  await page.waitForTimeout(500);
  check('deep link #lo21-5 opens that entry',
    (await page.evaluate(() => document.getElementById('prog-label').textContent)) === 'Entry 5 of 13');
  await page.click('#btn-next');
  await page.waitForTimeout(150);
  await page.goBack();
  await page.waitForTimeout(250);
  check('browser Back returns to the previous entry',
    (await page.evaluate(() => document.getElementById('prog-label').textContent)) === 'Entry 5 of 13');
  await page.click('#btn-prev');
  await page.waitForTimeout(200);
  check('the back button returns to the dashboard',
    (await page.evaluate(() => document.querySelectorAll('[data-open]').length)) === 13);

  // ---------------------------------------------------------------
  console.log('\nILLUSTRATIONS');
  // ---------------------------------------------------------------
  await page.goto(FILE + '#lo21-3');
  await page.waitForTimeout(1400);
  const il = await page.evaluate(() => {
    const chips = [...document.querySelectorAll('.bb-chip')];
    // A long account name used to widen its panel rather than wrap, which
    // pushed the whole board past the card holding it. Measure the board
    // against its container, not the chip against the panel it grew.
    const spill = [...document.querySelectorAll('.viz .bb')].filter(bb => {
      const box = bb.parentNode.getBoundingClientRect();
      const r = bb.getBoundingClientRect();
      return r.right > box.right + 0.5 || r.left < box.left - 0.5 || bb.scrollWidth > bb.clientWidth;
    }).length;
    const fills = [...document.querySelectorAll('.bb-fill')].map(f => f.style.width);
    return {
      chips: chips.length,
      spill,
      fills,
      nums: [...document.querySelectorAll('.bb-num')].map(n => n.textContent),
      tokens: document.querySelectorAll('.fx-tok').length,
      verdict: (document.querySelector('.viz .verdict') || {}).textContent || ''
    };
  });
  check('the balance board shows both effects of the entry', il.chips === 2, 'chips=' + il.chips);
  check('no chip escapes its panel', il.spill === 0, 'spill=' + il.spill);
  check('the bars are driven to their end width', il.fills.every(w => w && w !== '0%'), il.fills.join(','));
  check('the figures land on the running totals', il.nums.join(' ') === '$12,200 $12,200', il.nums.join(' '));
  check('the flow scene draws a token per direction', il.tokens === 2, 'tokens=' + il.tokens);
  check('the verdict names what this entry did to each side',
    /rises by \$3,000, landing on \$12,200/.test(il.verdict), il.verdict.trim());

  // Under reduced motion the same figures must be there without the animation.
  const still = await browser.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
  await still.goto(FILE + '#lo21-3');
  await still.waitForTimeout(300);
  const rmViz = await still.evaluate(() => ({
    nums: [...document.querySelectorAll('.bb-num')].map(n => n.textContent),
    fills: [...document.querySelectorAll('.bb-fill')].map(f => f.style.width),
    anim: getComputedStyle(document.querySelector('.bb-chip')).animationName
  }));
  check('reduced motion still shows the final figures and bars',
    rmViz.nums.join(' ') === '$12,200 $12,200' && rmViz.fills.every(w => w && w !== '0%'),
    JSON.stringify(rmViz));
  check('reduced motion drops the illustration animation', rmViz.anim === 'none', rmViz.anim);
  await still.close();

  // ---------------------------------------------------------------
  console.log('\nACCESSIBILITY');
  // ---------------------------------------------------------------
  const a11y = await page.evaluate(() => {
    const unnamed = [];
    document.querySelectorAll('button').forEach(el => {
      if (!((el.getAttribute('aria-label') || '') + el.textContent.trim())) unnamed.push(el.id || el.className);
    });
    const small = [];
    document.querySelectorAll('button, a').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && (r.height < 44 || r.width < 44)) small.push(el.id || el.className);
    });
    return {
      unnamed, small,
      h1: document.querySelectorAll('h1').length,
      live: !!document.querySelector('[aria-live]'),
      skip: !!document.querySelector('.skip'),
      touch: getComputedStyle(document.getElementById('btn-next')).touchAction,
      scheme: getComputedStyle(document.documentElement).colorScheme,
      zoom: !/maximum-scale|user-scalable=no/.test(document.querySelector('meta[name=viewport]').content)
    };
  });
  check('every button has an accessible name', a11y.unnamed.length === 0, a11y.unnamed.join(','));
  check('no interactive target under 44px', a11y.small.length === 0, a11y.small.join(','));
  check('exactly one h1', a11y.h1 === 1, 'found ' + a11y.h1);
  check('changing content is announced (aria-live)', a11y.live);
  check('skip link present', a11y.skip);
  check('touch-action manipulation on buttons', a11y.touch === 'manipulation', a11y.touch);
  check('color-scheme declared', a11y.scheme === 'light' || a11y.scheme === 'dark', a11y.scheme);
  check('pinch zoom not disabled', a11y.zoom);

  // ---------------------------------------------------------------
  console.log('\nWORKING PAPER (2.1)');
  // ---------------------------------------------------------------
  // The 2.1 worksheet is the tabular summary itself: a cell per account per
  // transaction, footed live. Drive it through the cells, not the model.
  const ws = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const wsErrors = [];
  ws.on('pageerror', e => wsErrors.push('pageerror: ' + e.message));
  ws.on('console', m => { if (m.type() === 'error') wsErrors.push('console: ' + m.text()); });
  await ws.goto(FILE);
  await ws.evaluate(() => localStorage.clear());
  await ws.goto(FILE + '#lo21');
  await ws.waitForTimeout(400);
  await ws.click('#tab-solve');
  await ws.waitForTimeout(300);

  const shape = await ws.evaluate(() => {
    const sc = document.querySelector('#pane-solve .scroll');
    return {
      cells: document.querySelectorAll('.cell').length,
      cols: document.querySelectorAll('table.wp thead .acct th').length - 1,
      rows: document.querySelectorAll('.wp-row').length,
      sources: document.querySelectorAll('#solve .ws-tx').length,
      fields: document.querySelectorAll('#solve .ws-field').length,
      h1: document.querySelectorAll('h1').length,
      prefilled: [...document.querySelectorAll('.cell')].filter(c => c.value).length,
      tips: document.querySelectorAll('#solve .ws-note').length,
      score: document.getElementById('ws-score').textContent,
      // The page must not scroll sideways; the working paper scrolls inside
      // its own box, which is what a nine-column paper does.
      pageX: sc.scrollWidth - sc.clientWidth,
      docX: document.documentElement.scrollWidth - window.innerWidth,
      gridX: (() => { const g = document.querySelector('.wp-scroll'); return g.scrollWidth - g.clientWidth; })()
    };
  });
  check('the working paper is a full grid: 9 rows by 9 columns',
    shape.cells === 81 && shape.cols === 9 && shape.rows === 9,
    `cells=${shape.cells} cols=${shape.cols} rows=${shape.rows}`);
  check('every transaction is listed as a source document', shape.sources === 9, 'sources=' + shape.sources);
  check('the grid scrolls sideways inside its own box, not the page',
    shape.pageX <= 0 && shape.docX <= 0 && shape.gridX > 0,
    `page +${shape.pageX} doc +${shape.docX} grid +${shape.gridX}`);
  check('the working paper starts blank with no hint shown',
    shape.prefilled === 0 && shape.tips === 0 && /0 of 14/.test(shape.score), shape.score);
  check('still exactly one h1 on the working paper', shape.h1 === 1, 'found ' + shape.h1);

  // Columns foot themselves as cells are filled, and a decrease is typed
  // with a minus sign the way it is written on a summary.
  await ws.fill('[data-cell="0.cash"]', '10000');
  await ws.fill('[data-cell="0.cs"]', '10000');
  await ws.fill('[data-cell="1.cash"]', '-800');
  await ws.fill('[data-cell="1.exp"]', '800');
  await ws.waitForTimeout(200);
  const footed = await ws.evaluate(() => ({
    foot: [...document.querySelectorAll('#solve tfoot td')].map(t => t.textContent.trim()),
    proof: document.querySelector('.sw-panel-bd .gl-off').textContent.replace(/\s+/g, ' ').trim(),
    ok: document.querySelector('.sw-panel-bd .gl-off').classList.contains('ok'),
    count: document.getElementById('wp-count').textContent.replace(/\s+/g, ' ').trim()
  }));
  check('the columns foot themselves as cells are filled',
    footed.foot[1] === '9,200' && footed.foot[8] === '800', footed.foot.join(' | '));
  check('a decrease typed with a minus sign reduces the column',
    /Assets \$9,200 = Liabilities \+ Equity \$9,200/.test(footed.proof) && footed.ok, footed.proof);
  check('the toolbar counts the lines started', /^2\s*of 9 lines$/.test(footed.count), footed.count);

  // An entry that does not balance is reported before anything is graded.
  await ws.fill('[data-cell="1.exp"]', '900');
  await ws.waitForTimeout(150);
  const outBy = await ws.evaluate(() => document.querySelector('.sw-panel-bd .gl-off').textContent.replace(/\s+/g, ' ').trim());
  check('an out-of-balance working paper says by how much', /\$100/.test(outBy), outBy);
  await ws.fill('[data-cell="1.exp"]', '800');

  // Grading: a wrong column is told apart from a wrong figure.
  await ws.fill('[data-cell="2.eq"]', '3000');
  await ws.fill('[data-cell="2.np"]', '3000');          // should be Accounts Payable
  await ws.click('#btn-check');
  await ws.waitForTimeout(200);
  const graded = await ws.evaluate(() => ({
    rowWrong: document.querySelector('[data-row="2"]').classList.contains('wrong'),
    cardWrong: document.querySelector('#solve [data-tx="2"]').classList.contains('wrong'),
    note: (document.querySelector('[data-note="2"]') || {}).textContent || '',
    rightRows: document.querySelectorAll('.wp-row.right').length,
    untouched: document.querySelectorAll('.wp-row.wrong').length
  }));
  check('a wrong column is marked on the grid line and its source document',
    graded.rowWrong && graded.cardWrong);
  check('and is diagnosed as a wrong column, not a wrong figure',
    /at least one column is wrong/.test(graded.note), graded.note.trim().slice(0, 80));
  check('correct lines are marked right and untouched lines are left alone',
    graded.rightRows === 2 && graded.untouched === 1,
    `right=${graded.rightRows} wrong=${graded.untouched}`);

  // Hints still escalate one level at a time.
  const hints = [];
  for (let i = 0; i < 4; i++) {
    await ws.click('[data-hint="1"]').catch(() => {});
    await ws.waitForTimeout(60);
    hints.push(await ws.evaluate(() => ({
      text: (document.querySelector('[data-note="1"] .ws-note') || {}).textContent || '',
      label: document.querySelector('[data-hint="1"]').textContent.trim(),
      done: document.querySelector('[data-hint="1"]').disabled
    })));
  }
  check('each press of Hint reveals exactly one new level',
    hints[0].text && hints[0].text !== hints[1].text && hints[1].text !== hints[2].text,
    hints.map(h => h.text.slice(0, 20)).join(' | '));
  check('only the last hint states the figures',
    !/\$800/.test(hints[0].text) && /\$800/.test(hints[2].text), hints[0].text.slice(0, 60));
  check('the Hint button says whether more are left and then stops',
    hints[0].label === 'Another hint' && hints[2].label === 'No more hints' && hints[2].done,
    hints.map(h => h.label).join(' / '));

  // Work survives a reload.
  await ws.reload();
  await ws.waitForTimeout(500);
  const restored = await ws.evaluate(() => ({
    solving: document.getElementById('pane-solve').classList.contains('on'),
    cash: (document.querySelector('[data-cell="0.cash"]') || {}).value,
    minus: (document.querySelector('[data-cell="1.cash"]') || {}).value,
    hint: !!document.querySelector('[data-note="1"] .ws-note')
  }));
  check('the working paper reopens with its cells and hints intact',
    restored.solving && restored.cash === '10000' && restored.minus === '-800' && restored.hint,
    JSON.stringify(restored));

  // Fill the whole paper correctly and report the five figures.
  const { keys, plan } = await ws.evaluate(() => ({
    keys: COLS.map(c => c.k),
    plan: LEDGER.map((r, ri) => ({ ri, cells: COLS.filter(c => r[c.k]).map(c => ({ k: c.k, v: r[c.k] })) }))
  }));
  for (const row of plan) {
    for (const k of keys) await ws.fill(`[data-cell="${row.ri}.${k}"]`, '');
    for (const c of row.cells) await ws.fill(`[data-cell="${row.ri}.${c.k}"]`, String(c.v));
  }
  const answers = await ws.evaluate(() => {
    const t = totalsUpTo(999);
    return { ni: t.rev - t.exp, re: t.rev - t.exp - t.div, ta: t.cash + t.ar + t.eq,
             tl: t.np + t.ap, te: t.cs + t.rev - t.exp - t.div };
  });
  for (const [id, v] of Object.entries(answers)) await ws.fill(`[data-fld="${id}"]`, String(v));
  await ws.click('#btn-check');
  await ws.waitForTimeout(250);
  const solved = await ws.evaluate(() => ({
    score: document.getElementById('ws-score').textContent,
    right: document.querySelectorAll('.wp-row.right').length,
    wrong: document.querySelectorAll('.wp-row.wrong, #solve .ws-field.wrong').length,
    proof: document.querySelector('.sw-panel-bd .gl-off').textContent.replace(/\s+/g, ' ').trim(),
    label: document.getElementById('btn-check').textContent
  }));
  check('a correctly filled working paper scores 14 of 14', /14 of 14/.test(solved.score), solved.score);
  check('every grid line and field is marked right', solved.right === 9 && solved.wrong === 0,
    `right=${solved.right} wrong=${solved.wrong}`);
  check('the finished paper foots to $15,500 on both sides',
    /Assets \$15,500 = Liabilities \+ Equity \$15,500/.test(solved.proof), solved.proof);
  check('the button acknowledges completion', /All correct/.test(solved.label), solved.label);

  const wsLayout = await ws.evaluate(() => {
    const small = [], unnamed = [];
    document.querySelectorAll('#solve button, .controls button').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && (r.height < 44 || r.width < 44)) small.push(el.className || el.id);
      const name = (el.getAttribute('aria-label') || '') + el.textContent.trim();
      if (!name) unnamed.push(el.className);
    });
    const noLabel = [...document.querySelectorAll('#solve input, #solve select')]
      .filter(e => !e.getAttribute('aria-label') && !(e.labels && e.labels.length)).length;
    return { small, unnamed, noLabel };
  });
  // A sticky column must be opaque in both themes, or the cells scrolling
  // under it show through. The green and red tints are translucent in dark.
  const sticky = await ws.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const out = [];
    document.querySelectorAll('#solve table.wp .rowlab').forEach(el => {
      const bg = getComputedStyle(el).background;
      const rgba = bg.match(/rgba?\(([^)]+)\)/);
      const parts = rgba ? rgba[1].split(',').map(s => parseFloat(s)) : [];
      const alpha = parts.length === 4 ? parts[3] : 1;
      const layered = /gradient/.test(bg);
      if (alpha < 1 && !layered) out.push(el.textContent.trim() + ' a=' + alpha);
    });
    document.documentElement.setAttribute('data-theme', 'light');
    return out;
  });
  check('the sticky transaction column is opaque in dark mode too',
    sticky.length === 0, sticky.join(', '));

  check('no working-paper control is under 44px', wsLayout.small.length === 0, wsLayout.small.join(','));
  check('every working-paper control has an accessible name',
    wsLayout.unnamed.length === 0 && wsLayout.noLabel === 0,
    wsLayout.unnamed.join(',') + ' unlabelled inputs=' + wsLayout.noLabel);
  check('no working-paper console or page errors', wsErrors.length === 0, wsErrors.slice(0, 3).join(' | '));
  await ws.close();
  // ---------------------------------------------------------------
  console.log('\nMODULE 2.2 — JOURNALIZE, POST, TRIAL BALANCE');
  // ---------------------------------------------------------------
  const k = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const kErr = [];
  k.on('pageerror', e => kErr.push('pageerror: ' + e.message));
  k.on('console', m => { if (m.type() === 'error') kErr.push('console: ' + m.text()); });
  await k.goto(FILE);
  await k.evaluate(() => localStorage.clear());
  await k.goto(FILE + '#lo22');
  await k.waitForTimeout(500);

  // Arithmetic first: everything downstream is derived from JOURNAL, so if
  // the journal does not balance nothing else can be trusted.
  const arith = await k.evaluate(() => {
    const bad = [];
    JOURNAL.forEach(j => {
      if (jDebits(j) !== jCredits(j)) bad.push(j.id + ' Dr ' + jDebits(j) + ' Cr ' + jCredits(j));
      j.lines.forEach(l => {
        if (!acct(l[0])) bad.push(j.id + ' posts to unknown account ' + l[0]);
        if (l[1] && l[2]) bad.push(j.id + ' has a line that is both a debit and a credit');
      });
    });
    const full = postedThrough(999);
    const t = trialTotals(full);
    return {
      bad,
      dr: t.dr, cr: t.cr,
      // The figures the textbook prints for this problem.
      bals: { cash: balOf(full, 'cash'), ar: balOf(full, 'ar'), sup: balOf(full, 'sup'),
              ppi: balOf(full, 'ppi'), eqp: balOf(full, 'eqp'), ap: balOf(full, 'ap'),
              cs: balOf(full, 'cs'), div: balOf(full, 'div'), rev: balOf(full, 'rev'),
              mre: balOf(full, 'mre'), swx: balOf(full, 'swx') },
      unused: ACCT.filter(a => !full[a.k].lines.length).map(a => a.k),
      entries: ENTRIES2.length, reports: REPORTS2.length, journal: JOURNAL.length
    };
  });
  check('every journal entry has equal debits and credits and real accounts',
    arith.bad.length === 0, arith.bad.join('; '));
  check('the trial balance columns both total 23,600',
    arith.dr === 23600 && arith.cr === 23600, arith.dr + ' / ' + arith.cr);
  const WANT = { cash: 5410, ar: 4600, sup: 900, ppi: 1800, eqp: 8000, ap: 5400,
                 cs: 12000, div: 600, rev: 6200, mre: 290, swx: 2000 };
  const wrongBal = Object.keys(WANT).filter(a => arith.bals[a] !== WANT[a]);
  check('every posted balance matches the textbook solution', wrongBal.length === 0,
    wrongBal.map(a => a + ' ' + arith.bals[a] + ' vs ' + WANT[a]).join(', '));
  check('the accounts awaiting adjustment are still listed and empty',
    ['swp', 're', 'supx', 'depx', 'insx'].every(x => arith.unused.indexOf(x) !== -1), arith.unused.join(','));
  check('11 journal entries have 11 explanations', arith.entries === arith.journal && arith.journal === 11,
    arith.entries + ' vs ' + arith.journal);

  const kDash = await k.evaluate(() => {
    const sc = document.querySelector('#pane-guide .scroll');
    return {
      cards: document.querySelectorAll('[data-open]').length,
      x: sc.scrollWidth - sc.clientWidth,
      d: document.documentElement.scrollWidth - window.innerWidth,
      label: document.getElementById('prog-label').textContent,
      name: document.getElementById('mod-name').textContent,
      // The appbar wrapped to three lines before the labels were clamped.
      barH: Math.round(document.querySelector('.appbar').getBoundingClientRect().height)
    };
  });
  check('the 2.2 dashboard lists 11 entries and 2 reports', kDash.cards === 13, 'cards=' + kDash.cards);
  check('the 2.2 dashboard does not overflow at 390px', kDash.x <= 0 && kDash.d <= 0, `+${kDash.x} / +${kDash.d}`);
  check('the appbar stays two lines with the longer company name', kDash.barH <= 92, kDash.barH + 'px');

  // Walk all 13 screens.
  let kOk = true, kBad = [];
  await k.click('#btn-next');
  for (let i = 0; i < 13; i++) {
    await k.waitForTimeout(60);
    const o = await k.evaluate(() => {
      const sc = document.querySelector('#pane-guide .scroll');
      return {
        x: sc.scrollWidth - sc.clientWidth,
        d: document.documentElement.scrollWidth - window.innerWidth,
        h1: document.querySelectorAll('h1').length,
        viz: document.querySelectorAll('.viz').length,
        label: document.getElementById('prog-label').textContent
      };
    });
    if (o.x > 0 || o.d > 0) { kBad.push('screen ' + i + ' +' + o.x); kOk = false; }
    if (o.h1 !== 1) { kBad.push('screen ' + i + ' h1=' + o.h1); kOk = false; }
    if (o.viz < 1) { kBad.push('screen ' + i + ' has no illustration'); kOk = false; }
    if (i < 12) await k.click('#btn-next');
  }
  check('all 13 of the 2.2 screens open cleanly with an illustration', kOk, kBad.slice(0, 3).join(', '));

  // The posting illustration must show the entry landing in the right side
  // of each T-account it touches.
  await k.goto(FILE + '#lo22-j2');
  await k.waitForTimeout(600);
  const posting = await k.evaluate(() => {
    const tas = [...document.querySelectorAll('.post-wrap .ta')];
    return {
      count: tas.length,
      names: tas.map(t => t.querySelector('.ta-name').textContent),
      // Equipment 8,000 must sit on the debit side; A/P and Cash on credit.
      eqpDr: (tas[0].querySelector('.ta-side.d') || {}).textContent || '',
      apCr: (tas[1].querySelector('.ta-side.c') || {}).textContent || '',
      apDr: (tas[1].querySelector('.ta-side.d') || {}).textContent || '',
      // The board must say Cash went DOWN even though it landed on credit.
      down: [...document.querySelectorAll('.rule-acct.down')].map(e => e.textContent.replace(/\s+/g, ' ').trim())
    };
  });
  check('a compound entry posts to all three of its accounts', posting.count === 3, 'ts=' + posting.count);
  check('each amount lands on the side the journal put it',
    /8,000/.test(posting.eqpDr) && /6,000/.test(posting.apCr) && !/6,000/.test(posting.apDr),
    posting.names.join(' / '));
  check('an account credited because it fell is marked as falling, not rising',
    posting.down.length === 1 && /Cash/.test(posting.down[0]) && /2,000/.test(posting.down[0]),
    JSON.stringify(posting.down));

  // The 2.2 worksheet, as a ledger package.
  await k.goto(FILE + '#lo22');
  await k.waitForTimeout(400);
  await k.click('#tab-solve');
  await k.waitForTimeout(400);
  const ws2 = await k.evaluate(() => ({
    vouchers: document.querySelectorAll('.doc-je').length,
    lines: document.querySelectorAll('[data-a2]').length,
    fields: document.querySelectorAll('[data-field2]').length,
    // Accounts are addressed by number, the way a chart of accounts is.
    firstOpt: document.querySelector('[data-a2="0.0"]').options[1].textContent.trim(),
    numbered: [...document.querySelector('[data-a2="0.0"]').options].slice(1)
      .every(o => /^\d{3}\s/.test(o.textContent.trim())),
    prefilled: [...document.querySelectorAll('.gl-amt')].filter(e => e.value).length,
    postDisabled: [...document.querySelectorAll('[data-post]')].every(b => b.disabled),
    pills: [...new Set([...document.querySelectorAll('.pill')].map(p => p.textContent.trim()))],
    score: document.getElementById('ws-score').textContent,
    x: (() => { const s = document.querySelector('#pane-solve .scroll'); return s.scrollWidth - s.clientWidth; })()
  }));
  check('the journal has a voucher per transaction and a line per posting',
    ws2.vouchers === 11 && ws2.lines === 23 && ws2.fields === 4,
    `vouchers=${ws2.vouchers} lines=${ws2.lines} fields=${ws2.fields}`);
  check('accounts are selected by number and name', ws2.numbered && /^101\s+Cash$/.test(ws2.firstOpt), ws2.firstOpt);
  check('the journal starts blank with every voucher in draft',
    ws2.prefilled === 0 && ws2.pills.join() === 'Draft' && /0 of 15/.test(ws2.score),
    ws2.pills.join('/') + ' ' + ws2.score);
  check('nothing can be posted before anything is entered', ws2.postDisabled);
  check('the journal does not overflow at 390px', ws2.x <= 0, '+' + ws2.x);

  // A half-entered voucher reports what it is out by, and stays unpostable.
  await k.selectOption('[data-a2="0.0"]', 'cash');
  await k.fill('[data-d2="0.0"]', '12000');
  await k.waitForTimeout(200);
  const half = await k.evaluate(() => ({
    off: document.querySelector('[data-tx2="0"] .gl-off').textContent.replace(/\s+/g, ' ').trim(),
    pill: document.querySelector('[data-tx2="0"] .pill').textContent.trim(),
    post: document.querySelector('[data-post="0"]').disabled
  }));
  check('a one-sided voucher says how far out of balance it is',
    /Out of balance/.test(half.off) && /12,000/.test(half.off), half.off);
  check('and cannot be posted', half.post && half.pill === 'Out of balance', half.pill);

  // The debit and credit columns are mutually exclusive.
  await k.fill('[data-c2="0.0"]', '500');
  await k.waitForTimeout(200);
  const excl = await k.evaluate(() => ({
    dr: document.querySelector('[data-d2="0.0"]').value,
    cr: document.querySelector('[data-c2="0.0"]').value,
    muted: document.querySelector('[data-d2="0.0"]').classList.contains('muted')
  }));
  check('typing in one amount column clears the other',
    excl.dr === '' && excl.cr === '500' && excl.muted, JSON.stringify(excl));
  await k.fill('[data-c2="0.0"]', '');
  await k.fill('[data-d2="0.0"]', '12000');

  // Both lines complete but the amounts disagree. Post has to stay blocked
  // for that reason alone — an incomplete line would block it anyway and
  // would not prove the balance rule is being applied.
  await k.selectOption('[data-a2="0.1"]', 'cs');
  await k.fill('[data-c2="0.1"]', '10000');
  await k.waitForTimeout(200);
  const lop = await k.evaluate(() => ({
    post: document.querySelector('[data-post="0"]').disabled,
    off: document.querySelector('[data-tx2="0"] .gl-off').textContent.replace(/\s+/g, ' ').trim(),
    complete: [...document.querySelectorAll('[data-tx2="0"] .gl-acct')].every(s => s.value)
  }));
  check('a complete but unbalanced voucher is blocked from posting',
    lop.complete && lop.post && /\$2,000/.test(lop.off), JSON.stringify(lop));

  // Balanced: the software allows the post.
  await k.fill('[data-c2="0.1"]', '12000');
  await k.waitForTimeout(200);
  const bal = await k.evaluate(() => ({
    pill: document.querySelector('[data-tx2="0"] .pill').textContent.trim(),
    post: document.querySelector('[data-post="0"]').disabled,
    off: document.querySelector('[data-tx2="0"] .gl-off').classList.contains('ok')
  }));
  check('a balanced voucher becomes postable', !bal.post && bal.pill === 'Balanced' && bal.off, JSON.stringify(bal));
  await k.click('[data-post="0"]');
  await k.waitForTimeout(300);
  const posted = await k.evaluate(() => ({
    pill: document.querySelector('[data-tx2="0"] .pill').textContent.trim(),
    locked: document.querySelector('[data-a2="0.0"]').disabled,
    readonly: document.querySelector('[data-d2="0.0"]').readOnly,
    reg: document.querySelector('.sw-panel-hd span').textContent.trim(),
    counts: [...document.querySelectorAll('.sw-count b')].map(b => b.textContent)
  }));
  check('posting locks the voucher and moves it into the register',
    posted.pill === 'Posted' && posted.locked && posted.readonly && /1 of 11/.test(posted.reg),
    JSON.stringify(posted));
  check('the toolbar counts unposted and posted', posted.counts.join('/') === '10/1', posted.counts.join('/'));

  // The lesson the guide states, met first-hand: the software will post a
  // balanced entry that uses entirely the wrong accounts, and the register
  // still reports debits equal to credits.
  await k.selectOption('[data-a2="1.0"]', 'supx');       // should be Equipment
  await k.fill('[data-d2="1.0"]', '8000');
  await k.selectOption('[data-a2="1.1"]', 'ap');
  await k.fill('[data-c2="1.1"]', '6000');
  await k.selectOption('[data-a2="1.2"]', 'cash');
  await k.fill('[data-c2="1.2"]', '2000');
  await k.waitForTimeout(250);
  const wrongOk = await k.evaluate(() => document.querySelector('[data-post="1"]').disabled);
  check('a balanced but wrong voucher is still postable, as in real software', !wrongOk);
  await k.click('[data-post="1"]');
  await k.waitForTimeout(300);
  const reg2 = await k.evaluate(() => ({
    verdict: document.querySelector('.sw-panel .verdict').textContent.replace(/\s+/g, ' ').trim(),
    ok: document.querySelector('.sw-panel .verdict').classList.contains('ok')
  }));
  check('and the register still says debits equal credits',
    reg2.ok && /does not make them the right accounts/.test(reg2.verdict), reg2.verdict.slice(0, 90));
  await k.click('#btn-check');
  await k.waitForTimeout(250);
  const caught = await k.evaluate(() => ({
    flagged: document.querySelector('[data-tx2="1"]').classList.contains('graded-bad'),
    note: (document.querySelector('[data-note2="1"]') || {}).textContent || ''
  }));
  check('but Check my work catches the wrong account the register could not',
    caught.flagged && /at least one account is wrong/.test(caught.note), caught.note.trim().slice(0, 80));

  // Unposting returns a voucher to draft.
  await k.click('[data-unpost="1"]');
  await k.waitForTimeout(300);
  const un = await k.evaluate(() => ({
    locked: document.querySelector('[data-a2="1.0"]').disabled,
    reg: document.querySelector('.sw-panel-hd span').textContent.trim()
  }));
  check('unposting reopens the voucher and pulls it back out of the register',
    !un.locked && /1 of 11/.test(un.reg), JSON.stringify(un));

  // Fill every voucher correctly, through the grid.
  const plan2 = await k.evaluate(() => JOURNAL.map((j, ji) => ({
    ji, lines: j.lines.map(l => ({ k: l[0], col: l[1] ? 'd' : 'c', n: l[1] || l[2] }))
  })));
  for (const e of plan2) {
    for (let i = 0; i < e.lines.length; i++) {
      const locked = await k.evaluate(ji => !!document.querySelector('[data-unpost="' + ji + '"]'), e.ji);
      if (locked) await k.click(`[data-unpost="${e.ji}"]`);
      await k.selectOption(`[data-a2="${e.ji}.${i}"]`, e.lines[i].k);
      await k.fill(`[data-d2="${e.ji}.${i}"]`, '');
      await k.fill(`[data-c2="${e.ji}.${i}"]`, '');
      await k.fill(`[data-${e.lines[i].col}2="${e.ji}.${i}"]`, String(e.lines[i].n));
    }
    await k.click(`[data-post="${e.ji}"]`);
    await k.waitForTimeout(40);
  }
  const ans2 = await k.evaluate(() => {
    const f = postedThrough(999);
    return { cash: balOf(f, 'cash'), ar: balOf(f, 'ar'), ap: balOf(f, 'ap'), tot: trialTotals(f).dr };
  });
  for (const [id, v] of Object.entries(ans2)) await k.fill(`[data-fld2="${id}"]`, String(v));
  await k.click('#btn-check');
  await k.waitForTimeout(300);
  const solved2 = await k.evaluate(() => ({
    score: document.getElementById('ws-score').textContent,
    bad: document.querySelectorAll('.doc-je.graded-bad, .ws-field.wrong').length,
    posted: document.querySelectorAll('[data-unpost]').length,
    reg: document.querySelector('.sw-panel .tb-tot').textContent.replace(/\s+/g, ' ').trim()
  }));
  check('a correctly journalized book scores 15 of 15', /15 of 15/.test(solved2.score), solved2.score);
  check('every voucher is posted and none is flagged',
    solved2.posted === 11 && solved2.bad === 0, `posted=${solved2.posted} bad=${solved2.bad}`);
  // A journal report totals everything journalized; a trial balance totals
  // net account balances. 34,890 and 23,600 are both right, and different.
  check('the register foots to the total journalized on both sides',
    (solved2.reg.match(/34,890/g) || []).length === 2 && /Total journalized/.test(solved2.reg), solved2.reg);

  const l2 = await k.evaluate(() => {
    const small = [], unnamed = [];
    document.querySelectorAll('#solve button').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && (r.height < 44 || r.width < 44)) small.push(el.className);
      if (!((el.getAttribute('aria-label') || '') + el.textContent.trim())) unnamed.push(el.className);
    });
    const noLabel = [...document.querySelectorAll('#solve input, #solve select')]
      .filter(e => !e.getAttribute('aria-label') && !(e.labels && e.labels.length)).length;
    return { small, unnamed, noLabel };
  });
  check('no journal control is under 44px', l2.small.length === 0, l2.small.join(','));
  check('every journal control has an accessible name',
    l2.unnamed.length === 0 && l2.noLabel === 0, l2.unnamed.join(',') + ' unlabelled=' + l2.noLabel);

  // Module isolation, measured the way a learner sees it rather than by the
  // shape of what is in localStorage: reading 2.2 must show up as progress in
  // 2.2 and must leave 2.1 untouched.
  // Navigate the way a person would. A goto that only changes the hash does
  // not reload the document or fire popstate, and the Solve tab empties
  // #guide — measuring through either would report on the wrong screen.
  const dashState = () => k.evaluate(() => ({
    label: document.getElementById('prog-label').textContent,
    read: document.querySelectorAll('[data-open].read').length,
    name: document.getElementById('mod-name').textContent
  }));
  await k.click('#tab-guide');
  await k.waitForTimeout(300);
  const seen22 = await dashState();
  await k.click('#mod-btn');
  await k.waitForTimeout(250);
  await k.click('[data-mod="0"]');
  await k.waitForTimeout(400);
  const seen21 = await dashState();
  check('progress made in 2.2 shows up in 2.2',
    seen22.read === 13 && /13 of 13/.test(seen22.label), JSON.stringify(seen22));
  check('and leaves module 2.1 untouched',
    seen21.read === 0 && /0 of 13/.test(seen21.label), JSON.stringify(seen21));

  // The switcher.
  await k.goto(FILE + '#lo21');
  await k.waitForTimeout(400);
  await k.click('#mod-btn');
  await k.waitForTimeout(300);
  const sheet = await k.evaluate(() => ({
    open: document.getElementById('sheet').classList.contains('on'),
    cards: document.querySelectorAll('[data-mod]').length,
    current: document.querySelectorAll('[data-mod].on').length,
    counts: [...document.querySelectorAll('[data-mod] em')].map(e => e.textContent)
  }));
  check('the switcher lists both modules and marks the open one',
    sheet.open && sheet.cards === 2 && sheet.current === 1, JSON.stringify(sheet));
  check('the switcher reports progress per module',
    sheet.counts.some(c => /13 of 13|[1-9]\d* of 13/.test(c)), sheet.counts.join(' | '));
  await k.keyboard.press('Escape');
  await k.waitForTimeout(200);
  check('Escape closes the switcher',
    !(await k.evaluate(() => document.getElementById('sheet').classList.contains('on'))));
  await k.click('#mod-btn');
  await k.waitForTimeout(250);
  await k.click('[data-mod="1"]');
  await k.waitForTimeout(400);
  check('choosing a module switches to it and updates the URL',
    (await k.evaluate(() => location.hash)) === '#lo22' &&
    /Kleene/.test(await k.evaluate(() => document.getElementById('mod-name').textContent)));

  check('no console or page errors across module 2.2', kErr.length === 0, kErr.slice(0, 3).join(' | '));
  await k.close();

  // ---------------------------------------------------------------
  console.log('\nMOTION');
  // ---------------------------------------------------------------
  const reduced = await browser.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
  await reduced.goto(FILE);
  await reduced.waitForTimeout(400);
  await reduced.evaluate(() => document.getElementById('btn-next').click());
  await reduced.waitForTimeout(150);
  const rm = await reduced.evaluate(() => {
    const e = document.querySelector('.fade');
    const c = getComputedStyle(e);
    return { name: c.animationName, dur: c.animationDuration };
  });
  check('reduced motion swaps to an opacity-only fade', rm.name === 'rm-fade', rm.name);

  // Read the raw stylesheet text, not CSSOM longhands: a shorthand containing
  // var() is a pending-substitution value, so style.animationDuration comes
  // back empty and a CSSOM-based check passes vacuously.
  //
  // Selectors are captured alongside the declaration because the two kinds of
  // motion here answer to different limits. Interface feedback has to keep up
  // with the finger; an illustration inside a .viz is content being explained,
  // and a token crossing a wire is meant to be watchable.
  const durations = await page.evaluate(() => {
    const css = Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent).join('\n')
      .replace(/@font-face\s*\{[\s\S]*?\}/g, '');   // base64 payloads look like durations
    const out = [];
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = re.exec(css))) {
      const sel = m[1].replace(/\s+/g, ' ').trim();
      if (sel.startsWith('@')) continue;            // keyframe stops carry no duration
      const decls = m[2].match(/(?:transition|animation)\s*:\s*[^;]+/g) || [];
      decls.forEach(d => {
        (d.match(/(\d*\.?\d+)(ms|s)\b/g) || []).forEach(v => {
          const ms = v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
          if (ms > 0) out.push({ sel, ms, viz: /\.viz\b/.test(sel) });
        });
      });
    }
    return out;
  });
  const ui = durations.filter(d => !d.viz);
  const art = durations.filter(d => d.viz);
  check('no interface animation exceeds 300ms', ui.every(d => d.ms <= 300),
    ui.filter(d => d.ms > 300).map(d => d.sel + ' ' + d.ms + 'ms').join(', '));
  check('illustration animations stay watchable and bounded (<=2s)',
    art.length > 0 && art.every(d => d.ms <= 2000),
    'found ' + art.length + ', over: ' + art.filter(d => d.ms > 2000).map(d => d.sel).join(','));

  // Every illustration animation must have a reduced-motion counterpart,
  // or the exemption above becomes a way to smuggle motion past the check.
  const rmCovered = await page.evaluate(() => {
    const css = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
    const block = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/g) || [];
    const body = block.join('\n');
    return ['.bb-chip', '.bb-fill', '.fx-tok'].filter(sel => body.indexOf(sel) === -1);
  });
  check('every illustration animation is answered under reduced motion',
    rmCovered.length === 0, 'uncovered: ' + rmCovered.join(','));

  // ---------------------------------------------------------------
  console.log('\nRUNTIME');
  // ---------------------------------------------------------------
  check('no console errors or page errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  await browser.close();

  console.log('\n' + '='.repeat(56));
  console.log(pass + ' passed, ' + failures.length + ' failed');
  if (failures.length) {
    console.log('\nFAILURES:');
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  }
  console.log('All assertions passed.');
})();
