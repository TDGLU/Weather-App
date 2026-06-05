import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'assets', 'imgs', 'icon.png');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="cloudGrad" x1="20%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#c4b5fd"/>
      <stop offset="45%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#93c5fd"/>
    </linearGradient>
    <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
  </defs>
  <circle cx="360" cy="156" r="72" fill="url(#sunGrad)" stroke="#f59e0b" stroke-width="8"/>
  <g stroke="#f59e0b" stroke-width="10" stroke-linecap="round">
    <line x1="360" y1="56" x2="360" y2="88"/>
    <line x1="360" y1="224" x2="360" y2="256"/>
    <line x1="272" y1="156" x2="304" y2="156"/>
    <line x1="416" y1="156" x2="448" y2="156"/>
    <line x1="296" y1="96" x2="318" y2="118"/>
    <line x1="402" y1="194" x2="424" y2="216"/>
    <line x1="296" y1="216" x2="318" y2="194"/>
    <line x1="402" y1="118" x2="424" y2="96"/>
  </g>
  <g fill="url(#cloudGrad)" stroke="#6366f1" stroke-width="10">
    <circle cx="200" cy="300" r="88"/>
    <circle cx="300" cy="280" r="102"/>
    <circle cx="390" cy="310" r="78"/>
    <rect x="128" y="300" width="300" height="90" rx="45"/>
  </g>
  <circle cx="220" cy="292" r="20" fill="rgba(255,255,255,0.5)"/>
  <circle cx="310" cy="268" r="14" fill="rgba(255,255,255,0.38)"/>
</svg>
`;

const html = `<!DOCTYPE html><html><body style="margin:0;background:transparent;">${svg}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
await page.setContent(html, { waitUntil: 'load' });
await page.locator('svg').screenshot({ path: outPath, omitBackground: true });
await browser.close();
console.log('Saved', outPath);