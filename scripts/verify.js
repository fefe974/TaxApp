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
  check('the score is a live region', a11y.live);
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

  // A hint has to be dismissable, including once it is at its last level —
  // where the button is otherwise disabled and the note would be permanent.
  const hintState = () => ws.evaluate(() => ({
    note: !!document.querySelector('[data-note="1"] .ws-note'),
    text: (document.querySelector('[data-note="1"] .ws-note') || {}).textContent || '',
    label: document.querySelector('[data-hint="1"]').textContent.trim(),
    disabled: document.querySelector('[data-hint="1"]').disabled,
    closer: !!document.querySelector('[data-note="1"] [data-hclose]')
  }));
  const atMax = await hintState();
  check('an open hint carries a close control', atMax.note && atMax.closer);
  await ws.click('[data-hclose="1"]');
  await ws.waitForTimeout(120);
  const closed = await hintState();
  check('closing a hint puts it away and re-enables the button',
    !closed.note && closed.label === 'Show hint' && !closed.disabled, JSON.stringify(closed));
  await ws.click('[data-hint="1"]');
  await ws.waitForTimeout(120);
  const reopened = await hintState();
  check('re-opening brings back the level already reached, not the first one',
    reopened.note && reopened.text === atMax.text && reopened.disabled,
    reopened.text.slice(0, 40));
  await ws.click('[data-hclose="1"]');
  await ws.waitForTimeout(120);

  // Work survives a reload.
  await ws.reload();
  await ws.waitForTimeout(500);
  const restored = await ws.evaluate(() => ({
    solving: document.getElementById('pane-solve').classList.contains('on'),
    cash: (document.querySelector('[data-cell="0.cash"]') || {}).value,
    minus: (document.querySelector('[data-cell="1.cash"]') || {}).value,
    hint: !!document.querySelector('[data-note="1"] .ws-note'),
    hintLabel: document.querySelector('[data-hint="1"]').textContent.trim()
  }));
  check('the working paper reopens with its cells intact',
    restored.solving && restored.cash === '10000' && restored.minus === '-800',
    JSON.stringify(restored));
  check('a hint that was closed stays closed across a reload',
    !restored.hint && restored.hintLabel === 'Show hint', JSON.stringify(restored));

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
  // Module 2.1's reference had the same hole: it was the finished summary.
  await ws.click('#tab-table');
  await ws.waitForTimeout(400);
  const ref1 = await ws.evaluate(() => {
    const slot = document.getElementById('table-slot');
    const text = slot.textContent.replace(/\s+/g, ' ');
    const t = totalsUpTo(999);
    // Same rule: a column fed by one transaction just repeats its amount.
    const answers = COLS.filter(c => t[c.k] && LEDGER.filter(r => r[c.k]).length > 1)
      .map(c => t[c.k].toLocaleString('en-US'))
      .concat([assetsOf(t).toLocaleString('en-US')]);
    return {
      leaked: [...new Set(answers.filter(v => text.indexOf(v) !== -1))],
      tables: slot.querySelectorAll('table.led, table.wp').length,
      sources: slot.querySelectorAll('.src-row').length
    };
  });
  check("module 2.1's reference carries no column total either",
    ref1.leaked.length === 0, 'leaked: ' + ref1.leaked.join(', '));
  check('and no completed summary table',
    ref1.tables === 0 && ref1.sources === 9, `tables=${ref1.tables} sources=${ref1.sources}`);
  await ws.click('#tab-solve');
  await ws.waitForTimeout(300);

  check('no working-paper console or page errors', wsErrors.length === 0, wsErrors.slice(0, 3).join(' | '));
  await ws.close();
  // ---------------------------------------------------------------
  console.log('\nWHAT 2.1 ASKS FOR');
  // ---------------------------------------------------------------
  // LO 2.1 prints one instruction. The five reported figures are this app's
  // own addition — useful, but a learner has to be able to tell which is
  // which, or they cannot tell what the problem would actually ask them.
  const w = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const wErr = [];
  w.on('pageerror', e => wErr.push('pageerror: ' + e.message));
  w.on('console', m => { if (m.type() === 'error') wErr.push('console: ' + m.text()); });
  await w.goto(FILE);
  await w.evaluate(() => localStorage.clear());
  await w.goto(FILE + '#lo21');
  await w.waitForTimeout(400);
  await w.click('#tab-solve');
  await w.waitForTimeout(400);

  const PRINTED = 'Prepare a tabular summary of the effects of these transactions on the accounting equation.';

  const instr = await w.evaluate(() => {
    const rows = [...document.querySelectorAll('#solve .instr-row')];
    return {
      count: rows.length,
      texts: rows.map(r => r.querySelector('.instr-t').textContent.trim()),
      keys: rows.map(r => r.querySelector('.instr-k').textContent.trim()),
      caps: rows.map(r => r.querySelector('.instr-n').textContent.trim()),
      extra: rows.map(r => r.classList.contains('extra')),
      sections: [...document.querySelectorAll('#solve .ws-sect')].map(e => e.textContent.trim())
    };
  });
  check('2.1 states the problem\'s printed instruction verbatim',
    instr.texts[0] === PRINTED, instr.texts[0]);
  check('the tabular summary carries all nine marks of that instruction',
    instr.caps[0] === '0/9', instr.caps[0]);
  check('the five reported figures are marked as beyond the problem, not as an instruction',
    instr.count === 2 && instr.extra[0] === false && instr.extra[1] === true &&
    instr.keys[1] === '+' && /Beyond the problem/i.test(instr.texts[1]),
    JSON.stringify({ keys: instr.keys, extra: instr.extra }));
  check('and they are worth their own five marks, kept apart from the instruction',
    instr.caps[1] === '0/5', instr.caps[1]);
  check('the section headings say the same thing the panel does',
    instr.sections.some(x => /^a . The tabular summary/.test(x)) &&
    instr.sections.some(x => /Beyond the problem/.test(x)),
    instr.sections.join(' | '));

  // The two halves have to move independently, or the split is cosmetic.
  await w.fill('[data-cell="0.cash"]', '10000');
  await w.fill('[data-cell="0.cs"]', '10000');
  await w.waitForTimeout(250);
  const afterRow = await w.evaluate(() =>
    [...document.querySelectorAll('#solve .instr-n')].map(e => e.textContent.trim()));
  check('a correct summary line advances the printed instruction and nothing else',
    afterRow[0] === '1/9' && afterRow[1] === '0/5', afterRow.join(' '));

  await w.fill('[data-fld="ni"]', '1800');
  await w.waitForTimeout(250);
  const afterFld = await w.evaluate(() =>
    [...document.querySelectorAll('#solve .instr-n')].map(e => e.textContent.trim()));
  check('a reported figure advances only the beyond-the-problem line',
    afterFld[0] === '1/9' && afterFld[1] === '1/5', afterFld.join(' '));

  // Reported figures are typed straight into fields, which do not go through
  // refreshWp — the panel went stale on exactly the half it tracks.
  check('the panel tracks figures typed into fields, not just grid cells',
    afterFld[1] === '1/5', afterFld[1]);

  const card = await w.evaluate(() => {
    const m = MODULES[0];
    return { sub: m.sub, blurb: m.blurb };
  });
  check('the module card does not claim the problem asks for financial statements',
    !/turn the totals into three financial statements/.test(card.blurb), card.blurb);
  check('and it counts the problem\'s seven transactions, not the nine lines they fill',
    /[Ss]even/.test(card.sub) && /[Ss]even/.test(card.blurb), card.sub + ' | ' + card.blurb);

  check('no console or page errors across module 2.1\'s worksheet', wErr.length === 0, wErr.slice(0, 3).join(' | '));
  await w.close();

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

  // The 2.2 worksheet follows the comprehensive problem's own instructions:
  // (a) journalize, (b) post to the ledger accounts, (c) prepare a trial
  // balance. All three are the learner's work.
  await k.goto(FILE + '#lo22');
  await k.waitForTimeout(400);
  await k.click('#tab-solve');
  await k.waitForTimeout(400);

  const ws2 = await k.evaluate(() => ({
    instr: [...document.querySelectorAll('.instr-row')].map(r => ({
      k: r.querySelector('.instr-k').textContent.trim(),
      t: r.querySelector('.instr-t').textContent.trim(),
      n: r.querySelector('.instr-n').textContent.trim()
    })),
    vouchers: document.querySelectorAll('.doc-je').length,
    chips: document.querySelectorAll('[data-vgo]').length,
    pager: document.querySelector('.pager-now').textContent.replace(/\s+/g, ' ').trim(),
    lines: document.querySelectorAll('[data-a2]').length,
    tbRows: document.querySelectorAll('[data-tbrow]').length,
    ledger: document.querySelectorAll('[data-acct]').length,
    numbered: [...document.querySelector('[data-a2="0.0"]').options].slice(1)
      .every(o => /^\d{3}\s/.test(o.textContent.trim())),
    score: document.getElementById('ws-score').textContent,
    x: (() => { const s = document.querySelector('#pane-solve .scroll'); return s.scrollWidth - s.clientWidth; })()
  }));
  check('the three instructions of the problem are stated and tracked',
    ws2.instr.length === 3 &&
    /Journalize the July transactions/.test(ws2.instr[0].t) &&
    /Post to the ledger accounts/.test(ws2.instr[1].t) &&
    /Prepare a trial balance at July 31/.test(ws2.instr[2].t),
    ws2.instr.map(i => i.k + i.t).join(' | '));
  check('each instruction carries its own progress, all starting at zero',
    ws2.instr.map(i => i.n).join(' ') === '0/11 0/11 0/13',
    ws2.instr.map(i => i.n).join(' '));
  check('(a) shows one voucher at a time, not a stack of eleven',
    ws2.vouchers === 1 && ws2.lines === 2, `vouchers=${ws2.vouchers} lines=${ws2.lines}`);
  check('every voucher is reachable from the strip, starting on the first',
    ws2.chips === 11 && /JE-01\s*1 of 11/.test(ws2.pager), ws2.chips + ' | ' + ws2.pager);
  check('(b) starts with an empty ledger — nothing is posted for the learner',
    ws2.ledger === 0, 'accounts=' + ws2.ledger);
  check('(c) is a full trial balance form over the whole chart of accounts',
    ws2.tbRows === 16, 'rows=' + ws2.tbRows);
  check('accounts are addressed by number', ws2.numbered);
  check('the whole problem is worth 35 marks', /0 of 35/.test(ws2.score), ws2.score);
  check('the worksheet does not overflow at 390px', ws2.x <= 0, '+' + ws2.x);

  // Moving between vouchers, and posting carrying on to the next one still
  // waiting rather than leaving a finished voucher on screen.
  await k.click('[data-vnext]');
  await k.waitForTimeout(150);
  const paged = await k.evaluate(() => ({
    now: document.querySelector('.pager-now').textContent.replace(/\s+/g, ' ').trim(),
    open: document.querySelector('.doc-je').getAttribute('data-tx2'),
    count: document.querySelectorAll('.doc-je').length,
    current: document.querySelectorAll('[data-vgo][aria-current]').length
  }));
  check('Next moves to the following voucher and only it is on screen',
    /JE-02\s*2 of 11/.test(paged.now) && paged.open === '1' && paged.count === 1 && paged.current === 1,
    JSON.stringify(paged));
  await k.click('[data-vgo="4"]');
  await k.waitForTimeout(150);
  check('the strip jumps straight to any voucher',
    /JE-05\s*5 of 11/.test(await k.evaluate(() => document.querySelector('.pager-now').textContent.replace(/\s+/g, ' ').trim())));
  await k.click('[data-vgo="0"]');
  await k.waitForTimeout(150);

  // (a) Post is gated on balance, and only on balance.
  await k.selectOption('[data-a2="0.0"]', 'cash');
  await k.fill('[data-d2="0.0"]', '12000');
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
  await k.fill('[data-c2="0.1"]', '12000');
  await k.waitForTimeout(200);
  check('a balanced voucher becomes postable',
    !(await k.evaluate(() => document.querySelector('[data-post="0"]').disabled)));

  // (b) Posting is what puts amounts in the ledger, on the side the entry set.
  await k.click('[data-post="0"]');
  await k.waitForTimeout(300);
  const advanced = await k.evaluate(() => ({
    now: document.querySelector('.pager-now').textContent.replace(/\s+/g, ' ').trim(),
    chip0: document.querySelector('[data-vgo="0"]').className
  }));
  check('posting carries on to the next voucher still to be entered',
    /JE-02\s*2 of 11/.test(advanced.now) && /done/.test(advanced.chip0), JSON.stringify(advanced));
  await k.click('[data-vgo="0"]');
  await k.waitForTimeout(200);
  const led = await k.evaluate(() => {
    const boxes = [...document.querySelectorAll('[data-acct]')];
    const cash = document.querySelector('[data-acct="cash"]');
    return {
      accounts: boxes.map(b => b.getAttribute('data-acct')),
      cashDr: cash.querySelector('.ta-side.d').textContent.replace(/\s+/g, ' ').trim(),
      cashCr: cash.querySelector('.ta-side.c').textContent.trim(),
      balBlank: cash.querySelector('[data-bal="cash"]').value,
      instrB: document.querySelectorAll('.instr-n')[1].textContent.trim()
    };
  });
  check('posting puts the amounts into the ledger, and only the accounts used',
    led.accounts.join() === 'cash,cs', led.accounts.join());
  check('each amount lands on the side the voucher put it',
    /12,000/.test(led.cashDr) && led.cashCr === '', `dr=${led.cashDr} cr=${led.cashCr}`);
  check('the balance is left for the learner to foot',
    led.balBlank === '' && led.instrB === '0/11', led.balBlank + ' ' + led.instrB);

  // A balance that is right for the learner's own ledger points upstream.
  await k.fill('[data-bal="cash"]', '12000');
  await k.click('#btn-check');
  await k.waitForTimeout(250);
  const upstream = await k.evaluate(() => ({
    wrong: document.querySelector('[data-acct="cash"]').classList.contains('wrong'),
    note: (document.querySelector('[data-bnote="cash"]') || {}).textContent || ''
  }));
  check('a balance correct for an incomplete ledger is marked wrong',
    upstream.wrong);
  check('and the diagnosis points at the ledger rather than the arithmetic',
    /correct balance for your ledger/.test(upstream.note), upstream.note.trim().slice(0, 70));

  // The derived hints speak about the learner's own ledger.
  await k.click('[data-bhint="cash"]');
  await k.waitForTimeout(100);
  await k.click('[data-bhint="cash"]');
  await k.waitForTimeout(150);
  const bh = await k.evaluate(() => (document.querySelector('[data-bnote="cash"]') || {}).textContent || '');
  check('the balance hint quotes the learner\'s own footings',
    /debits of \$12,000/.test(bh) && /credits of \$0/.test(bh), bh.trim().slice(0, 90));

  // (c) A balance has to go in its normal column, and unused accounts blank.
  await k.fill('[data-tb="cash.c"]', '5410');            // right figure, wrong column
  await k.fill('[data-tb="swp.d"]', '0');                // an account with no balance
  await k.click('#btn-check');
  await k.waitForTimeout(250);
  const tb = await k.evaluate(() => ({
    cashWrong: document.querySelector('[data-tbrow="cash"]').classList.contains('wrong'),
    swpWrong: document.querySelector('[data-tbrow="swp"]').classList.contains('wrong')
  }));
  check('a balance in the wrong column is marked wrong', tb.cashWrong);
  check('an account with no balance must be left blank, not zeroed', tb.swpWrong);
  await k.fill('[data-tb="cash.c"]', '');
  await k.fill('[data-tb="swp.d"]', '');

  const th = await k.evaluate(async () => {
    document.querySelector('[data-thint="ap"]').click();
    document.querySelector('[data-thint="ap"]').click();
    return (document.querySelector('.tbf-note') || {}).textContent || '';
  });
  check('the trial balance hint names the account family and its normal side',
    /Liability/.test(th) && /credit/.test(th), th.trim().slice(0, 90));

  // Every hint surface in 2.2 closes too: vouchers, ledger balances and
  // trial balance rows. Come back to a voucher first — posting advances the
  // pager, so voucher 0 is no longer the one on screen.
  await k.click('[data-vgo="0"]');
  await k.waitForTimeout(150);
  await k.click('[data-hint2="0"]');
  await k.waitForTimeout(150);
  const closable = await k.evaluate(() => {
    const shut = sel => {
      const x = document.querySelector(sel + ' [data-hclose]') ||
                document.querySelector('[data-hclose="' + sel + '"]');
      if (x) x.click();
    };
    const before = {
      voucher: !!document.querySelector('[data-note2="0"] .ws-note'),
      balance: !!document.querySelector('[data-bnote="cash"] .ws-note'),
      tbrow: !!document.querySelector('.tbf-note .ws-note')
    };
    document.querySelectorAll('[data-hclose]').forEach(b => b.click());
    return {
      before,
      after: {
        voucher: !!document.querySelector('[data-note2="0"] .ws-note'),
        balance: !!document.querySelector('[data-bnote="cash"] .ws-note'),
        tbrow: !!document.querySelector('.tbf-note .ws-note')
      },
      // The icon-only buttons stop showing their open state.
      lit: document.querySelectorAll('#solve .ws-hint.sm.on').length
    };
  });
  check('every kind of hint in 2.2 can be closed',
    closable.before.balance && closable.before.tbrow &&
    !closable.after.voucher && !closable.after.balance && !closable.after.tbrow &&
    closable.lit === 0, JSON.stringify(closable));

  // Work the whole problem: journalize, post, foot, and write the trial balance.
  const plan2 = await k.evaluate(() => JOURNAL.map((j, ji) => ({
    ji, lines: j.lines.map(l => ({ k: l[0], col: l[1] ? 'd' : 'c', n: l[1] || l[2] }))
  })));
  for (const e of plan2) {
    await k.click(`[data-vgo="${e.ji}"]`);
    await k.waitForTimeout(50);
    const locked = await k.evaluate(ji => !!document.querySelector('[data-unpost="' + ji + '"]'), e.ji);
    if (locked) { await k.click(`[data-unpost="${e.ji}"]`); await k.waitForTimeout(50); }
    for (let i = 0; i < e.lines.length; i++) {
      await k.selectOption(`[data-a2="${e.ji}.${i}"]`, e.lines[i].k);
      await k.fill(`[data-d2="${e.ji}.${i}"]`, '');
      await k.fill(`[data-c2="${e.ji}.${i}"]`, '');
      await k.fill(`[data-${e.lines[i].col}2="${e.ji}.${i}"]`, String(e.lines[i].n));
    }
    await k.click(`[data-post="${e.ji}"]`);
    await k.waitForTimeout(30);
  }
  const key = await k.evaluate(() => {
    const f = postedThrough(999);
    return {
      bals: ACCT.filter(a => balOf(f, a.k)).map(a => ({ k: a.k, v: balOf(f, a.k), col: a.up === 'D' ? 'd' : 'c' })),
      total: trialTotals(f).dr
    };
  });
  for (const b of key.bals) await k.fill(`[data-bal="${b.k}"]`, String(b.v));
  for (const b of key.bals) await k.fill(`[data-tb="${b.k}.${b.col}"]`, String(b.v));
  await k.fill('[data-tbt="d"]', String(key.total));
  await k.fill('[data-tbt="c"]', String(key.total));
  await k.waitForTimeout(200);
  const proof = await k.evaluate(() => document.getElementById('tb-proof').textContent.replace(/\s+/g, ' ').trim());
  check('the learner\'s own trial balance columns foot and agree',
    /agree at \$23,600/.test(proof), proof);

  await k.click('#btn-check');
  await k.waitForTimeout(300);
  const done2 = await k.evaluate(() => ({
    score: document.getElementById('ws-score').textContent,
    instr: [...document.querySelectorAll('.instr-n')].map(e => e.textContent.trim()),
    allDone: document.querySelectorAll('.instr-row.done').length,
    bad: document.querySelectorAll('.doc-je.graded-bad, .ta-box.wrong, .tbf-row.wrong').length,
    posted: document.querySelectorAll('[data-vgo].done').length
  }));
  check('working the problem through scores 35 of 35', /35 of 35/.test(done2.score), done2.score);
  check('all three instructions read as complete',
    done2.instr.join(' ') === '11/11 11/11 13/13' && done2.allDone === 3,
    done2.instr.join(' ') + ' done=' + done2.allDone);
  check('nothing is left flagged and every voucher is posted',
    done2.bad === 0 && done2.posted === 11, `bad=${done2.bad} posted=${done2.posted}`);

  const l2 = await k.evaluate(() => {
    const small = [], unnamed = [];
    document.querySelectorAll('#solve button').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && (r.height < 44 || r.width < 44)) small.push(el.className);
      if (!((el.getAttribute('aria-label') || '') + el.textContent.trim())) unnamed.push(el.className);
    });
    const noLabel = [...document.querySelectorAll('#solve input, #solve select')]
      .filter(e => !e.getAttribute('aria-label') && !(e.labels && e.labels.length)).length;
    return { small, unnamed, noLabel, h1: document.querySelectorAll('h1').length };
  });
  // The Reference tab sits one tap from the worksheet, so it must not carry
  // any figure the learner is being asked to produce.
  await k.click('#tab-table');
  await k.waitForTimeout(400);
  const ref2 = await k.evaluate(() => {
    const slot = document.getElementById('table-slot');
    const text = slot.textContent.replace(/\s+/g, ' ');
    const key = postedThrough(999);
    // An account touched by a single transaction has a balance equal to a
    // figure the problem already states, so only balances that have to be
    // worked out count as given away.
    const answers = ACCT.filter(a => balOf(key, a.k) && key[a.k].lines.length > 1)
      .map(a => balOf(key, a.k).toLocaleString('en-US'))
      .concat([trialTotals(key).dr.toLocaleString('en-US')]);
    return {
      leaked: [...new Set(answers.filter(v => text.indexOf(v) !== -1))],
      worked: slot.querySelectorAll('.je, .tb, .tbf, .ta').length,
      accounts: slot.querySelectorAll('.coa-row').length,
      sources: slot.querySelectorAll('.src-row').length,
      label: document.getElementById('tab-table').textContent.trim()
    };
  });
  check('the reference carries no balance and no trial balance figure',
    ref2.leaked.length === 0, 'leaked: ' + ref2.leaked.join(', '));
  check('and no worked journal, ledger or trial balance at all',
    ref2.worked === 0, 'found ' + ref2.worked + ' worked artefacts');
  check('what it does carry is the chart of accounts and the source documents',
    ref2.accounts === 16 && ref2.sources === 11 && /Reference/.test(ref2.label),
    `accounts=${ref2.accounts} sources=${ref2.sources} label=${ref2.label}`);
  await k.click('#tab-solve');
  await k.waitForTimeout(300);

  check('no worksheet control is under 44px', l2.small.length === 0, l2.small.join(','));
  check('every worksheet control has an accessible name',
    l2.unnamed.length === 0 && l2.noLabel === 0, l2.unnamed.join(',') + ' unlabelled=' + l2.noLabel);
  check('exactly one h1 on the worksheet', l2.h1 === 1, 'found ' + l2.h1);

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
  check('the switcher lists all five modules and marks the open one',
    sheet.open && sheet.cards === 5 && sheet.current === 1, JSON.stringify(sheet));
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
  console.log('\nMODULE 2.3 — ADJUSTING ENTRIES');
  // ---------------------------------------------------------------
  const j = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const jErr = [];
  j.on('pageerror', e => jErr.push('pageerror: ' + e.message));
  j.on('console', m => { if (m.type() === 'error') jErr.push('console: ' + m.text()); });
  await j.goto(FILE);
  await j.evaluate(() => localStorage.clear());
  await j.goto(FILE + '#lo23');
  await j.waitForTimeout(500);

  // Arithmetic first. ADJ is the only place a 2.3 figure is written down, so
  // if it does not hold together nothing derived from it can be trusted.
  const adj = await j.evaluate(() => {
    const bad = [];
    ADJ.forEach(a => {
      if (adjDebits(a) !== adjCredits(a)) bad.push(a.id + ' Dr ' + adjDebits(a) + ' Cr ' + adjCredits(a));
      a.lines.forEach(l => {
        if (!acct3(l[0])) bad.push(a.id + ' posts to unknown account ' + l[0]);
        if (l[1] && l[2]) bad.push(a.id + ' has a line that is both a debit and a credit');
      });
    });
    const cash = ADJ.filter(a => a.lines.some(l => l[0] === 'cash')).map(a => a.id);
    const isCount = ADJ.map(a => ({
      id: a.id,
      n: a.lines.filter(l => acct3(l[0]).stmt === 'I').length
    })).filter(x => x.n !== 1);
    const after = adjustedThrough(999);
    const t = tbTotals3(after);
    const u = tbTotals3(UNADJ);
    return {
      bad, cash, isCount,
      dr: t.d, cr: t.c, udr: u.d, ucr: u.c,
      after,
      unadj: UNADJ,
      entries: ENTRIES3.length, reports: REPORTS3.length, adjs: ADJ.length,
      // What module 2.2 actually produced, so 2.3's starting point can be
      // checked against it rather than against a retyped copy.
      from22: (function () {
        const full = postedThrough(999);
        const out = {};
        ACCT.forEach(a => { out[a.k] = balOf(full, a.k); });
        return out;
      })()
    };
  });

  check('every adjusting entry has equal debits and credits and real accounts',
    adj.bad.length === 0, adj.bad.join('; '));
  check('no adjusting entry touches Cash', adj.cash.length === 0, adj.cash.join(','));
  check('every adjusting entry changes exactly one income statement account',
    adj.isCount.length === 0, adj.isCount.map(x => x.id + ' touches ' + x.n).join(', '));
  check('the unadjusted trial balance 2.3 starts from is the one 2.2 produced',
    Object.keys(adj.from22).every(k => (adj.unadj[k] || 0) === adj.from22[k]),
    Object.keys(adj.from22).filter(k => (adj.unadj[k] || 0) !== adj.from22[k])
      .map(k => k + ' ' + adj.unadj[k] + ' vs ' + adj.from22[k]).join(', '));
  check('the unadjusted columns both total 23,600', adj.udr === 23600 && adj.ucr === 23600,
    adj.udr + ' / ' + adj.ucr);
  check('the adjusted columns both total 25,880', adj.dr === 25880 && adj.cr === 25880,
    adj.dr + ' / ' + adj.cr);

  const WANT3 = { cash: 5410, ar: 6300, sup: 320, ppi: 1650, eqp: 8000, adep: 180,
                  ap: 5400, swp: 400, cs: 12000, div: 600, rev: 7900, mre: 290,
                  supx: 580, depx: 180, insx: 150, swx: 2400 };
  const wrong3 = Object.keys(WANT3).filter(a => adj.after[a] !== WANT3[a]);
  check('every adjusted balance matches the textbook solution', wrong3.length === 0,
    wrong3.map(a => a + ' ' + adj.after[a] + ' vs ' + WANT3[a]).join(', '));
  check('5 adjustments have 5 explanations and 2 reports',
    adj.adjs === 5 && adj.entries === 5 && adj.reports === 2,
    adj.adjs + '/' + adj.entries + '/' + adj.reports);

  const jDash = await j.evaluate(() => {
    const sc = document.querySelector('#pane-guide .scroll');
    return {
      cards: document.querySelectorAll('[data-open]').length,
      x: sc.scrollWidth - sc.clientWidth,
      d: document.documentElement.scrollWidth - window.innerWidth
    };
  });
  check('the 2.3 dashboard lists 5 adjustments and 2 reports', jDash.cards === 7, 'cards=' + jDash.cards);
  check('the 2.3 dashboard does not overflow at 390px', jDash.x <= 0 && jDash.d <= 0, `+${jDash.x} / +${jDash.d}`);

  // The timeline is the illustration the whole module rests on. It has to
  // put the cash before the benefit on a deferral and after it on an accrual,
  // and it has to say which is which.
  // timeline() lives inside the shell closure, so the assertion reads the
  // rendered screens rather than calling it.
  const tl = [];
  for (let i = 0; i < 5; i++) {
    await j.goto(FILE + '#lo23');
    await j.waitForTimeout(120);
    await j.evaluate(n => document.querySelector('[data-open="' + n + '"]').click(), i);
    await j.waitForTimeout(200);
    tl.push(await j.evaluate(n => {
      const c = document.querySelector('.tl-mark.cash'), u = document.querySelector('.tl-mark.use');
      const v = document.querySelector('.tl-verdict b');
      return {
        id: ADJ[n].id, kind: ADJ[n].kind,
        cash: c ? parseFloat(c.style.left) : NaN,
        use: u ? parseFloat(u.style.left) : NaN,
        verdict: v ? v.textContent : ''
      };
    }, i));
  }
  check('a deferral puts the cash before the benefit, an accrual after it',
    tl.every(x => x.kind === 'deferral' ? x.cash < x.use : x.cash > x.use),
    tl.map(x => x.id + ' ' + x.kind + ' ' + x.cash + '/' + x.use).join(', '));
  // Reading the family back out of a.kind would make the check agree with
  // itself. Derive it from what the entry actually does: a deferral takes
  // the cost out of an asset the cash already bought; an accrual creates
  // the claim or the debt for the first time.
  const fam = await j.evaluate(() => ADJ.map(a => {
    const bs = a.lines.filter(l => acct3(l[0]).stmt === 'B')[0];
    const A = acct3(bs[0]), credited = !!bs[2];
    return {
      id: a.id, kind: a.kind,
      deferral: credited && (A.fam === 'Asset' || A.fam === 'Contra asset'),
      accrual: (!credited && A.fam === 'Asset') || (credited && A.fam === 'Liability')
    };
  }));
  check('each adjustment is filed as the kind its own entry makes it',
    fam.every(x => x.deferral !== x.accrual && x.kind === (x.deferral ? 'deferral' : 'accrual')),
    fam.filter(x => x.kind !== (x.deferral ? 'deferral' : 'accrual')).map(x => x.id + ' says ' + x.kind).join(', '));

  check('the timeline names the family it is showing',
    tl.every(x => x.verdict === (x.kind === 'deferral' ? 'Deferral' : 'Accrual')),
    tl.map(x => x.id + ':' + x.verdict).join(', '));

  // Walk all 7 screens at the narrowest supported width.
  await j.setViewportSize({ width: 320, height: 800 });
  let jBad = [];
  for (let i = 0; i < 7; i++) {
    await j.goto(FILE + '#lo23');
    await j.waitForTimeout(120);
    await j.evaluate(n => document.querySelector('[data-open="' + n + '"]').click(), i);
    await j.waitForTimeout(220);
    const o = await j.evaluate(() => {
      const sc = document.querySelector('#pane-guide .scroll');
      // Overflow to the left is not scrollable, so a timeline label hanging
      // out of its card is invisible to scrollWidth. Measure it directly.
      const spill = [];
      const tl = document.querySelector('.tl');
      if (tl) {
        const card = tl.closest('.viz').getBoundingClientRect();
        document.querySelectorAll('.tl-mark').forEach(e => {
          const r = e.getBoundingClientRect();
          if (r.left < card.left || r.right > card.right) spill.push(Math.round(r.left) + '..' + Math.round(r.right));
        });
      }
      return {
        d: document.documentElement.scrollWidth - window.innerWidth,
        p: sc.scrollWidth - sc.clientWidth,
        spill: spill,
        h1: (document.querySelector('#guide h1') || {}).textContent,
        viz: document.querySelectorAll('#guide .viz').length
      };
    });
    if (o.d > 0 || o.p > 0) jBad.push('screen ' + i + ' overflows by ' + o.d + '/' + o.p);
    if (o.spill.length) jBad.push('screen ' + i + ' has a timeline label outside its card at ' + o.spill.join(' and '));
    if (!o.h1) jBad.push('screen ' + i + ' has no heading');
    if (!o.viz) jBad.push('screen ' + i + ' has no illustration');
  }
  check('all 7 screens fit 320px, labels stay in their cards, and each has a heading and an illustration',
    jBad.length === 0, jBad.join('; '));
  await j.setViewportSize({ width: 390, height: 900 });

  // The Reference is source material, not the answer key: it may print the
  // unadjusted trial balance and the five facts, but no adjusted figure.
  await j.goto(FILE + '#lo23');
  await j.waitForTimeout(300);
  await j.click('#tab-table');
  await j.waitForTimeout(300);
  const refText = await j.evaluate(() => document.getElementById('table-slot').textContent);
  const leaked = ['6,300', '7,900', '2,400', '1,650', '25,880'].filter(v => refText.indexOf(v) !== -1);
  check('the 2.3 Reference gives away no adjusted balance', leaked.length === 0, leaked.join(', '));
  check('the 2.3 Reference does print the given unadjusted trial balance',
    refText.indexOf('23,600') !== -1 && /Unadjusted trial balance/.test(refText));

  // ---- the worksheet ----
  await j.click('#tab-solve');
  await j.waitForTimeout(400);

  const jSolve = await j.evaluate(() => ({
    score: document.querySelector('#ws-score b').textContent,
    instr: [...document.querySelectorAll('.instr-row .instr-t')].map(e => e.textContent),
    chips: document.querySelectorAll('[data-v3]').length,
    shown: document.querySelectorAll('[data-tx3]').length,
    rows: document.querySelectorAll('.wp-row').length,
    h1: !!document.querySelector('#solve h1'),
    unlabelled: [...document.querySelectorAll('#solve input, #solve select')]
      .filter(e => !e.getAttribute('aria-label') && !e.id).length
  }));
  check('the 2.3 worksheet asks for both printed instructions',
    jSolve.instr.length === 2 && /Journalize/.test(jSolve.instr[0]) && /adjusted trial balance/.test(jSolve.instr[1]),
    jSolve.instr.join(' | '));
  check('the 2.3 worksheet is scored out of 23 (5 entries + 16 balances + 2 totals)',
    jSolve.score === '0 of 23', jSolve.score);
  check('the 2.3 worksheet shows one adjustment at a time out of five',
    jSolve.chips === 5 && jSolve.shown === 1, jSolve.chips + ' chips, ' + jSolve.shown + ' shown');
  check('the 2.3 worksheet extends all 16 trial balance rows', jSolve.rows === 16, String(jSolve.rows));
  check('the 2.3 worksheet keeps a heading and labels every field',
    jSolve.h1 && jSolve.unlabelled === 0, 'unlabelled=' + jSolve.unlabelled);

  // Posting is refused until the entry is both complete and balanced. The
  // two are separate gates, so they need separate tests: a half-filled entry
  // is blocked for being half-filled whatever the amounts say.
  await j.selectOption('[data-a3="0.0"]', 'ar');
  await j.fill('[data-d3="0.0"]', '1700');
  await j.waitForTimeout(150);
  check('a half-entered adjustment cannot be posted',
    await j.evaluate(() => document.querySelector('[data-post3]').disabled));
  await j.selectOption('[data-a3="0.1"]', 'rev');
  await j.fill('[data-c3="0.1"]', '1600');
  await j.waitForTimeout(200);
  check('a complete but unbalanced adjustment cannot be posted',
    await j.evaluate(() => document.querySelector('[data-post3]').disabled));
  check('and it says how far out it is',
    /100/.test(await j.evaluate(() => document.querySelector('.gl-off.off').textContent)),
    await j.evaluate(() => document.querySelector('.gl-off').textContent));
  await j.fill('[data-c3="0.1"]', '1700');
  await j.waitForTimeout(200);
  check('a balanced adjustment can be posted',
    await j.evaluate(() => !document.querySelector('[data-post3]').disabled));

  await j.click('[data-post3="0"]');
  await j.waitForTimeout(300);
  const posted = await j.evaluate(() => ({
    pager: document.querySelector('.pager-now b').textContent,
    ar: [...document.querySelectorAll('[data-arow="ar"] td.ro.adj')].map(e => e.textContent),
    rev: [...document.querySelectorAll('[data-arow="rev"] td.ro.adj')].map(e => e.textContent),
    score: document.querySelector('#ws-score b').textContent
  }));
  check('posting an adjustment carries it onto both rows of the worksheet',
    posted.ar.join('') === '1,700' && posted.rev.join('') === '1,700',
    'ar=' + posted.ar.join('|') + ' rev=' + posted.rev.join('|'));
  check('posting advances to the next unposted adjustment', posted.pager === 'ADJ-2', posted.pager);
  check('a correct adjustment scores', posted.score === '1 of 23', posted.score);

  // The two diagnoses this module exists to teach.
  await j.click('[data-v3="1"]');
  await j.waitForTimeout(200);
  await j.selectOption('[data-a3="1.0"]', 'depx');
  await j.fill('[data-d3="1.0"]', '180');
  await j.selectOption('[data-a3="1.1"]', 'cash');
  await j.fill('[data-c3="1.1"]', '180');
  await j.waitForTimeout(150);
  await j.click('#btn-check');
  await j.waitForTimeout(300);
  check('crediting Cash is diagnosed as something an adjusting entry never does',
    /never touches Cash/.test(await j.evaluate(() => (document.querySelector('[data-note3="1"]') || {}).textContent || '')));

  await j.selectOption('[data-a3="1.1"]', 'insx');
  await j.waitForTimeout(150);
  await j.click('#btn-check');
  await j.waitForTimeout(300);
  check('two income statement accounts in one entry is diagnosed as such',
    /one income statement account and one balance sheet account/.test(
      await j.evaluate(() => (document.querySelector('[data-note3="1"]') || {}).textContent || '')));

  // Hints open, close, and reopen.
  await j.click('[data-hint3="1"]');
  await j.waitForTimeout(200);
  check('a 2.3 hint opens', await j.evaluate(() => !!document.querySelector('[data-note3="1"] .ws-note.tip')));
  await j.click('[data-hclose]');
  await j.waitForTimeout(200);
  check('a 2.3 hint closes', await j.evaluate(() => !document.querySelector('[data-note3="1"] .ws-note.tip')));
  await j.click('[data-hint3="1"]');
  await j.waitForTimeout(200);
  check('a closed 2.3 hint reopens', await j.evaluate(() => !!document.querySelector('[data-note3="1"] .ws-note.tip')));

  // Fill the whole thing correctly, one adjustment at a time.
  // Start part (a) again through the control the learner actually has.
  j.once('dialog', d => d.accept());
  await j.click('#ws-reset3');
  await j.waitForTimeout(250);
  const plan3 = await j.evaluate(() => ADJ.map(a => a.lines.map(l => [l[0], l[1], l[2]])));
  for (let i = 0; i < plan3.length; i++) {
    await j.click('[data-v3="' + i + '"]');
    await j.waitForTimeout(120);
    for (let li = 0; li < 2; li++) {
      const [k, d, c] = plan3[i][li];
      await j.selectOption('[data-a3="' + i + '.' + li + '"]', k);
      if (d) await j.fill('[data-d3="' + i + '.' + li + '"]', String(d));
      else await j.fill('[data-c3="' + i + '.' + li + '"]', String(c));
    }
    await j.waitForTimeout(120);
    await j.click('[data-post3="' + i + '"]');
    await j.waitForTimeout(160);
  }
  const partA = await j.evaluate(() => document.querySelector('#ws-score b').textContent);
  check('journalizing all five adjustments scores part (a) in full', partA === '5 of 23', partA);

  // Typed from the textbook, not from adjustedThrough(): filling the form
  // with the app's own answer would score full marks whatever it computed.
  for (const k of Object.keys(WANT3)) await j.fill('[data-after="' + k + '"]', String(WANT3[k]));
  await j.fill('[data-tot3="d"]', '25880');
  await j.fill('[data-tot3="c"]', '25880');
  await j.waitForTimeout(300);
  const full3 = await j.evaluate(() => ({
    score: document.querySelector('#ws-score b').textContent,
    btn: document.getElementById('btn-check').textContent,
    proof: document.querySelector('.sw-panel-bd .gl-off').className,
    instr: [...document.querySelectorAll('.instr-row')].map(r => r.className)
  }));
  check('a correct adjusted trial balance scores the worksheet in full',
    full3.score === '23 of 23', full3.score);
  check('a full 2.3 worksheet reports itself finished',
    /All correct/.test(full3.btn) && /ok/.test(full3.proof) && full3.instr.every(c => /done/.test(c)),
    full3.btn + ' | ' + full3.proof + ' | ' + full3.instr.join(','));

  // Reload: everything typed has to still be there.
  await j.reload();
  await j.waitForTimeout(500);
  await j.click('#tab-solve');
  await j.waitForTimeout(400);
  const kept = await j.evaluate(() => ({
    score: document.querySelector('#ws-score b').textContent,
    cell: document.querySelector('[data-after="ar"]').value,
    sel: document.querySelector('[data-a3="0.0"]') ? document.querySelector('[data-a3="0.0"]').value : null,
    posted: document.querySelectorAll('.vchip.done').length
  }));
  check('2.3 work survives a reload', kept.score === '23 of 23' && kept.cell === '6300' && kept.posted === 5,
    JSON.stringify(kept));

  check('no console or page errors across module 2.3', jErr.length === 0, jErr.slice(0, 3).join(' | '));
  await j.close();


  // ---------------------------------------------------------------
  console.log('\nTHE CAPSTONE — P2.12');
  // ---------------------------------------------------------------
  const cap = await browser.newPage({ viewport: { width: 390, height: 900 } });
  cap.on('pageerror', e => errors.push('p212: ' + e));
  cap.on('console', m => { if (m.type() === 'error') errors.push('p212 console: ' + m.text()); });
  await cap.goto(FILE + '#p212');
  await cap.waitForTimeout(500);

  // Arithmetic, read out of the module's own derivations.
  const sums = await cap.evaluate(() => ({
    tb: foot5(tb5), atb: foot5(atb5),
    adj: ADJ5.map(p => ({ id: p.id, n: adjAmount(p), moved: Math.abs(atb5(p.c) - tb5(p.c)) })),
    adjTotal: adjTotal(),
    rebuild: ACCT5.every(a => tb5(a.k) + (a.up === 'D' ? 1 : -1) * (adjCell(a.k, 'd') - adjCell(a.k, 'c')) === atb5(a.k)),
    ext: extTotals(), ni: netIncome5(),
    divTo: extCol('div'),
    bs: balanceSheet5(),
    close: CLOSE5.map(e => ({ id: e.id, d: e.lines.reduce((n, l) => n + l[1], 0), lines: e.lines.length,
      isum: e.lines.filter(l => l[0] === 'isum').length })),
    perm: permanent5().length, pctb: pctbTotals(), re: postClosing('re'),
    accts: ACCT5.length
  }));

  check('the capstone reproduces both trial balances the problem prints',
    sums.tb.d === 491700 && sums.tb.c === 491700 && sums.atb.d === 506500 && sums.atb.c === 506500,
    JSON.stringify([sums.tb, sums.atb]));
  check('the six adjustments are the difference between those two columns',
    sums.adj.length === 6 && sums.adj.every(a => a.n === a.moved) &&
    sums.adj.map(a => a.n).join() === '14400,28000,5800,2000,3000,6000',
    JSON.stringify(sums.adj));
  check('and they total 5,9200 across both columns'.replace('5,9200', '59,200'),
    sums.adjTotal === 59200, String(sums.adjTotal));
  check('the trial balance plus the adjustments rebuilds the adjusted column on every row',
    sums.rebuild === true);
  check('the income statement columns carry 247,000 against 280,500',
    sums.ext.id === 247000 && sums.ext.ic === 280500, JSON.stringify(sums.ext));
  check('the balance sheet columns carry 259,500 against 226,000',
    sums.ext.bd === 259500 && sums.ext.bc === 226000, JSON.stringify(sums.ext));
  check('net income of 33,500 is the gap in both pairs',
    sums.ni === 33500 && sums.ext.id + sums.ni === sums.ext.ic && sums.ext.bc + sums.ni === sums.ext.bd,
    String(sums.ni));
  check('dividends extends to the balance sheet, not the income statement',
    sums.divTo === 'bd', sums.divTo);
  check('the classified balance sheet balances at 203,500',
    sums.bs.totalAssets === 203500 && sums.bs.totalClaims === 203500, JSON.stringify([sums.bs.totalAssets, sums.bs.totalClaims]));
  check('with current assets 45,500, plant 158,000, current liabilities 34,300 and equity 129,200',
    sums.bs.currentAssets === 45500 && sums.bs.ppe === 158000 &&
    sums.bs.currentLiab === 34300 && sums.bs.equity === 129200,
    JSON.stringify([sums.bs.currentAssets, sums.bs.ppe, sums.bs.currentLiab, sums.bs.equity]));
  check('the mortgage splits 10,000 current and 40,000 long-term, and adds back to 50,000',
    sums.bs.mortCurrent === 10000 && sums.bs.longLiab === 40000 &&
    sums.bs.mortCurrent + sums.bs.longLiab === 50000, JSON.stringify(sums.bs));
  check('the expense closing entry credits all nine expenses in one compound entry',
    sums.close[1].lines === 10 && sums.close[1].d === 247000, JSON.stringify(sums.close[1]));
  check('and dividends closes to retained earnings without touching Income Summary',
    sums.close[3].isum === 0 && sums.close[3].d === 14000, JSON.stringify(sums.close[3]));
  check('thirteen permanent accounts survive, footing 245,500 with retained earnings at 21,500',
    sums.perm === 13 && sums.pctb.d === 245500 && sums.pctb.c === 245500 && sums.re === 21500,
    JSON.stringify([sums.perm, sums.pctb, sums.re]));

  // The briefing.
  const brief = await cap.evaluate(() => ({
    h1: document.querySelectorAll('#guide h1').length,
    cards: document.querySelectorAll('#guide .card-e').length,
    figs: document.querySelectorAll('#guide figure.viz').length,
    method: document.querySelectorAll('#guide .method-row').length,
    instr: [...document.querySelectorAll('#guide .instr-row .instr-t')].map(e => e.textContent),
    open: document.querySelectorAll('#guide [data-gotab="solve"]').length,
    text: document.getElementById('guide').textContent,
    wide: document.querySelector('#pane-guide .scroll').scrollWidth -
          document.querySelector('#pane-guide .scroll').clientWidth,
    prev: document.getElementById('btn-prev').hidden,
    next: document.getElementById('btn-next').hidden,
    rail: document.querySelectorAll('#rail i').length
  }));
  check('the capstone states the problem under one heading, and fits',
    brief.h1 === 1 && brief.instr.length === 5 && brief.wide <= 0,
    JSON.stringify([brief.h1, brief.instr.length, brief.wide]));
  // This is a problem, not a lesson. Nothing in the guide pane may teach.
  check('and it teaches nothing: no walkthrough cards, no explanatory figure, no method list',
    brief.cards === 0 && brief.figs === 0 && brief.method === 0,
    JSON.stringify([brief.cards, brief.figs, brief.method]));
  check('there is nothing to page through, and the pager and rail say so',
    brief.prev === true && brief.next === true && brief.rail === 0,
    JSON.stringify([brief.prev, brief.next, brief.rail]));
  check('the instructions are the ones the problem prints, verbatim',
    brief.instr[0] === 'Prepare a complete worksheet.' &&
    brief.instr[1] === 'Prepare a classified balance sheet. (Note: $10,000 of the mortgage payable is due for payment in the next fiscal year.)' &&
    brief.instr[2] === 'Journalize the adjusting entries using the worksheet as a basis.' &&
    brief.instr[3] === 'Journalize the closing entries using the worksheet as a basis.' &&
    brief.instr[4] === 'Prepare a post-closing trial balance.',
    JSON.stringify(brief.instr));
  check('and the dashboard opens the workbook', brief.open === 1);

  // A hash left over from when this module had screens must not strand anyone.
  await cap.goto(FILE + '#p212-sheet');
  await cap.waitForTimeout(320);
  const stale = await cap.evaluate(() => document.querySelector('#guide h1').textContent);
  await cap.goto(FILE + '#p212');
  await cap.waitForTimeout(300);
  check('a hash that names no screen lands on the problem rather than nothing',
    /Worksheet, Balance Sheet/.test(stale), stale.slice(0, 40));

  // A capstone that prints its own answers is not a capstone. These are the
  // figures that appear in neither column the problem hands over.
  const ANSWERS = ['33,500', '203,500', '245,500', '21,500', '247,000', '45,500',
                   '158,000', '34,300', '74,300', '129,200', '226,000', '259,500', '78,000', '59,200'];
  const leaked212 = [];
  ANSWERS.forEach(a => { if (brief.text.indexOf(a) !== -1) leaked212.push('problem statement: ' + a); });
  await cap.goto(FILE + '#p212');
  await cap.waitForTimeout(250);
  await cap.click('#tab-table');
  await cap.waitForTimeout(350);
  const ref = await cap.evaluate(() => ({
    rows: document.querySelectorAll('#table-slot .gw-row').length,
    tot: [...document.querySelectorAll('#table-slot .gw-tot .gw-amt')].map(e => e.textContent),
    text: document.getElementById('table-slot').textContent,
    note: /10,000/.test(document.getElementById('table-slot').textContent)
  }));
  ANSWERS.forEach(a => { if (ref.text.indexOf(a) !== -1) leaked212.push('reference: ' + a); });
  check('the problem statement and the Reference give away no figure the learner has to produce',
    leaked212.length === 0, leaked212.join(' | '));
  check('the Reference prints the given worksheet, all 24 rows, footing both ways',
    ref.rows === 24 && ref.tot.join() === '491,700,491,700,506,500,506,500', JSON.stringify(ref.tot));
  check('and carries the note about the mortgage', ref.note === true);

  // The workbook.
  await cap.click('#tab-solve');
  await cap.waitForTimeout(450);
  const wb = await cap.evaluate(() => ({
    tabs: [...document.querySelectorAll('.wbk-t')].map(e => e.textContent),
    score: document.querySelector('#ws-score b').textContent,
    rows: document.querySelectorAll('.xl-grid .xl-row').length,
    cells: document.querySelectorAll('.xl-row[data-xrow="cash"] .xl-c').length,
    given: document.querySelectorAll('.xl-row[data-xrow="cash"] .xl-c.given').length,
    inputs: document.querySelectorAll('.xl-row[data-xrow="cash"] input').length,
    ext: document.querySelectorAll('.xl-row[data-xrow="cash"] .xl-x').length,
    name: document.getElementById('xl-name').textContent
  }));
  check('the workbook has one sheet per instruction, lettered a to e',
    wb.tabs.length === 5 && wb.tabs.map(t => t.charAt(0)).join('') === 'abcde', JSON.stringify(wb.tabs));
  check('the whole problem is worth 71 marks', /of 71/.test(wb.score), wb.score);
  check('the worksheet is 24 account rows plus a header pair, a total and net income',
    wb.rows === 28, String(wb.rows));
  check('each row has ten amount columns: four given, two to type in, four to extend to',
    wb.cells === 10 && wb.given === 4 && wb.inputs === 2 && wb.ext === 4, JSON.stringify(wb));

  // The name box and formula bar.
  await cap.click('[data-ref5="F2"]');
  await cap.waitForTimeout(180);
  const fx = await cap.evaluate(() => ({
    name: document.getElementById('xl-name').textContent,
    fx: document.getElementById('xl-fx-t').textContent
  }));
  check('selecting a cell names it and says where its figure came from',
    fx.name === 'F2' && /Adjusted Trial Balance Dr/.test(fx.fx) && /given/.test(fx.fx),
    JSON.stringify(fx));

  // Extending.
  await cap.click('[data-ext5="sup.bd"]');
  await cap.waitForTimeout(300);
  const extended = await cap.evaluate(() => ({
    text: document.querySelector('[data-ext5="sup.bd"]').textContent,
    fx: document.getElementById('xl-fx-t').textContent,
    count: document.querySelector('.xl-legend b').textContent
  }));
  check('extending a row writes the adjusted balance into the cell, not the unadjusted one',
    extended.text === '4,200' && /=F2\b/.test(extended.fx) && extended.count === '1',
    JSON.stringify(extended));

  // Extending to the wrong column has to be possible, or the decision is fake.
  await cap.click('[data-ext5="rev.id"]');
  await cap.waitForTimeout(300);
  const wrongExt = await cap.evaluate(() => ({
    filled: document.querySelector('[data-ext5="rev.id"]').textContent,
    score: document.querySelector('#ws-score b').textContent
  }));
  check('extending to the wrong column is allowed, and scores nothing',
    wrongExt.filled === '280,500' && wrongExt.score === '1 of 71', JSON.stringify(wrongExt));
  await cap.click('[data-ext5="rev.id"]');
  await cap.waitForTimeout(250);

  // The adjustment columns foot themselves.
  await cap.fill('[data-adj5="supx.d"]', '14400');
  await cap.waitForTimeout(220);
  const half = await cap.evaluate(() => [...document.querySelectorAll('.xl-foot .xl-c.auto')].map(e => e.className + '|' + e.textContent));
  await cap.fill('[data-adj5="sup.c"]', '14400');
  await cap.waitForTimeout(250);
  const both = await cap.evaluate(() => [...document.querySelectorAll('.xl-foot .xl-c.auto')].map(e => e.className + '|' + e.textContent));
  check('the adjustment columns foot themselves and flag a one-sided entry',
    /off/.test(half[0]) && half[1] === 'xl-c auto off|' && /ok\|14,400/.test(both[0]) && /ok\|14,400/.test(both[1]),
    JSON.stringify([half, both]));

  // Net income in the wrong column.
  await cap.fill('[data-ni5="id"]', '33500');
  await cap.waitForTimeout(200);
  await cap.fill('[data-ni5="ic"]', '33500');
  await cap.waitForTimeout(250);
  const niBoth = await cap.evaluate(() => document.querySelector('#ws-score b').textContent);
  await cap.fill('[data-ni5="ic"]', '');
  await cap.waitForTimeout(250);
  const niRightScore = await cap.evaluate(() => document.querySelector('#ws-score b').textContent);
  check('net income hedged into both income statement columns scores nothing; the debit column alone scores',
    niBoth === '2 of 71' && niRightScore === '3 of 71', JSON.stringify([niBoth, niRightScore]));

  // Hints stay behind a button.
  const hintsShut = await cap.evaluate(() => ({
    buttons: document.querySelectorAll('.ws-hint').length,
    open: document.querySelectorAll('.ws-note.tip').length
  }));
  await cap.click('[data-hint5="a-ext"]');
  await cap.waitForTimeout(250);
  const hintOpen = await cap.evaluate(() => {
    const t = document.querySelector('[data-note5="a-ext"] .ws-note.tip');
    return { text: t ? t.textContent : '', closable: !!document.querySelector('[data-hclose="a-ext"]') };
  });
  check('worksheet hints stay behind a button until asked for, and can be put away',
    hintsShut.open === 0 && hintsShut.buttons === 3 && /one of the last four columns/.test(hintOpen.text) && hintOpen.closable,
    JSON.stringify([hintsShut, hintOpen.text.slice(0, 40)]));

  // Sheet b asks for the split the note describes.
  await cap.click('[data-sheet5="b"]');
  await cap.waitForTimeout(400);
  const sheetB = await cap.evaluate(() => ({
    fields: [...document.querySelectorAll('.bsf-field label')].map(e => e.textContent),
    deduction: [...document.querySelectorAll('.bsf-line')].some(e => /\(42,000\)/.test(e.textContent)),
    hints: document.querySelectorAll('.bsf-field .ws-hint').length
  }));
  check('the balance sheet asks for both halves of the mortgage and shows depreciation as a deduction',
    sheetB.fields.length === 10 &&
    sheetB.fields.some(f => /current portion/.test(f)) &&
    sheetB.fields.some(f => /long-term portion/.test(f)) &&
    sheetB.deduction && sheetB.hints === 10,
    JSON.stringify([sheetB.fields.length, sheetB.deduction, sheetB.hints]));

  // Adjusting entries in any order; the same one twice is caught.
  await cap.click('[data-sheet5="c"]');
  await cap.waitForTimeout(400);
  await cap.evaluate(() => {
    function pick(s, v) { const e = document.querySelector(s); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }
    function put(s, v) { const e = document.querySelector(s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }
    pick('[data-ja5="c.0.0"]', 'intx'); put('[data-jd5="c.0.0"]', '6000');
    pick('[data-ja5="c.0.1"]', 'intp'); put('[data-jc5="c.0.1"]', '6000');
  });
  await cap.waitForTimeout(300);
  const anyOrder = await cap.evaluate(() => document.querySelector('#ws-score b').textContent);
  check('any of the six adjustments may be journalized in any slot',
    anyOrder === '4 of 71', anyOrder);

  await cap.click('[data-j5="c.1"]');
  await cap.waitForTimeout(300);
  await cap.evaluate(() => {
    function pick(s, v) { const e = document.querySelector(s); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }
    function put(s, v) { const e = document.querySelector(s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }
    pick('[data-ja5="c.1.0"]', 'intx'); put('[data-jd5="c.1.0"]', '6000');
    pick('[data-ja5="c.1.1"]', 'intp'); put('[data-jc5="c.1.1"]', '6000');
  });
  await cap.waitForTimeout(250);
  await cap.click('#btn-check');
  await cap.waitForTimeout(400);
  const dupe = await cap.evaluate(() => {
    const n = document.querySelector('[data-note5="c1"] .ws-note.bad');
    return { text: n ? n.textContent : '', score: document.querySelector('#ws-score b').textContent };
  });
  check('journalizing the same adjustment twice is diagnosed and scored once',
    /same adjustment you entered in slot 1/.test(dupe.text) && dupe.score === '4 of 71', JSON.stringify(dupe));

  // The closing trap.
  await cap.click('[data-sheet5="d"]');
  await cap.waitForTimeout(400);
  await cap.click('[data-j5="d.3"]');
  await cap.waitForTimeout(300);
  await cap.evaluate(() => {
    function pick(s, v) { const e = document.querySelector(s); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }
    function put(s, v) { const e = document.querySelector(s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }
    pick('[data-ja5="d.3.0"]', 'isum'); put('[data-jd5="d.3.0"]', '14000');
    pick('[data-ja5="d.3.1"]', 'div'); put('[data-jc5="d.3.1"]', '14000');
  });
  await cap.waitForTimeout(250);
  await cap.click('#btn-check');
  await cap.waitForTimeout(400);
  const trap = await cap.evaluate(() => {
    const n = document.querySelector('[data-note5="d3"] .ws-note.bad');
    return n ? n.textContent : '';
  });
  check('closing dividends through Income Summary is diagnosed as such',
    /never pass through Income Summary/.test(trap), trap.slice(0, 60));

  // Working the whole problem through. Every answer is read from the module's
  // own derivations, so this cannot pass by agreeing with a typo.
  await cap.goto(FILE + '#p212');
  await cap.waitForTimeout(400);
  await cap.evaluate(() => {
    try { localStorage.removeItem('accounting.course.v4.work5'); } catch (e) {}
  });
  await cap.reload();
  await cap.waitForTimeout(500);
  await cap.click('#tab-solve');
  await cap.waitForTimeout(450);

  const fresh = await cap.evaluate(() => document.querySelector('#ws-score b').textContent);

  // a — adjustments, then every extension, then the totals and net income.
  await cap.evaluate(() => {
    function put(s, v) { const e = document.querySelector(s); if (!e) throw new Error('no ' + s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }
    ADJ5.forEach(p => { put('[data-adj5="' + p.d + '.d"]', adjAmount(p)); put('[data-adj5="' + p.c + '.c"]', adjAmount(p)); });
  });
  await cap.waitForTimeout(250);
  for (const k of await cap.evaluate(() => ACCT5.map(a => a.k))) {
    await cap.evaluate(key => {
      const want = extCol(key);
      const el = document.querySelector('[data-ext5="' + key + '.' + want + '"]');
      if (!el) throw new Error('no ext cell for ' + key);
      el.click();
    }, k);
  }
  await cap.waitForTimeout(300);
  await cap.evaluate(() => {
    function put(s, v) { const e = document.querySelector(s); if (!e) throw new Error('no ' + s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }
    const t = extTotals();
    put('[data-tot5="id"]', t.id); put('[data-tot5="ic"]', t.ic);
    put('[data-tot5="bd"]', t.bd); put('[data-tot5="bc"]', t.bc);
    put('[data-ni5="id"]', netIncome5()); put('[data-ni5="bc"]', netIncome5());
  });
  await cap.waitForTimeout(300);
  const partA212 = await cap.evaluate(() => ({
    score: document.querySelector('#ws-score b').textContent,
    row: [...document.querySelectorAll('.instr-row')][0].querySelector('.instr-n').textContent,
    proof: [...document.querySelectorAll('.gl-off')].map(e => e.className)
  }));
  check('a completed worksheet scores all 36 of instruction a and proves itself',
    partA212.row === '36/36' && partA212.proof.every(c => /ok/.test(c)), JSON.stringify(partA212));

  // b
  await cap.click('[data-sheet5="b"]');
  await cap.waitForTimeout(400);
  await cap.evaluate(() => {
    function put(s, v) { const e = document.querySelector(s); if (!e) throw new Error('no ' + s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }
    const b = balanceSheet5();
    put('[data-bs5="ca"]', b.currentAssets); put('[data-bs5="bv"]', b.bookValue);
    put('[data-bs5="ppe"]', b.ppe); put('[data-bs5="ta"]', b.totalAssets);
    put('[data-bs5="mc"]', b.mortCurrent); put('[data-bs5="cl"]', b.currentLiab);
    put('[data-bs5="ml"]', b.longLiab); put('[data-bs5="tl"]', b.totalLiab);
    put('[data-bs5="re"]', b.retained); put('[data-bs5="tc"]', b.totalClaims);
  });
  await cap.waitForTimeout(300);

  // c and d
  for (const kind of ['c', 'd']) {
    await cap.click('[data-sheet5="' + kind + '"]');
    await cap.waitForTimeout(350);
    const howMany = await cap.evaluate(k => (k === 'c' ? ADJE5 : CLOSE5).length, kind);
    for (let i = 0; i < howMany; i++) {
      await cap.click('[data-j5="' + kind + '.' + i + '"]');
      await cap.waitForTimeout(200);
      await cap.evaluate(([k, ei]) => {
        const e = (k === 'c' ? ADJE5 : CLOSE5)[ei];
        e.lines.forEach((l, li) => {
          const sel = document.querySelector('[data-ja5="' + k + '.' + ei + '.' + li + '"]');
          sel.value = l[0]; sel.dispatchEvent(new Event('change', { bubbles: true }));
          const amt = document.querySelector('[data-j' + (l[1] ? 'd' : 'c') + '5="' + k + '.' + ei + '.' + li + '"]');
          amt.value = l[1] || l[2]; amt.dispatchEvent(new Event('input', { bubbles: true }));
        });
      }, [kind, i]);
      await cap.waitForTimeout(120);
    }
  }
  await cap.waitForTimeout(250);

  // e
  await cap.click('[data-sheet5="e"]');
  await cap.waitForTimeout(400);
  await cap.evaluate(() => {
    function put(s, v) { const e = document.querySelector(s); if (!e) throw new Error('no ' + s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }
    permanent5().forEach(a => put('[data-tb5="' + a.k + '.' + (a.up === 'D' ? 'd' : 'c') + '"]', postClosing(a.k)));
    put('[data-ttot5="d"]', pctbTotals().d);
    put('[data-ttot5="c"]', pctbTotals().c);
  });
  await cap.waitForTimeout(350);

  const finished212 = await cap.evaluate(() => ({
    score: document.querySelector('#ws-score b').textContent,
    done: document.querySelector('#ws-score').classList.contains('done'),
    rows: [...document.querySelectorAll('.instr-row')].map(r => r.querySelector('.instr-n').textContent),
    tabs: [...document.querySelectorAll('.wbk-t')].map(t => t.classList.contains('done'))
  }));
  check('an empty workbook starts at nothing', fresh === '0 of 71', fresh);
  check('working the whole problem through scores 71 of 71',
    finished212.score === '71 of 71' && finished212.done === true, JSON.stringify(finished212.score));
  check('and every one of the five instructions reads as complete',
    finished212.rows.join(' ') === '36/36 10/10 6/6 4/4 15/15' && finished212.tabs.every(Boolean),
    JSON.stringify(finished212.rows));

  await cap.reload();
  await cap.waitForTimeout(600);
  const kept212 = await cap.evaluate(() => document.querySelector('#ws-score b').textContent);
  check('and the whole workbook survives a reload', kept212 === '71 of 71', kept212);

  const wide212 = [];
  for (const w of [320, 390]) {
    await cap.setViewportSize({ width: w, height: 800 });
    for (const sh of ['a', 'b', 'c', 'd', 'e']) {
      await cap.click('[data-sheet5="' + sh + '"]');
      await cap.waitForTimeout(280);
      const o = await cap.evaluate(() => {
        const s = document.querySelector('#pane-solve .scroll');
        return (document.documentElement.scrollWidth - window.innerWidth) + (s ? s.scrollWidth - s.clientWidth : 0);
      });
      if (o > 0) wide212.push(w + '/' + sh + ' by ' + o);
    }
  }
  check('no sheet of the workbook pushes the page sideways at 320 or 390',
    wide212.length === 0, wide212.join(' | '));

  await cap.close();


  // ---------------------------------------------------------------
  console.log('\nTHE LECTURES');
  // ---------------------------------------------------------------
  const lec = await browser.newPage({ viewport: { width: 390, height: 900 } });
  lec.on('pageerror', e => errors.push('lecture: ' + e));
  lec.on('console', m => { if (m.type() === 'error') errors.push('lecture console: ' + m.text()); });

  await lec.goto(FILE + '#lo21');
  await lec.waitForTimeout(400);
  const lecShape = await lec.evaluate(() => ({
    keys: Object.keys(LECTURES),
    p212: !!LECTURES.p212,
    /* every topic that builds on another names one that exists and comes before it */
    chain: Object.keys(LECTURES).map(k => {
      const t = LECTURES[k].topics, ids = t.map(x => x.id);
      return {
        k: k,
        n: t.length,
        firstFree: !t[0].builds,
        laterAllBuild: t.slice(1).every(x => !!x.builds),
        backwards: t.every((x, i) => !x.builds || ids.indexOf(x.builds) < i),
        known: t.every(x => !x.builds || ids.indexOf(x.builds) !== -1),
        steps: LECTURES[k].together.steps.length
      };
    })
  }));
  check('every learning objective has a lecture, and the problem module has none',
    lecShape.keys.sort().join() === 'lo21,lo22,lo23,lo24' && lecShape.p212 === false,
    JSON.stringify(lecShape.keys));
  check('each lecture opens with a topic that stands alone, and every later one builds on an earlier one',
    lecShape.chain.every(c => c.firstFree && c.laterAllBuild && c.known && c.backwards),
    JSON.stringify(lecShape.chain));
  check('and each ends by putting the topics back together as a sequence of steps',
    lecShape.chain.every(c => c.steps >= 4), JSON.stringify(lecShape.chain.map(c => c.steps)));

  const lecs = [];
  for (const m of ['lo21', 'lo22', 'lo23', 'lo24']) {
    await lec.goto(FILE + '#' + m);
    await lec.waitForTimeout(300);
    await lec.click('#tab-lecture');
    await lec.waitForTimeout(420);
    lecs.push(await lec.evaluate(mod => {
      const sc = document.querySelector('#pane-lecture .scroll');
      const bar = document.querySelector('.tabs-inner');
      const figs = [...document.querySelectorAll('#lecture figure.viz')];
      return {
        mod: mod,
        h1: document.querySelectorAll('#lecture h1').length,
        topics: document.querySelectorAll('#lecture .lec-topic').length,
        map: document.querySelectorAll('#lecture .lec-map a').length,
        heads: document.querySelectorAll('#lecture .lec-topic h2').length,
        builds: document.querySelectorAll('#lecture .lec-builds').length,
        rules: document.querySelectorAll('#lecture .lec-topic .ex-rule').length,
        figs: figs.length,
        capped: figs.filter(f => f.querySelector('figcaption')).length,
        claimed: figs.filter(f => f.querySelector('[role="img"][aria-label], .sr-only')).length,
        onward: document.querySelectorAll('#lecture [data-gotab="guide"]').length,
        words: document.getElementById('lecture').textContent.trim().split(/\s+/).length,
        money: (document.getElementById('lecture').textContent.match(/\$|\d{1,3},\d{3}/g) || []),
        wide: (document.documentElement.scrollWidth - window.innerWidth) + (sc.scrollWidth - sc.clientWidth),
        tabWide: bar.scrollWidth - bar.clientWidth,
        pager: document.getElementById('btn-prev').hidden && document.getElementById('btn-next').hidden,
        score: document.getElementById('ws-score').hidden
      };
    }, m));
  }
  check('every lecture has one heading, six topics, and a contents map that matches them',
    lecs.every(l => l.h1 === 1 && l.topics === 6 && l.map === 6 && l.heads === 6),
    JSON.stringify(lecs.map(l => [l.mod, l.h1, l.topics, l.map])));
  check('every topic states a rule, and five of the six say what they build on',
    lecs.every(l => l.rules === 6 && l.builds === 5),
    JSON.stringify(lecs.map(l => [l.mod, l.rules, l.builds])));
  check('every lecture illustrates at least three of its topics, each with a caption and a stated claim',
    lecs.every(l => l.figs >= 3 && l.capped === l.figs && l.claimed === l.figs),
    JSON.stringify(lecs.map(l => [l.mod, l.figs, l.capped, l.claimed])));
  /* A lecture is theory. The moment it prints a figure from the problem it has
     started doing the guide's job, and the worked example loses its point. */
  check('no lecture prints a money figure: the theory is separate from the problem',
    lecs.every(l => l.money.length === 0),
    JSON.stringify(lecs.map(l => [l.mod, l.money.slice(0, 3)])));
  check('and each is a short read rather than a chapter',
    lecs.every(l => l.words > 350 && l.words < 1200),
    JSON.stringify(lecs.map(l => [l.mod, l.words])));
  check('the lecture is one page: no pager and no score beneath it',
    lecs.every(l => l.pager && l.score), JSON.stringify(lecs.map(l => [l.mod, l.pager, l.score])));
  check('every lecture fits, and four tabs still fit the bar',
    lecs.every(l => l.wide <= 0 && l.tabWide <= 0),
    JSON.stringify(lecs.map(l => [l.mod, l.wide, l.tabWide])));
  check('and each one ends with the way through to the worked example',
    lecs.every(l => l.onward === 1), JSON.stringify(lecs.map(l => [l.mod, l.onward])));

  // The contents map is navigation, so it has to move focus like navigation.
  await lec.goto(FILE + '#lo23');
  await lec.waitForTimeout(300);
  await lec.click('#tab-lecture');
  await lec.waitForTimeout(400);
  await lec.click('[data-lec="four"]');
  await lec.waitForTimeout(650);
  const jumped = await lec.evaluate(() => ({
    focus: document.activeElement.id,
    seen: (() => {
      const r = document.getElementById('lec-four').getBoundingClientRect();
      return r.top > -20 && r.top < window.innerHeight;
    })()
  }));
  check('jumping from the contents map scrolls to the topic and takes focus with it',
    jumped.focus === 'lec-four' && jumped.seen, JSON.stringify(jumped));

  // 320px is where four tabs are most likely to give out.
  await lec.setViewportSize({ width: 320, height: 800 });
  await lec.goto(FILE + '#lo22');
  await lec.waitForTimeout(300);
  await lec.click('#tab-lecture');
  await lec.waitForTimeout(400);
  const narrow = await lec.evaluate(() => {
    const bar = document.querySelector('.tabs-inner');
    const sc = document.querySelector('#pane-lecture .scroll');
    return {
      tabs: bar.scrollWidth - bar.clientWidth,
      labels: [...document.querySelectorAll('.tab')].filter(t => !t.hidden).map(t => t.textContent.trim()),
      wide: (document.documentElement.scrollWidth - window.innerWidth) + (sc.scrollWidth - sc.clientWidth)
    };
  });
  check('at 320px all four tabs keep their labels and nothing spills',
    narrow.tabs <= 0 && narrow.wide <= 0 && narrow.labels.join('|') === 'Lecture|Guide|Reference|Solve',
    JSON.stringify(narrow));
  await lec.setViewportSize({ width: 390, height: 900 });

  // The problem module has no lecture, and a saved lecture tab must not strand it.
  await lec.goto(FILE + '#lo21');
  await lec.waitForTimeout(300);
  await lec.click('#tab-lecture');
  await lec.waitForTimeout(300);
  await lec.goto(FILE + '#p212');
  await lec.waitForTimeout(450);
  const fell = await lec.evaluate(() => ({
    hidden: document.getElementById('tab-lecture').hidden,
    guideOn: document.getElementById('pane-guide').classList.contains('on'),
    lectureOn: document.getElementById('pane-lecture').classList.contains('on'),
    tabs: [...document.querySelectorAll('.tab')].filter(t => !t.hidden).length
  }));
  check('the problem module hides the lecture tab and falls back to the problem',
    fell.hidden && fell.guideOn && !fell.lectureOn && fell.tabs === 3, JSON.stringify(fell));

  await lec.close();

  // ---------------------------------------------------------------
  console.log('\nCONTRAST AND ANNOUNCEMENT');
  // ---------------------------------------------------------------
  const c = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await c.goto(FILE + '#lo23');
  await c.waitForTimeout(400);

  // Every text colour measured against the background actually behind it, on
  // a screen from each module in both themes. Token maths alone missed that
  // .pill.draft and a disabled .btn-post sit on --surface-3, and that white
  // on dark --good is 2.17:1.
  const SWEEP = () => {
    function lum(col) {
      const m = col.match(/[\d.]+/g).map(Number);
      const f = m.slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
    }
    function ratio(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
    function bgOf(el) {
      let n = el;
      while (n && n !== document.documentElement) {
        const col = getComputedStyle(n).backgroundColor;
        if (col && !/rgba\(0, 0, 0, 0\)|transparent/.test(col)) {
          const a = col.match(/[\d.]+/g).map(Number);
          if (a.length < 4 || a[3] >= 0.95) return col;
        }
        n = n.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }
    const bad = [];
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
      if (!own.length) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.opacity === '0') return;
      const fs = parseFloat(cs.fontSize), fw = Number(cs.fontWeight) || 400;
      const need = (fs >= 24 || (fs >= 18.66 && fw >= 700)) ? 3 : 4.5;
      let cr;
      try { cr = ratio(cs.color, bgOf(el)); } catch (e) { return; }
      if (cr < need) bad.push((el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase()) +
        ' ' + Math.round(cr * 100) / 100 + '<' + need + ' "' + own.map(n => n.textContent.trim()).join('').slice(0, 24) + '"');
    });
    return [...new Set(bad)];
  };

  const contrastBad = [];
  for (const dark of [false, true]) {
    for (const [hash, tab] of [['#lo21', 'guide'], ['#lo21', 'solve'], ['#lo22', 'solve'],
                               ['#lo23', 'guide'], ['#lo23-atb', 'guide'], ['#lo23', 'solve'],
                               ['#p212', 'guide'], ['#p212', 'table'],
                               ['#lo21', 'lecture'], ['#lo22', 'lecture'],
                               ['#lo23', 'lecture'], ['#lo24', 'lecture']]) {
      await c.goto(FILE + hash);
      await c.waitForTimeout(200);
      // The theme is saved, so clicking the toggle on every screen alternates
      // it instead of setting it. Click only when it is not already right.
      const now = await c.evaluate(() => document.documentElement.getAttribute('data-theme'));
      if ((now === 'dark') !== dark) { await c.click('#btn-theme'); await c.waitForTimeout(150); }
      await c.waitForTimeout(150);
      // The open tab is saved too, so a screen visited after a solve screen
      // would still be showing Solve — and the guide pane is emptied in that
      // state, so half these screens were measuring the same thing twice.
      await c.click('#tab-' + tab);
      await c.waitForTimeout(350);
      (await c.evaluate(SWEEP)).forEach(x => contrastBad.push((dark ? 'dark ' : 'light ') + hash + '/' + tab + ' ' + x));
    }
  }
  for (const dark of [false, true]) {
    await c.goto(FILE + '#p212');
    await c.waitForTimeout(250);
    const now5 = await c.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if ((now5 === 'dark') !== dark) { await c.click('#btn-theme'); await c.waitForTimeout(150); }
    await c.click('#tab-solve');
    await c.waitForTimeout(400);
    for (const sh of ['a', 'b', 'c', 'd', 'e']) {
      await c.click('[data-sheet5="' + sh + '"]');
      await c.waitForTimeout(350);
      if (sh === 'a') {
        // An untouched worksheet shows none of the states a learner creates.
        await c.click('[data-ext5="cash.bd"]');
        await c.waitForTimeout(200);
        await c.fill('[data-adj5="supx.d"]', '14400');
        await c.waitForTimeout(200);
        await c.click('[data-hint5="a-adj"]');
        await c.waitForTimeout(250);
      }
      (await c.evaluate(SWEEP)).forEach(x => contrastBad.push((dark ? 'dark ' : 'light ') + 'p212/sheet ' + sh + ' ' + x));
    }
  }
  check('every piece of text meets WCAG AA against what is behind it, in both themes',
    contrastBad.length === 0, contrastBad.slice(0, 6).join(' | ') + (contrastBad.length > 6 ? ' (+' + (contrastBad.length - 6) + ')' : ''));

  // The guide pane is replaced wholesale on every navigation. As a live region
  // that made a screen reader re-read the entire screen each time; the new
  // heading takes focus instead.
  // A goto that changes only the hash does not reload, so the sweep's last
  // click would still own focus. Take a fresh page.
  await c.close();
  const cc = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await cc.goto(FILE + '#lo23');
  await cc.waitForTimeout(400);
  const live = await cc.evaluate(() => ({
    guide: document.getElementById('guide').getAttribute('aria-live'),
    score: document.getElementById('ws-score').getAttribute('aria-live'),
    boot: document.activeElement === document.body
  }));
  check('the guide pane is not a live region', live.guide === null, 'aria-live=' + live.guide);
  check('the score still is', live.score === 'polite', 'aria-live=' + live.score);
  check('loading the page does not steal focus', live.boot);

  await cc.click('#btn-next');
  await cc.waitForTimeout(350);
  const moved = await cc.evaluate(() => {
    const a = document.activeElement;
    return { tag: a.tagName, inGuide: !!a.closest('#guide'), text: a.textContent.trim().slice(0, 30) };
  });
  check('navigating moves focus to the new screen\'s heading',
    moved.tag === 'H1' && moved.inGuide, JSON.stringify(moved));

  await cc.goBack();
  await cc.waitForTimeout(350);
  const back = await cc.evaluate(() => document.activeElement.tagName + '/' + !!document.activeElement.closest('#guide'));
  check('going back moves focus too', back === 'H1/true', back);

  await cc.click('#tab-solve');
  await cc.waitForTimeout(350);
  check('switching tabs leaves focus on the tab the user pressed',
    (await cc.evaluate(() => document.activeElement.id)) === 'tab-solve');
  await cc.close();

  // ---------------------------------------------------------------
  console.log('\nMODULE 2.4 — THE CLOSING PROCESS');
  // ---------------------------------------------------------------
  const z = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const zErr = [];
  z.on('pageerror', e => zErr.push('pageerror: ' + e.message));
  z.on('console', m => { if (m.type() === 'error') zErr.push('console: ' + m.text()); });
  await z.goto(FILE);
  await z.evaluate(() => localStorage.clear());
  await z.goto(FILE + '#lo24');
  await z.waitForTimeout(500);

  const clo = await z.evaluate(() => {
    const bad = [];
    CLOSE.forEach(e => {
      if (closeDebits(e) !== closeCredits(e)) bad.push(e.id + ' Dr ' + closeDebits(e) + ' Cr ' + closeCredits(e));
      e.lines.forEach(l => {
        if (!acct4(l[0])) bad.push(e.id + ' uses unknown account ' + l[0]);
        if (l[1] && l[2]) bad.push(e.id + ' has a line that is both a debit and a credit');
      });
    });
    const after = closedThrough(999);
    const left = ACCT4.filter(a => isTemporary(a.k) && after[a.k]).map(a => a.k + '=' + after[a.k]);
    const perm = permanentAccts();
    return {
      bad, left,
      open: preClose(), after,
      fromAdj: adjustedThrough(999),
      is: incomeStatement(), re: retainedStatement(), bs: balanceSheet(),
      pc: tbTotals4(after, perm), permCount: perm.length,
      permHasTemp: perm.filter(a => isTemporary(a.k)).map(a => a.k),
      cash: CLOSE.filter(e => e.lines.some(l => l[0] === 'cash')).map(e => e.id),
      divThroughIsum: CLOSE.filter(e => e.lines.some(l => l[0] === 'div') && e.lines.some(l => l[0] === 'isum')).map(e => e.id),
      flow: FLOW4DATA.length
    };
  });

  check('every closing entry balances and uses real accounts', clo.bad.length === 0, clo.bad.join('; '));
  check('2.4 opens from the adjusted trial balance 2.3 derives, not a retyped copy',
    Object.keys(clo.fromAdj).every(k => clo.open[k] === clo.fromAdj[k]),
    Object.keys(clo.fromAdj).filter(k => clo.open[k] !== clo.fromAdj[k]).join(','));
  check('no closing entry touches Cash', clo.cash.length === 0, clo.cash.join(','));
  check('dividends never pass through Income Summary', clo.divThroughIsum.length === 0, clo.divThroughIsum.join(','));

  check('the income statement reads 7,900 less 3,600 leaving 4,300',
    clo.is.revenue === 7900 && clo.is.totalExpenses === 3600 && clo.is.netIncome === 4300,
    JSON.stringify({ r: clo.is.revenue, e: clo.is.totalExpenses, n: clo.is.netIncome }));
  check('retained earnings runs 0 + 4,300 - 600 to 3,700',
    clo.re.open === 0 && clo.re.add === 4300 && clo.re.less === 600 && clo.re.close === 3700,
    JSON.stringify(clo.re));
  check('the balance sheet balances at 21,500',
    clo.bs.totalAssets === 21500 && clo.bs.totalClaims === 21500 && clo.bs.currentTotal === 13680 && clo.bs.bookValue === 7820,
    JSON.stringify({ ta: clo.bs.totalAssets, tc: clo.bs.totalClaims, ca: clo.bs.currentTotal, bv: clo.bs.bookValue }));

  check('closing empties every temporary account', clo.left.length === 0, clo.left.join(', '));
  check('and leaves retained earnings at 3,700', clo.after.re === 3700, String(clo.after.re));
  check('the post-closing trial balance totals 21,680 on both sides',
    clo.pc.d === 21680 && clo.pc.c === 21680, clo.pc.d + ' / ' + clo.pc.c);
  check('it carries only the ten permanent accounts',
    clo.permCount === 10 && clo.permHasTemp.length === 0, clo.permCount + ' accounts, temporary: ' + clo.permHasTemp.join(','));
  check('the module runs to nine screens', clo.flow === 9, String(clo.flow));

  // The dashboard board states the gap rather than asserting equality it
  // does not have: before closing the permanent accounts are out by exactly
  // the result equity has not been given yet.
  const board0 = await z.evaluate(() => ({
    nums: [...document.querySelectorAll('#guide .bb-num')].map(e => e.textContent),
    op: document.querySelector('#guide .bb-op').textContent,
    verdict: document.querySelector('#guide .verdict').textContent.trim()
  }));
  check('before closing the board shows the accounts out of balance, and by how much',
    board0.op !== '=' && /3,700/.test(board0.verdict), JSON.stringify(board0));

  for (let i = 3; i < 7; i++) {
    await z.goto(FILE + '#lo24'); await z.waitForTimeout(120);
    await z.evaluate(n => document.querySelector('[data-open="' + n + '"]').click(), i);
    await z.waitForTimeout(180);
  }
  await z.goto(FILE + '#lo24'); await z.waitForTimeout(350);
  const board1 = await z.evaluate(() => ({
    nums: [...document.querySelectorAll('#guide .bb-num')].map(e => e.textContent),
    op: document.querySelector('#guide .bb-op').textContent
  }));
  check('and once all four are read it balances at 21,680',
    board1.op === '=' && board1.nums[0] === board1.nums[1] && /21,680/.test(board1.nums[0]),
    JSON.stringify(board1));

  // The funnel is a real diagram: arrows with heads, and nothing written on
  // top of anything else.
  await z.goto(FILE + '#lo24-c1'); await z.waitForTimeout(350);
  const fn = await z.evaluate(() => {
    const svg = document.querySelector('svg.fn');
    if (!svg) return { missing: true };
    const items = [];
    svg.querySelectorAll('text').forEach(t => { const b = t.getBBox(); items.push({ t: t.textContent, x: b.x, x2: b.x + b.width, y: b.y, y2: b.y + b.height }); });
    const hits = [];
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], c = items[j];
      if (Math.min(a.x2, c.x2) - Math.max(a.x, c.x) > 1 && Math.min(a.y2, c.y2) - Math.max(a.y, c.y) > 1)
        hits.push(a.t.slice(0, 16) + ' over ' + c.t.slice(0, 16));
    }
    return {
      arrows: svg.querySelectorAll('path[marker-end]').length,
      markers: svg.querySelectorAll('marker').length,
      labelled: [...svg.querySelectorAll('text')].filter(t => /Dr |Cr |net income|never through/.test(t.textContent)).length,
      overlaps: hits,
      raster: svg.querySelectorAll('image').length,
      colour: getComputedStyle(svg).color
    };
  });
  check('the closing funnel draws four arrows, each with a head', fn.arrows === 4 && fn.markers === 2, JSON.stringify(fn));
  check('every arrow carries a label', fn.labelled >= 4, 'labelled=' + fn.labelled);
  check('and no label sits on top of another', fn.overlaps.length === 0, fn.overlaps.join(' | '));
  check('the funnel is drawn, not an image', fn.raster === 0);

  // Nine screens at the narrowest width.
  await z.setViewportSize({ width: 320, height: 800 });
  let zBad = [];
  for (let i = 0; i < 9; i++) {
    await z.goto(FILE + '#lo24'); await z.waitForTimeout(120);
    await z.evaluate(n => document.querySelector('[data-open="' + n + '"]').click(), i);
    await z.waitForTimeout(220);
    const o = await z.evaluate(() => {
      const sc = document.querySelector('#pane-guide .scroll');
      const figs = [...document.querySelectorAll('#guide .viz')];
      return {
        d: document.documentElement.scrollWidth - window.innerWidth,
        p: sc.scrollWidth - sc.clientWidth,
        h1: !!document.querySelector('#guide h1'),
        figs: figs.length,
        unclaimed: figs.filter(f => !f.querySelector('[role="img"][aria-label]') && !f.querySelector('.sr-only')).length
      };
    });
    if (o.d > 0 || o.p > 0) zBad.push('screen ' + i + ' overflows ' + o.d + '/' + o.p);
    if (!o.h1) zBad.push('screen ' + i + ' has no heading');
    if (!o.figs) zBad.push('screen ' + i + ' has no illustration');
    if (o.unclaimed) zBad.push('screen ' + i + ' has ' + o.unclaimed + ' figures with no claim');
  }
  check('all nine 2.4 screens fit 320px with a heading and figures that state their claim',
    zBad.length === 0, zBad.join('; '));
  await z.setViewportSize({ width: 390, height: 900 });

  // The Reference gives the starting point, never the destination.
  await z.goto(FILE + '#lo24'); await z.waitForTimeout(300);
  await z.click('#tab-table'); await z.waitForTimeout(350);
  const ref4 = await z.evaluate(() => document.getElementById('table-slot').textContent);
  const leak4 = ['3,700', '21,680', '4,300', '13,680', '7,820'].filter(v => ref4.indexOf(v) !== -1);
  check('the 2.4 Reference gives away no figure the learner has to produce', leak4.length === 0, leak4.join(', '));
  check('but it does carry the adjusted trial balance it starts from',
    /25,880/.test(ref4) && /Adjusted trial balance/.test(ref4));

  // ---- the worksheet ----
  await z.click('#tab-solve'); await z.waitForTimeout(450);
  const w4v = await z.evaluate(() => ({
    score: document.querySelector('#ws-score b').textContent,
    instr: [...document.querySelectorAll('.instr-row .instr-t')].map(e => e.textContent),
    caps: [...document.querySelectorAll('.instr-row .instr-n')].map(e => e.textContent),
    fields: document.querySelectorAll('[data-fld4]').length,
    chips: document.querySelectorAll('[data-v4]').length,
    shown: document.querySelectorAll('[data-tx4]').length,
    rows: document.querySelectorAll('[data-trow4]').length,
    h1: !!document.querySelector('#solve h1'),
    unlabelled: [...document.querySelectorAll('#solve input, #solve select')].filter(e => !e.getAttribute('aria-label') && !e.id).length
  }));
  check('2.4 asks all three of the printed instructions',
    w4v.instr.length === 3 && /income statement/.test(w4v.instr[0]) && /closing entries/.test(w4v.instr[1]) && /post-closing/.test(w4v.instr[2]),
    w4v.instr.join(' | '));
  check('scored out of 26 — ten figures, four entries, twelve balances',
    w4v.score === '0 of 26' && w4v.caps.join() === '0/10,0/4,0/12', w4v.score + ' ' + w4v.caps.join());
  check('one closing entry on screen at a time out of four', w4v.chips === 4 && w4v.shown === 1, w4v.chips + '/' + w4v.shown);
  check('the post-closing form has a row for each permanent account', w4v.rows === 10, String(w4v.rows));
  check('the 2.4 worksheet keeps a heading and labels every field',
    w4v.h1 && w4v.unlabelled === 0, 'unlabelled=' + w4v.unlabelled);

  // The compound entry needs six lines, not two.
  await z.click('[data-v4="1"]'); await z.waitForTimeout(250);
  check('the expense entry offers all six of its lines',
    (await z.evaluate(() => document.querySelectorAll('.gl-row').length)) === 6);

  // The mistake the module exists to prevent.
  await z.click('[data-v4="3"]'); await z.waitForTimeout(250);
  await z.selectOption('[data-a4="3.0"]', 'isum');
  await z.fill('[data-d4="3.0"]', '600');
  await z.selectOption('[data-a4="3.1"]', 'div');
  await z.fill('[data-c4="3.1"]', '600');
  await z.waitForTimeout(200);
  await z.click('#btn-check'); await z.waitForTimeout(350);
  check('closing dividends through Income Summary is diagnosed as such',
    /never pass through Income Summary/.test(await z.evaluate(() => (document.querySelector('[data-note4="3"]') || {}).textContent || '')));

  // Work the whole problem, typing the textbook's figures rather than the app's.
  z.once('dialog', d => d.accept());
  await z.click('#ws-reset4'); await z.waitForTimeout(350);

  const FIG = { rev: 7900, te: 3600, ni: 4300, re: 3700, ca: 13680, bv: 7820, ta: 21500, cl: 5800, eq: 15700, tc: 21500 };
  for (const k of Object.keys(FIG)) await z.fill('[data-fld4="' + k + '"]', String(FIG[k]));
  await z.waitForTimeout(300);
  check('the ten statement figures score part (a) in full',
    (await z.evaluate(() => document.querySelector('#ws-score b').textContent)) === '10 of 26');

  const ENTRIES = [
    [['rev', 7900, 0], ['isum', 0, 7900]],
    [['isum', 3600, 0], ['swx', 0, 2400], ['supx', 0, 580], ['mre', 0, 290], ['depx', 0, 180], ['insx', 0, 150]],
    [['isum', 4300, 0], ['re', 0, 4300]],
    [['re', 600, 0], ['div', 0, 600]]
  ];
  for (let ci = 0; ci < ENTRIES.length; ci++) {
    await z.click('[data-v4="' + ci + '"]'); await z.waitForTimeout(160);
    for (let li = 0; li < ENTRIES[ci].length; li++) {
      const [k, d, c] = ENTRIES[ci][li];
      await z.selectOption('[data-a4="' + ci + '.' + li + '"]', k);
      if (d) await z.fill('[data-d4="' + ci + '.' + li + '"]', String(d));
      else await z.fill('[data-c4="' + ci + '.' + li + '"]', String(c));
    }
    await z.waitForTimeout(140);
    await z.click('[data-post4="' + ci + '"]'); await z.waitForTimeout(180);
  }
  check('journalizing all four closing entries scores part (b) in full',
    (await z.evaluate(() => document.querySelector('#ws-score b').textContent)) === '14 of 26');

  const PC = { cash: ['d', 5410], ar: ['d', 6300], sup: ['d', 320], ppi: ['d', 1650], eqp: ['d', 8000],
               adep: ['c', 180], ap: ['c', 5400], swp: ['c', 400], cs: ['c', 12000], re: ['c', 3700] };
  for (const k of Object.keys(PC)) await z.fill('[data-tb4="' + k + '.' + PC[k][0] + '"]', String(PC[k][1]));
  await z.fill('[data-tot4="d"]', '21680');
  await z.fill('[data-tot4="c"]', '21680');
  await z.waitForTimeout(350);
  const full4 = await z.evaluate(() => ({
    score: document.querySelector('#ws-score b').textContent,
    btn: document.getElementById('btn-check').textContent,
    instr: [...document.querySelectorAll('.instr-row')].map(r => r.className)
  }));
  check('working the whole problem through scores 26 of 26', full4.score === '26 of 26', full4.score);
  check('and all three instructions read as complete',
    /All correct/.test(full4.btn) && full4.instr.every(c => /done/.test(c)),
    full4.btn + ' | ' + full4.instr.join(','));

  await z.reload(); await z.waitForTimeout(500);
  await z.click('#tab-solve'); await z.waitForTimeout(450);
  check('2.4 work survives a reload',
    (await z.evaluate(() => document.querySelector('#ws-score b').textContent)) === '26 of 26');

  check('no console or page errors across module 2.4', zErr.length === 0, zErr.slice(0, 3).join(' | '));
  await z.close();

  // ---------------------------------------------------------------
  console.log('\nILLUSTRATIONS SAY WHAT THEY SHOW');
  // ---------------------------------------------------------------
  const v = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const vErr = [];
  v.on('pageerror', e => vErr.push('pageerror: ' + e.message));

  // A picture whose meaning is carried by position says nothing to a reader
  // who cannot see it unless the figure states its claim.
  const SCREENS = ['#lo21-t1', '#lo21-t5', '#lo21-r1', '#lo21-r4',
                   '#lo22-j1', '#lo22-j5', '#lo22-r1', '#lo22-r2',
                   '#lo23-a1', '#lo23-a2', '#lo23-a3', '#lo23-a5', '#lo23-why', '#lo23-atb'];
  let mute = [], thin = [], notFigure = [];
  for (const h of SCREENS) {
    await v.goto(FILE + h);
    await v.waitForTimeout(250);
    const figs = await v.evaluate(() => [...document.querySelectorAll('#guide .viz')].map(f => {
      const img = f.querySelector('[role="img"][aria-label]');
      const sr = f.querySelector('.sr-only');
      return {
        tag: f.tagName,
        caption: !!f.querySelector('figcaption'),
        claim: img ? img.getAttribute('aria-label') : (sr ? sr.textContent : null),
        cap: (f.querySelector('.viz-cap') || {}).textContent || ''
      };
    }));
    figs.forEach(f => {
      if (f.tag !== 'FIGURE' || !f.caption) notFigure.push(h + ' ' + f.cap);
      if (!f.claim) mute.push(h + ' :: ' + f.cap);
      // A claim has to be a sentence about the picture, not the title again.
      else if (f.claim.trim().length < 25 || f.claim.trim() === f.cap.trim()) thin.push(h + ' :: ' + f.claim);
    });
  }
  check('every illustration is a figure with a caption', notFigure.length === 0, notFigure.slice(0, 4).join(' | '));
  check('every illustration states what it shows', mute.length === 0, mute.slice(0, 4).join(' | '));
  check('and the claim is a sentence, not the title repeated', thin.length === 0, thin.slice(0, 4).join(' | '));

  // The timeline's whole point is the order of two events. Reading it in DOM
  // order has to give the same order the picture draws, or an accrual reads
  // as a deferral.
  let flipped = [];
  for (const h of ['#lo23-a1', '#lo23-a2', '#lo23-a3', '#lo23-a4', '#lo23-a5']) {
    await v.goto(FILE + h);
    await v.waitForTimeout(250);
    const r = await v.evaluate(() => {
      const m = [...document.querySelectorAll('.tl-mark')];
      const dom = m.map(e => e.querySelector('b').textContent);
      const vis = m.slice().sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
        .map(e => e.querySelector('b').textContent);
      return { kind: document.querySelector('.tl-verdict b').textContent, dom, vis };
    });
    if (JSON.stringify(r.dom) !== JSON.stringify(r.vis)) flipped.push(h + ' ' + r.kind + ' reads ' + r.dom.join('/') + ' but draws ' + r.vis.join('/'));
  }
  check('the timeline reads in the order it draws, on accruals as well as deferrals',
    flipped.length === 0, flipped.join(' | '));

  // And the claim has to name the right family, since that is the lesson.
  let wrongFamily = [];
  for (const h of ['#lo23-a1', '#lo23-a2', '#lo23-a5']) {
    await v.goto(FILE + h);
    await v.waitForTimeout(250);
    const r = await v.evaluate(() => {
      const fig = [...document.querySelectorAll('#guide .viz')].find(f => f.querySelector('.tl'));
      return { claim: fig.querySelector('[role="img"]').getAttribute('aria-label'),
               kind: document.querySelector('.tl-verdict b').textContent.toLowerCase() };
    });
    if (r.claim.toLowerCase().indexOf(r.kind) === -1) wrongFamily.push(h + ' says ' + r.kind + ' but the claim reads "' + r.claim + '"');
  }
  check('the timeline claim names the same family the picture does',
    wrongFamily.length === 0, wrongFamily.join(' | '));

  check('no console or page errors across the illustrations', vErr.length === 0, vErr.slice(0, 3).join(' | '));
  await v.close();

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
