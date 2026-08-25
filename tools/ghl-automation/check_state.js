const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 900 },
  });

  const pages = context.pages();
  console.log("OPEN_PAGES=" + pages.length);
  for (const p of pages) {
    console.log("  PAGE_URL=" + p.url());
  }
  const page = pages[pages.length - 1] || (await context.newPage());
  if (page.url() === "about:blank") {
    await page.goto("https://app.gohighlevel.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/30-check-state.png", fullPage: true });
  console.log("URL=" + page.url());
  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("SNIPPET=" + bodyText.slice(0, 500).replace(/\n/g, " | "));
  await context.close();
})().catch((err) => {
  console.error("CHECK_ERROR", err);
  process.exit(1);
});
