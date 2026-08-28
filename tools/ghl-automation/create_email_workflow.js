const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const WORKFLOW_ID = "a5ee6b1a-149a-4644-ae3f-1f7ffb493af4";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";

const BODY_LINES = [
  "Hi {{contact.first_name}},",
  "",
  "Here is your free copy of the first 7 days of Seek First: The Four Pursuits of the Modern Catholic Man.",
  "",
  "Download your First 7 Days PDF: https://assets.cdn.filesafe.space/Pie9yvZA1BYJnWPk99Yj/media/6a91f7350914f11215f695e4.pdf",
  "",
  "One short devotion a day. Real stories, real Scripture, no charge, no catch.",
  "",
  "In faith,",
  "Paul Mascetta",
];

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1900 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/automation/workflow/${WORKFLOW_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(15000);

  await page.mouse.click(746, 793);
  await page.waitForTimeout(1500);
  await page.mouse.click(1006, 375);
  await page.waitForTimeout(2500);

  await page.mouse.click(1158, 345);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Send Sample PDF");
  await page.waitForTimeout(300);
  await page.mouse.click(1158, 424);
  await page.keyboard.type("Wisdom Over Gold");
  await page.waitForTimeout(300);
  await page.mouse.click(1158, 677);
  await page.keyboard.type("Your Free Sample Is Here — Seek First");
  await page.waitForTimeout(300);
  await page.mouse.click(1158, 1164);
  for (const line of BODY_LINES) {
    await page.keyboard.type(line, { delay: 5 });
    await page.keyboard.press("Enter");
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: "screenshots/wf-01-body-filled.png", fullPage: true });

  await page.mouse.click(1345, 994);
  await page.waitForTimeout(1200);
  await page.mouse.click(1293, 1063);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/wf-02-media-modal.png", fullPage: true });

  await page.mouse.click(203, 468);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/wf-03-pdf-selected.png", fullPage: true });

  const insertBtn = page.getByRole("button", { name: /insert media/i }).first();
  const insertVisible = await insertBtn.isVisible({ timeout: 5000 }).catch(() => false);
  console.log("INSERT_VISIBLE=" + insertVisible);
  if (insertVisible) {
    await insertBtn.click({ timeout: 8000, force: true });
  } else {
    await page.mouse.click(1319, 1195);
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/wf-04-attached.png", fullPage: true });

  const saveBtn = page.getByText("Save action", { exact: true }).first();
  const saveVisible = await saveBtn.isVisible({ timeout: 5000 }).catch(() => false);
  console.log("SAVE_VISIBLE=" + saveVisible);
  if (saveVisible) {
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click({ timeout: 8000, force: true });
  } else {
    await page.mouse.click(1358, 1979);
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/wf-05-saved.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("WF_EMAIL_FINAL_ERROR", err);
  process.exit(1);
});
