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
  console.log('\nWORKSHEET');
  // ---------------------------------------------------------------
  // Drive the worksheet the way a learner does — through real DOM events on
  // real controls. Reading the module's own functions would only prove the
  // answer key agrees with itself.
  const ws = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const wsErrors = [];
  ws.on('pageerror', e => wsErrors.push('pageerror: ' + e.message));
  ws.on('console', m => { if (m.type() === 'error') wsErrors.push('console: ' + m.text()); });
  await ws.goto(FILE);
  await ws.evaluate(() => localStorage.clear());
  await ws.goto(FILE);
  await ws.waitForTimeout(400);
  await ws.click('#tab-solve');
  await ws.waitForTimeout(200);

  // A helper that types one effect through the controls, not into the model.
  // The direction control is a toggle, so clicking it when it is already set
  // would clear it. Press it only when it is not already in the wanted state.
  const fill = async (ri, i, key, dir, amt) => {
    await ws.selectOption(`[data-fx="${ri}.${i}"]`, key);
    const sel = `[data-dir="${ri}.${i}.${dir}"]`;
    if (await ws.getAttribute(sel, 'aria-pressed') !== 'true') await ws.click(sel);
    await ws.fill(`[data-amt="${ri}.${i}"]`, String(amt));
  };

  const shape = await ws.evaluate(() => ({
    cards: document.querySelectorAll('#solve .ws-tx').length,
    fields: document.querySelectorAll('#solve .ws-field').length,
    slots: document.querySelectorAll('#solve [data-fx]').length,
    h1: document.querySelectorAll('h1').length,
    score: document.getElementById('ws-score').textContent.trim(),
    // Nothing may be pre-filled, and no hint may be showing.
    prefilled: Array.from(document.querySelectorAll('#solve input')).filter(el => el.value).length,
    tips: document.querySelectorAll('#solve .ws-note').length,
    navHidden: document.getElementById('btn-next').hidden && document.getElementById('btn-prev').hidden,
    checkShown: !document.getElementById('btn-check').hidden
  }));
  check('worksheet has one card per ledger row and one field per figure',
    shape.cards === 9 && shape.fields === 5 && shape.slots === 18,
    `cards=${shape.cards} fields=${shape.fields} slots=${shape.slots}`);
  check('still exactly one h1 while solving', shape.h1 === 1, 'found ' + shape.h1);
  check('worksheet starts blank with no hint revealed',
    shape.prefilled === 0 && shape.tips === 0, `prefilled=${shape.prefilled} tips=${shape.tips}`);
  check('score starts at 0 of 14', /0\s*of\s*14/.test(shape.score), shape.score);
  check('walkthrough nav gives way to Check my work', shape.navHidden && shape.checkShown);

  const wsLayout = await ws.evaluate(() => {
    const sc = document.querySelector('#pane-solve .scroll');
    const small = [];
    document.querySelectorAll('#solve button, .controls button').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && (r.height < 44 || r.width < 44)) small.push(el.className || el.id);
    });
    const unnamed = [];
    document.querySelectorAll('#solve button, #solve select, #solve input').forEach(el => {
      const name = (el.getAttribute('aria-label') || '') + el.textContent.trim() +
        (el.labels && el.labels.length ? 'labelled' : '');
      if (!name) unnamed.push(el.tagName + '.' + el.className);
    });
    return {
      x: sc.scrollWidth - sc.clientWidth,
      doc: document.documentElement.scrollWidth - window.innerWidth,
      small, unnamed
    };
  });
  check('worksheet does not overflow horizontally at 390px',
    wsLayout.x <= 0 && wsLayout.doc <= 0, `pane +${wsLayout.x}, doc +${wsLayout.doc}`);
  check('no worksheet control under 44px', wsLayout.small.length === 0, wsLayout.small.join(','));
  check('every worksheet control has an accessible name', wsLayout.unnamed.length === 0, wsLayout.unnamed.join(','));

  // --- checking a blank sheet must not shout at the learner ---
  await ws.click('#btn-check');
  await ws.waitForTimeout(150);
  const blank = await ws.evaluate(() => ({
    wrong: document.querySelectorAll('#solve .ws-tx.wrong, #solve .ws-field.wrong').length,
    bad: document.querySelectorAll('#solve .ws-note.bad').length
  }));
  check('checking an untouched sheet marks nothing wrong',
    blank.wrong === 0 && blank.bad === 0, JSON.stringify(blank));

  // --- but a half-finished row is a real attempt and gets told so ---
  await ws.selectOption('[data-fx="3.0"]', 'cash');
  await ws.click('#btn-check');
  await ws.waitForTimeout(150);
  const partial = await ws.evaluate(() => ({
    wrong: document.querySelector('[data-tx="3"]').classList.contains('wrong'),
    note: (document.querySelector('[data-note="3"]') || {}).textContent || '',
    others: document.querySelectorAll('#solve .ws-tx.wrong').length
  }));
  check('a half-finished row is marked and the rest are left alone',
    partial.wrong && partial.others === 1, `others=${partial.others}`);
  check('the half-finished row counts what is done rather than calling it empty',
    /0 of 2 done so far/.test(partial.note), partial.note.slice(0, 80));
  await ws.selectOption('[data-fx="3.0"]', '');

  // --- a deliberately wrong entry has to be caught and explained ---
  await fill(0, 0, 'cash', 1, 10000);
  await fill(0, 1, 'rev', 1, 10000);              // financing recorded as earning
  await ws.click('#btn-check');
  await ws.waitForTimeout(150);
  const wrong = await ws.evaluate(() => ({
    marked: document.querySelector('[data-tx="0"]').classList.contains('wrong'),
    note: (document.querySelector('[data-note="0"]') || {}).textContent || '',
    score: document.getElementById('ws-score').textContent
  }));
  check('a wrong entry is marked wrong', wrong.marked);
  check('the diagnosis names the actual fault without giving the answer',
    /at least one account is wrong/.test(wrong.note) && !/common stock/i.test(wrong.note), wrong.note.slice(0, 90));
  check('a wrong entry does not score', /0\s*of\s*14/.test(wrong.score), wrong.score);

  // --- balance bar reads the learner's own workpaper ---
  await ws.selectOption('[data-fx="0.1"]', 'cs');
  await ws.fill('[data-amt="0.1"]', '9000');       // now unbalanced by 1,000
  await ws.waitForTimeout(120);
  const bar = await ws.evaluate(() => document.querySelector('#solve-table .proof').textContent);
  check('the balance bar reports the learner\'s own shortfall', /out by\s*\$?1,000/.test(bar), bar.trim());
  check('editing a row withdraws its mark',
    await ws.evaluate(() => !document.querySelector('[data-tx="0"]').classList.contains('wrong')));

  // --- hints escalate one level at a time and stop ---
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
    hints[0].text && hints[1].text && hints[2].text &&
    hints[0].text !== hints[1].text && hints[1].text !== hints[2].text,
    hints.map(h => h.text.slice(0, 24)).join(' | '));
  check('only the last hint states the answer',
    !/\$800/.test(hints[0].text) && /\$800/.test(hints[2].text), hints[0].text.slice(0, 60));
  check('the Hint button stops at the last level', hints[2].done && hints[3].text === hints[2].text);
  check('the Hint button says whether more are left',
    hints[0].label === 'Another hint' && hints[2].label === 'No more hints',
    hints.map(h => h.label).join(' / '));

  // --- Part 2 is graded against the ledger, not against the learner's totals ---
  // Total assets on the learner's own (still incomplete) workpaper is the
  // $10,000 of cash — right for what they entered, wrong for the problem.
  await ws.fill('[data-fld="ta"]', '10000');
  await ws.click('#btn-check');
  await ws.waitForTimeout(120);
  const derived = await ws.evaluate(() => ({
    wrong: document.querySelector('[data-field="ta"]').classList.contains('wrong'),
    note: (document.querySelector('[data-fnote="ta"]') || {}).textContent || ''
  }));
  check('a figure that follows from a wrong workpaper is still marked wrong', derived.wrong);
  check('and the diagnosis says the workpaper is the problem',
    /follows correctly from your workpaper/.test(derived.note), derived.note.slice(0, 80));

  // --- work survives a reload ---
  await ws.reload();
  await ws.waitForTimeout(400);
  const restored = await ws.evaluate(() => ({
    tab: document.getElementById('pane-solve').classList.contains('on'),
    amt: (document.querySelector('[data-amt="0.0"]') || {}).value,
    acct: (document.querySelector('[data-fx="0.1"]') || {}).value,
    dir: document.querySelector('[data-dir="0.0.1"]').classList.contains('on-up'),
    hint: !!document.querySelector('[data-note="1"] .ws-note')
  }));
  check('the worksheet reopens on reload with entries and hints intact',
    restored.tab && restored.amt === '10000' && restored.acct === 'cs' && restored.dir && restored.hint,
    JSON.stringify(restored));

  // --- a fully correct sheet scores 14 of 14 ---
  const plan = await ws.evaluate(() =>
    LEDGER.map((r, ri) => ({ ri, fx: expectedFor(r) })));
  for (const row of plan) {
    for (let i = 0; i < row.fx.length; i++) {
      await fill(row.ri, i, row.fx[i].k, row.fx[i].dir, row.fx[i].amt);
    }
  }
  const answers = await ws.evaluate(() => {
    const t = totalsUpTo(999);
    return { ni: t.rev - t.exp, re: t.rev - t.exp - t.div, ta: t.cash + t.ar + t.eq,
             tl: t.np + t.ap, te: t.cs + t.rev - t.exp - t.div };
  });
  for (const [id, v] of Object.entries(answers)) await ws.fill(`[data-fld="${id}"]`, String(v));
  await ws.click('#btn-check');
  await ws.waitForTimeout(200);
  const solved = await ws.evaluate(() => ({
    score: document.getElementById('ws-score').textContent,
    right: document.querySelectorAll('#solve .ws-tx.right').length,
    wrong: document.querySelectorAll('#solve .ws-tx.wrong, #solve .ws-field.wrong').length,
    label: document.getElementById('btn-check').textContent,
    proof: document.querySelector('#solve-table .proof').textContent
  }));
  check('a correct sheet scores 14 of 14', /14\s*of\s*14/.test(solved.score), solved.score);
  check('every card and field is marked right', solved.right === 9 && solved.wrong === 0,
    `right=${solved.right} wrong=${solved.wrong}`);
  check('the button acknowledges completion', /All correct/.test(solved.label), solved.label);
  check('the learner\'s own workpaper balances at $15,500',
    /Assets\s*\$15,500/.test(solved.proof) && /\$15,500/.test(solved.proof.split('=')[1] || ''),
    solved.proof.trim());

  // --- the widest state of the widest labels, on the narrowest phone ---
  const narrow = await browser.newPage({ viewport: { width: 320, height: 720 } });
  await narrow.goto(FILE);
  await narrow.waitForTimeout(400);
  await narrow.click('#tab-solve');
  await narrow.waitForTimeout(200);
  await narrow.click('[data-fhint="4"]');            // longest field label + "Another hint"
  await narrow.click('[data-hint="0"]');
  await narrow.waitForTimeout(150);
  const tight = await narrow.evaluate(() => {
    const sc = document.querySelector('#pane-solve .scroll');
    const input = document.querySelector('[data-fld="te"]').getBoundingClientRect();
    return {
      x: sc.scrollWidth - sc.clientWidth,
      doc: document.documentElement.scrollWidth - window.innerWidth,
      input: Math.round(input.width),
      tabs: Array.from(document.querySelectorAll('.tab')).map(t =>
        Math.round(t.scrollWidth - t.clientWidth))
    };
  });
  check('worksheet still fits at 320px with hints open',
    tight.x <= 0 && tight.doc <= 0, `pane +${tight.x}, doc +${tight.doc}`);
  check('the amount field stays usable beside a hint button', tight.input >= 100, tight.input + 'px');
  check('no tab label is clipped at 320px', tight.tabs.every(v => v <= 0), tight.tabs.join(','));
  await narrow.close();

  // --- leaving the worksheet restores the walkthrough controls ---
  await ws.click('#tab-guide');
  await ws.waitForTimeout(150);
  const back = await ws.evaluate(() => ({
    nav: !document.getElementById('btn-next').hidden,
    check: document.getElementById('btn-check').hidden,
    h1: document.querySelectorAll('h1').length
  }));
  check('leaving the worksheet restores Prev/Next and hides Check',
    back.nav && back.check && back.h1 === 1, JSON.stringify(back));
  check('no worksheet console or page errors', wsErrors.length === 0, wsErrors.slice(0, 3).join(' | '));

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
