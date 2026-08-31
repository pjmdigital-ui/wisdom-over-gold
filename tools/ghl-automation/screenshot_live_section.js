// Screenshots the live (published, real domain) Sales page scrolled to a
// given text marker -- a quick way to visually spot-check a change without
// going through the page-builder at all. Doesn't touch GHL/the builder,
// just loads the real published page like any visitor would.
// Usage: node screenshot_live_section.js "<marker text regex>" [output-name]
const { chromium } = require("playwright-core");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const MARKER = process.argv[2] || "Enter Your Info for Immediate Access";
const OUT = process.argv[3] || "current-section";

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
  await page.goto("https://wisdomovergold.com/seek-first-full-book", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2000);
  const marker = page.locator(`text=/${MARKER}/i`).first();
  const box = await marker.boundingBox({ timeout: 15000 });
  await page.mouse.wheel(0, box.y - 100);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `screenshots/${OUT}.png`, fullPage: false });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
