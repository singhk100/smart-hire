const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

  await page.goto('http://localhost:4200', { waitUntil: 'networkidle2', timeout: 15000 });

  const bodyText = await page.evaluate(() => document.body.innerText.trim());
  const appRootInner = await page.evaluate(() => document.querySelector('app-root')?.innerHTML?.substring(0, 500) || 'EMPTY');
  const title = await page.title();

  console.log('=== PAGE TITLE ===');
  console.log(title);
  console.log('\n=== BODY TEXT (first 300 chars) ===');
  console.log(bodyText.substring(0, 300) || '(EMPTY - blank page)');
  console.log('\n=== app-root innerHTML (first 500 chars) ===');
  console.log(appRootInner);
  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length === 0) console.log('No errors');
  else errors.forEach(e => console.log(e));

  await browser.close();
})();
