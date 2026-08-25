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

  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://app.gohighlevel.com/agency_dashboard", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);

  const subAccountsLink = page.getByText(/^Sub-Accounts$/i).first();
  await subAccountsLink.click();
  await page.waitForTimeout(3500);

  console.log("URL=" + page.url());

  // Find the actual scrollable list container and scroll it to the bottom
  // in steps, screenshotting the viewport at each step, rather than relying
  // on page-level fullPage scroll (this list scrolls internally).
  const scrollInfo = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("*"));
    let best = null;
    let bestDelta = 0;
    for (const el of all) {
      const delta = el.scrollHeight - el.clientHeight;
      if (delta > bestDelta && el.clientHeight > 200) {
        bestDelta = delta;
        best = el;
      }
    }
    if (best) {
      best.setAttribute("data-ghl-scroll-target", "1");
      return { scrollHeight: best.scrollHeight, clientHeight: best.clientHeight };
    }
    return null;
  });
  console.log("SCROLL_CONTAINER=" + JSON.stringify(scrollInfo));

  for (let step = 0; step < 6; step++) {
    await page.screenshot({ path: `screenshots/42-subaccounts-scroll${step}.png` });
    await page.evaluate(() => {
      const el = document.querySelector('[data-ghl-scroll-target="1"]');
      if (el) el.scrollTop += 700;
    });
    await page.waitForTimeout(500);
  }

  // Switch into the "Wisdom Over Gold" sub-account: the "Switch to
  // Sub-Account" link isn't nested under the same card as the name in the
  // DOM, so instead find the switch-link whose position is just below the
  // name's position on screen (closest one visually under it).
  const nameNode = page.getByText("Wisdom Over Gold", { exact: true }).first();
  await nameNode.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "screenshots/43-before-switch.png" });

  const nameBox = await nameNode.boundingBox();
  const switchLinks = page.getByText("Switch to Sub-Account");
  const switchCount = await switchLinks.count();
  let bestIdx = -1;
  let bestDelta = Infinity;
  for (let i = 0; i < switchCount; i++) {
    const box = await switchLinks.nth(i).boundingBox();
    if (!box || !nameBox) continue;
    const delta = box.y - nameBox.y;
    if (delta > -10 && delta < bestDelta) {
      bestDelta = delta;
      bestIdx = i;
    }
  }
  console.log("MATCHED_SWITCH_INDEX=" + bestIdx + " of " + switchCount);
  if (bestIdx === -1) throw new Error("Could not locate switch link near Wisdom Over Gold card");
  await switchLinks.nth(bestIdx).click();

  try {
    await page.waitForURL(/\/location\//, { timeout: 20000 });
  } catch (_) {
    // fall through; we'll just report whatever URL we're on
  }
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "screenshots/44-after-switch.png", fullPage: true });
  console.log("AFTER_SWITCH_URL=" + page.url());

  await context.close();
})().catch((err) => {
  console.error("LIST_ERROR", err);
  process.exit(1);
});
