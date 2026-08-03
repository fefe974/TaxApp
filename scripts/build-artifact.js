// Builds artifact.html from index.html for publishing as a hosted Artifact page.
//
// Artifacts are wrapped in <!doctype html><head></head><body> at publish time,
// so this strips the outer document and emits <title> + <style> + body content.
// It also drops the PWA service-worker registration, which has nothing to
// register against on the artifact host.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'index.html');
const OUT = path.join(__dirname, '..', 'artifact.html');

const html = fs.readFileSync(SRC, 'utf8');

const styleMatch = html.match(/<style>[\s\S]*?<\/style>/);
if (!styleMatch) throw new Error('no <style> block found in index.html');

const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
if (!bodyMatch) throw new Error('no <body> block found in index.html');

let body = bodyMatch[1];

// The service worker cannot resolve on the artifact host; remove the block.
const swBlock = /\n\s*if \('serviceWorker' in navigator[\s\S]*?\n  \}\n/;
if (!swBlock.test(body)) throw new Error('service-worker block not found — check build script against index.html');
body = body.replace(swBlock, '\n');

const out = [
  '<title>Ledgerly — Learn accounting by doing it</title>',
  styleMatch[0],
  body.trim(),
  ''
].join('\n');

fs.writeFileSync(OUT, out);
console.log('Built ' + path.relative(process.cwd(), OUT) + ' (' + out.length + ' bytes)');
