// Runs references/extract.js against a page and prints its JSON.
//
// The skill as published drives the browser through Playwright MCP. This
// machine has Playwright and Chromium directly, and extract.js is a plain
// `() => {...}` expression, so it evaluates the same either way — the MCP
// server was only ever the transport. Using the local browser also means a
// file:// target works, which matters because the surface being analysed here
// is a single-file app, not a hosted site.
//
//   node .claude/skills/taste/scripts/capture.mjs <url> [outfile]
//
// Viewport is 1440x900, per Phase 1 of the skill, so measurements stay
// comparable between runs.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// ESM resolution ignores NODE_PATH, so playwright is required through CJS with
// an explicit search path. Set PLAYWRIGHT_MODULES to the node_modules holding
// playwright-core if it is not installed alongside this project.
const req = createRequire(import.meta.url);
function loadChromium() {
  const extra = process.env.PLAYWRIGHT_MODULES;
  for (const spec of [
    extra && resolve(extra, 'playwright-core'),
    extra && resolve(extra, 'playwright'),
    'playwright-core',
    'playwright'
  ].filter(Boolean)) {
    try { return req(spec).chromium; } catch (e) { /* try the next one */ }
  }
  throw new Error('playwright-core not found; set PLAYWRIGHT_MODULES to its node_modules directory');
}
const chromium = loadChromium();

const HERE = dirname(fileURLToPath(import.meta.url));
const EXE = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const url = process.argv[2];
const out = process.argv[3];
if (!url) {
  console.error('usage: capture.mjs <url> [outfile]');
  process.exit(1);
}

const src = readFileSync(resolve(HERE, '..', 'references', 'extract.js'), 'utf8');
// The file is commentary followed by one arrow-function expression. Everything
// before the first `() =>` is documentation of the output contract.
// The expression ends with a trailing semicolon, which is a syntax error
// once wrapped in parentheses. Trim it.
const fn = src.slice(src.indexOf('() => {')).trim().replace(/;\s*$/, '');

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(1200);

// Passed as a string, evaluate() treats it as an expression — the bare
// arrow function would just be the return value. Invoke it.
const data = await page.evaluate(`(${fn})()`);
data.captureErrors = errors;

await browser.close();

const json = JSON.stringify(data, null, 1);
if (out) { writeFileSync(out, json); console.error('wrote ' + out); }
else console.log(json);
