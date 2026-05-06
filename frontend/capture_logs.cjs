const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type().toUpperCase()}] ${msg.text()} (${msg.location().url})`));
  page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}`));
  page.on('requestfailed', request => {
    logs.push(`[NETWORK ERROR] ${request.method()} ${request.url()} ${request.failure()?.errorText || 'Failed'}`);
  });
  page.on('response', response => {
    if (!response.ok()) {
      logs.push(`[NETWORK ERROR] ${response.request().method()} ${response.url()} ${response.status()}`);
    }
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  } catch (e) {
    logs.push(`[NAVIGATION ERROR] ${e.message}`);
  }
  
  console.log(JSON.stringify(logs, null, 2));
  await browser.close();
})();
