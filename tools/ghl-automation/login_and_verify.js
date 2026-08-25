// GHL — full login through 2FA in one continuous browser session, since
// the pending-verification state does not survive closing the context.
// Run with: GHL_EMAIL=... GHL_PW=... node login_and_verify.js
// Waits (polling) for a code to appear in /tmp/ghl_otp_code.txt, written
// by a separate step once the user relays the SMS code.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const HOST = process.env.GHL_HOST || "app.gohighlevel.com";
const EMAIL = process.env.GHL_EMAIL;
const PW = process.env.GHL_PW;
const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const CODE_FILE = "/tmp/ghl_otp_code.txt";
const MAX_WAIT_MS = 5 * 60 * 1000;
const POLL_MS = 2000;

if (!EMAIL || !PW) {
  console.error("Set GHL_EMAIL and GHL_PW env vars.");
  process.exit(1);
}

try { fs.unlinkSync(CODE_FILE); } catch (_) {}

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(`https://${HOST}/`, { waitUntil: "domcontentloaded", timeout: 60000 });

  const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first();
  await emailInput.waitFor({ timeout: 20000 });
  await emailInput.fill(EMAIL);

  const pwInput = page.locator('input[type="password"]').first();
  await pwInput.waitFor({ timeout: 20000 });
  await pwInput.fill(PW);

  const submitBtn = page.getByRole("button", { name: /sign in|log in|login/i }).first();
  await submitBtn.click();
  await page.waitForTimeout(4000);

  let bodyText = await page.locator("body").innerText().catch(() => "");
  if (!/verify security code/i.test(bodyText)) {
    console.log("STATE=unexpected_after_submit");
    console.log("URL=" + page.url());
    await page.screenshot({ path: "screenshots/20-unexpected.png" });
    await context.close();
    return;
  }

  const phoneOption = page.getByText(/send code to phone/i).first();
  await phoneOption.click();
  const sendBtn = page.getByRole("button", { name: /send security code/i }).first();
  await sendBtn.click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/21-code-requested.png" });
  console.log("STATE=code_requested_waiting_for_user");

  const start = Date.now();
  let code = null;
  while (Date.now() - start < MAX_WAIT_MS) {
    if (fs.existsSync(CODE_FILE)) {
      code = fs.readFileSync(CODE_FILE, "utf8").trim();
      if (code) break;
    }
    await page.waitForTimeout(POLL_MS);
  }

  if (!code) {
    console.log("STATE=timed_out_waiting_for_code");
    await context.close();
    return;
  }

  console.log("STATE=code_received_submitting");
  const codeInput = page
    .locator('input[type="text"], input[type="tel"], input[type="number"], input[inputmode="numeric"]')
    .first();
  await codeInput.waitFor({ timeout: 10000 });
  await codeInput.fill(code);

  const verifyBtn = page.getByRole("button", { name: /verify|confirm|submit/i }).first();
  await verifyBtn.click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/22-after-verify.png" });

  bodyText = await page.locator("body").innerText().catch(() => "");
  const stillBlocked = /verify security code|invalid code|incorrect code/i.test(bodyText);
  console.log("STATE=" + (stillBlocked ? "verify_failed" : "verify_success"));
  console.log("URL=" + page.url());

  await context.close();
})().catch((err) => {
  console.error("LOGIN_VERIFY_ERROR", err);
  process.exit(1);
});
