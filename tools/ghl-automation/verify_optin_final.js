const { chromium } = require("playwright-core");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH, args: ["--no-sandbox"], proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
  await page.goto("https://wisdomovergold.com/seek-first-free-sample", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/optin-final-verify.png", fullPage: true });
  const inputs = await page.locator('input#first_name').count();
  console.log("first_name inputs:", inputs);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
