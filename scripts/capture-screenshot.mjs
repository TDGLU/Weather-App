import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'assets', 'imgs', 'screenshot.png');
const baseUrl = process.env.APP_URL || 'http://127.0.0.1:8765/';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2
});

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.fill('#searchText', 'Los Angeles');
await page.click('#searchBtn');
await page.waitForFunction(() => {
  const el = document.getElementById('searchedCity');
  const text = el?.textContent?.trim() || '';
  return text && !text.includes('Search for') && text !== 'Error' && text !== 'Loading';
}, { timeout: 20000 });

await page.click('#compareAddCurrent');
await page.waitForTimeout(1500);
await page.fill('#compareInput', 'New York');
await page.click('#compareAddBtn');
await page.waitForTimeout(4000);

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log('Saved', outPath);