// Insert the "You're In" welcome email between "Add Tag" and the first
// "Wait Until Next Sunday 8PM" node, so new subscribers get an instant
// confirmation instead of silence until next Sunday.
//
// Unlike wf_append_email.js (which appends at the END of the chain and
// needs to pan the canvas down), this inserts right after the 2nd node
// from the top (the trigger is 1st, "Add Tag" is 2nd) -- a position
// that's always visible on the initial, unscrolled canvas load,
// regardless of how long the chain has grown below it. Only run this
// once the full 52-week batch build has finished, so there's no two
// concurrent sessions editing (and overwriting each other's save on)
// the same workflow.
const fs = require("fs");
const { launchContext, openWorkflow } = require("./wf_lib");

const ACTION_NAME = "Welcome Email";
const SUBJECT = "You're In — Your First Weekly Devotion Arrives Sunday at 8PM";
const HTML_FILE = "../../build/newsletter-emails/welcome.html";
const HTML_CONTENT = fs.readFileSync(HTML_FILE, "utf8");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);
  await page.screenshot({ path: "screenshots/iwe-00-loaded.png", fullPage: true });

  // The "+" directly below "Add Tag" and above the first Wait action --
  // a fixed, stable coordinate since Add Tag is always the 2nd node.
  await page.mouse.click(745, 607);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/iwe-01-panel-open.png", fullPage: true });

  const searchBox = frame.getByPlaceholder(/search/i).first();
  await searchBox.fill("Send email");
  await page.waitForTimeout(1200);

  const sendEmailOption = frame.getByText("Send email", { exact: true }).first();
  await sendEmailOption.click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  await page.mouse.click(1158, 345);
  await page.keyboard.press("Control+A");
  await page.keyboard.type(ACTION_NAME);
  await page.waitForTimeout(300);

  await page.mouse.click(1158, 677);
  await page.keyboard.type(SUBJECT);
  await page.waitForTimeout(300);

  await page.mouse.click(1024, 1115);
  await page.waitForTimeout(1500);

  await page.mouse.click(719, 275);
  await page.waitForTimeout(300);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(HTML_CONTENT);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/iwe-02-content.png", fullPage: true });

  const saveModalBtn = frame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(1500);

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/iwe-03-saved.png", fullPage: true });
  console.log("WELCOME_EMAIL_INSERTED");

  await context.close();
})().catch((err) => {
  console.error("WF_INSERT_WELCOME_ERROR", err);
  process.exit(1);
});
