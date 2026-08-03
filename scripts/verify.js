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
  console.log('\nSTEP WIRING');
  // ---------------------------------------------------------------
  const wiring = await page.evaluate(() => {
    const bad = [];
    STEPS.forEach((s, i) => {
      if (!s.hits || !s.hits.length || s.hits[0] === 'all') return;
      // Which columns does this step's ledger rows actually move?
      const moved = new Set();
      LEDGER.filter(r => r.step === i).forEach(r => COLS.forEach(c => { if (r[c.k]) moved.add(c.k); }));
      if (!moved.size) return;                       // statement steps move nothing
      s.hits.forEach(h => { if (!moved.has(h)) bad.push('step ' + i + ' highlights ' + h + ' but that column does not change'); });
      moved.forEach(m => { if (s.hits.indexOf(m) === -1) bad.push('step ' + i + ' changes ' + m + ' but does not highlight it'); });
    });
    return bad;
  });
  check('every step highlights exactly the columns it changes', wiring.length === 0, wiring.join('; '));

  const coverage = await page.evaluate(() => {
    const steps = new Set(LEDGER.map(r => r.step));
    return { rows: LEDGER.length, steps: [...steps].sort((a, b) => a - b), total: LECTURE.length + STEPS.length };
  });
  check('all 9 ledger rows are reachable', coverage.rows === 9, 'rows=' + coverage.rows);
  check('ledger rows are spread across steps 1-7', coverage.steps.join(',') === '1,2,3,4,5,6,7', coverage.steps.join(','));
  check('17 pages total (5 lecture + 12 steps)', coverage.total === 17, 'total=' + coverage.total);

  // ---------------------------------------------------------------
  console.log('\nNAVIGATION');
  // ---------------------------------------------------------------
  await page.evaluate(() => localStorage.clear());
  await page.goto(FILE);
  await page.waitForTimeout(500);
  const N = await page.evaluate(() => LECTURE.length + STEPS.length);
  let navOk = true, overflow = [];
  for (let i = 0; i < N; i++) {
    const o = await page.evaluate(() => {
      const sc = document.querySelector('#pane-guide .scroll');
      return {
        x: sc.scrollWidth - sc.clientWidth,
        d: document.documentElement.scrollWidth - window.innerWidth,
        label: document.getElementById('prog-label').textContent,
        rail: document.querySelectorAll('#rail i').length
      };
    });
    if (o.x > 0 || o.d > 0) { overflow.push('page ' + i + ' +' + o.x); navOk = false; }
    if (o.rail !== 18) { overflow.push('page ' + i + ' rail=' + o.rail); navOk = false; }
    if (i < N - 1) await page.evaluate(() => document.getElementById('btn-next').click());
    await page.waitForTimeout(40);
  }
  check('all ' + N + ' pages advance with no overflow and a full rail', navOk, overflow.join(', '));

  await page.goto(FILE + '#step-9');
  await page.waitForTimeout(500);
  check('deep link #step-9 opens step 9',
    (await page.evaluate(() => document.getElementById('prog-label').textContent)) === 'Step 9 of 11');
  await page.evaluate(() => document.getElementById('btn-next').click());
  await page.waitForTimeout(150);
  await page.goBack();
  await page.waitForTimeout(200);
  check('browser Back returns to the previous step',
    (await page.evaluate(() => document.getElementById('prog-label').textContent)) === 'Step 9 of 11');

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
  const durations = await page.evaluate(() => {
    const css = Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent).join('\n')
      .replace(/@font-face\s*\{[\s\S]*?\}/g, '');   // base64 payloads look like durations
    const out = [];
    const re = /(?:transition|animation)\s*:\s*([^;}]+)[;}]/g;
    let m;
    while ((m = re.exec(css))) {
      const decl = m[1];
      (decl.match(/(\d*\.?\d+)(ms|s)\b/g) || []).forEach(v => {
        const ms = v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
        if (ms > 0) out.push({ sel: decl.trim().slice(0, 44), ms });
      });
    }
    return out;
  });
  const overLimit = durations.filter(d => d.ms > 300);
  check('no UI animation exceeds 300ms', overLimit.length === 0,
    overLimit.map(d => d.sel + ' ' + d.ms + 'ms').join(', '));

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
