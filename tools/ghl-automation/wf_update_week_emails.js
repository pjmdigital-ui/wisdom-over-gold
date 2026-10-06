// Push the updated (spacer-paragraph-formatted) HTML body into each
// existing "Week N Email" action in the live workflow, one week at a
// time, reusing the same edit pattern proven for the welcome email:
// Source code toggle -> replace textarea content -> modal Save ->
// "Save action" -> explicit top-level workflow Save (required for
// edits to an EXISTING action to actually persist).
//
// Usage: node wf_update_week_emails.js <startWeek> <endWeek>
const fs = require("fs");
const path = require("path");
const { launchContext, openWorkflow } = require("./wf_lib");

const START = parseInt(process.argv[2] || "1", 10);
const END = parseInt(process.argv[3] || "52", 10);

async function panToText(page, frame, text, maxSteps = 80) {
  const node = frame.getByText(text, { exact: true }).first();
  for (let i = 0; i < maxSteps; i++) {
    const count = await node.count();
    if (count > 0) {
      const box = await node.boundingBox();
      if (box && box.y > 100 && box.y < 1700) {
        return node;
      }
    }
    await page.mouse.move(700, 900);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(350);
  }
  throw new Error(`Could not pan to node: ${text}`);
}

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  for (let week = START; week <= END; week++) {
    const label = `Week ${week} Email`;
    const htmlPath = path.join(
      __dirname,
      "..",
      "..",
      "build",
      "newsletter-emails",
      `week-${String(week).padStart(2, "0")}.html`
    );
    const HTML_CONTENT = fs.readFileSync(htmlPath, "utf8");

    console.log(`WEEK_${week}_START`);

    const node = await panToText(page, frame, label);
    await node.click({ timeout: 15000, force: true });
    await page.waitForTimeout(2500);

    await page.mouse.click(1024, 1115);
    await page.waitForTimeout(1500);

    await page.mouse.click(719, 275);
    await page.waitForTimeout(500);
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Delete");
    await page.waitForTimeout(500);
    await page.keyboard.insertText(HTML_CONTENT);
    await page.waitForTimeout(1200);

    const saveModalBtn = frame.getByRole("button", { name: /^save$/i }).first();
    await saveModalBtn.click({ timeout: 15000 });
    await page.waitForTimeout(2000);

    const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
    await saveActionBtn.click({ timeout: 15000, force: true });
    await page.waitForTimeout(2500);

    // Explicit top-level workflow Save (required for edits to an
    // existing action to persist -- confirmed via the welcome email fix).
    await page.mouse.click(1378, 28);
    await page.waitForTimeout(2500);

    console.log(`WEEK_${week}_DONE`);
  }

  await context.close();
  console.log("ALL_WEEKS_UPDATED");
})().catch((err) => {
  console.error("WF_UPDATE_WEEK_EMAILS_ERROR", err);
  process.exit(1);
});
