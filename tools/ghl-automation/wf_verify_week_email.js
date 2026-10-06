// Fresh-context verification that a given "Week N Email" action's body
// was actually persisted (not just visible in-session). Waits several
// seconds after opening the panel to avoid the loading-spinner race
// condition that gives false "0 characters" / stale readings.
// Usage: node wf_verify_week_email.js <week>
const { launchContext, openWorkflow } = require("./wf_lib");

const WEEK = parseInt(process.argv[2] || "1", 10);

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

  const node = await panToText(page, frame, `Week ${WEEK} Email`);
  await node.click({ timeout: 15000, force: true });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `screenshots/verify-week${WEEK}-00.png`, fullPage: true });

  const charCount = await frame.locator('text=/characters.*words/').first().textContent().catch(() => "N/A");
  console.log(`WEEK_${WEEK}_FRESH_CHAR_COUNT=` + charCount);

  await context.close();
})().catch((err) => {
  console.error("WF_VERIFY_WEEK_EMAIL_ERROR", err);
  process.exit(1);
});
