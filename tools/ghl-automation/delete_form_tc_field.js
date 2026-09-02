const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FORM_ID = "oIxrLZEdl80kXTwfP0hW";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1000 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/form-builder-v2/${FORM_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(16000);

  const frame = page.frames().find(f => f.url().includes("leadgen-apps-form-survey-builder"));
  const iframeEl = await page.$('iframe[src*="leadgen-apps-form-survey-builder"]');
  const iframeBox = await iframeEl.boundingBox();

  const linkBox = await frame.evaluate(() => {
    const a = Array.from(document.querySelectorAll("a")).find(a => a.textContent.includes("Privacy Policy"));
    if (!a) return null;
    const r = a.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  if (!linkBox) {
    console.log("No Privacy Policy link found — field may already be gone.");
  } else {
    const px = iframeBox.x + linkBox.x + linkBox.w / 2;
    const py = iframeBox.y + linkBox.y - 10;
    await page.mouse.click(px, py);
    await page.waitForTimeout(1500);
    await page.mouse.click(iframeBox.x + 1091, iframeBox.y + 395);
    await page.waitForTimeout(1500);
  }

  // verify it's gone before saving
  const stillThere = await frame.evaluate(() => {
    return !!Array.from(document.querySelectorAll("a")).find(a => a.textContent.includes("Privacy Policy"));
  });
  console.log("Privacy Policy link still present after delete attempt:", stillThere);
  if (stillThere) {
    console.error("SAFETY ABORT: field not deleted, not saving.");
    await context.close();
    process.exit(1);
  }

  const saveBtn = frame.getByRole("button", { name: /^save$/i }).first();
  await saveBtn.click({ timeout: 10000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/dtc3-01-saved.png", fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("DELETE_TC_FIELD3_ERROR", err);
  process.exit(1);
});
