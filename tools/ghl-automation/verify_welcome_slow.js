const { launchContext, openWorkflow } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  const node = frame.getByText("Welcome Email", { exact: true }).first();
  await node.click({ timeout: 15000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "screenshots/verifyslow-00.png", fullPage: true });
  const charCount = await frame.locator('text=/characters.*words/').first().textContent().catch(() => "N/A");
  console.log("CHAR_COUNT=" + charCount);

  await context.close();
})().catch((err) => {
  console.error("VERIFY_WELCOME_SLOW_ERROR", err);
  process.exit(1);
});
