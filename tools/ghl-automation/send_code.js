// GHL — resume a pending 2FA login and request the phone code.
// Run with: node send_code.js
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const HOST = process.env.GHL_HOST || "app.gohighlevel.com";
const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(`https://${HOST}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/10-resumed.png" });

  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("CURRENT_URL=" + page.url());

  if (/verify security code/i.test(bodyText)) {
    const phoneOption = page.getByText(/send code to phone/i).first();
    await phoneOption.click();
    await page.screenshot({ path: "screenshots/11-phone-selected.png" });

    const sendBtn = page.getByRole("button", { name: /send security code/i }).first();
    await sendBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "screenshots/12-code-sent.png" });

    const afterText = await page.locator("body").innerText().catch(() => "");
    console.log("STATE=code_sent");
    console.log("PAGE_TEXT_SNIPPET=" + afterText.slice(0, 300).replace(/\n/g, " | "));
  } else {
    console.log("STATE=not_on_verify_screen");
    console.log("PAGE_TEXT_SNIPPET=" + bodyText.slice(0, 300).replace(/\n/g, " | "));
  }

  await context.close();
})().catch((err) => {
  console.error("SEND_CODE_ERROR", err);
  process.exit(1);
});
