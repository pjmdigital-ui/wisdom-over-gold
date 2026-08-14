// GHL login — run with: GHL_EMAIL=... GHL_PW=... node login.js
// Password is read from the process environment only; never written to disk.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const HOST = process.env.GHL_HOST || "app.gohighlevel.com";
const EMAIL = process.env.GHL_EMAIL;
const PW = process.env.GHL_PW;
const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

if (!EMAIL || !PW) {
  console.error("Set GHL_EMAIL and GHL_PW env vars.");
  process.exit(1);
}

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(`https://${HOST}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.screenshot({ path: "tools/ghl-automation/screenshots/01-landing.png" });

  const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first();
  await emailInput.waitFor({ timeout: 20000 });
  await emailInput.fill(EMAIL);

  const pwInput = page.locator('input[type="password"]').first();
  await pwInput.waitFor({ timeout: 20000 });
  await pwInput.fill(PW);

  await page.screenshot({ path: "tools/ghl-automation/screenshots/02-filled-login.png" });

  const submitBtn = page.getByRole("button", { name: /sign in|log in|login/i }).first();
  await submitBtn.click();

  await page.waitForTimeout(4000);
  await page.screenshot({ path: "tools/ghl-automation/screenshots/03-after-submit.png" });

  const bodyText = await page.locator("body").innerText().catch(() => "");
  const needs2fa = /verify|security code|2fa|authentication code/i.test(bodyText);

  console.log("NEEDS_2FA=" + (needs2fa ? "yes" : "no"));
  console.log("CURRENT_URL=" + page.url());

  await context.close();
})().catch((err) => {
  console.error("LOGIN_ERROR", err);
  process.exit(1);
});
