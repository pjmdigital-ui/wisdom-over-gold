const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const FORM_ID = "oIxrLZEdl80kXTwfP0hW";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 700 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(`https://api.leadconnectorhq.com/widget/form/${FORM_ID}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(4000);

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a")).map((a) => ({
      text: a.textContent.trim(),
      href: a.href,
      outerHTML: a.outerHTML.slice(0, 300),
    }));
  });
  console.log(JSON.stringify(links, null, 2));

  await context.close();
})().catch((err) => {
  console.error("CHECK_WIDGET_LEGAL_LINKS_ERROR", err);
  process.exit(1);
});
