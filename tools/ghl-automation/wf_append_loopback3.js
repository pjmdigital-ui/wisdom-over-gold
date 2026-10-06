const { launchContext, openWorkflow, clickAppendPlus } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  await clickAppendPlus(page, frame);
  await page.waitForTimeout(2000);

  const searchBox = frame.getByPlaceholder(/search/i).first();
  await searchBox.fill("Add to workflow");
  await page.waitForTimeout(1200);

  const option = frame.getByText("Add to workflow", { exact: true }).first();
  await option.click({ timeout: 15000 });
  await page.waitForTimeout(2000);

  // Rename the action for clarity
  await page.mouse.click(1158, 298);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Loop Back to Week 1");
  await page.waitForTimeout(400);

  // Open the WORKFLOW select dropdown
  const workflowSelect = frame.getByText("Select", { exact: true }).first();
  await workflowSelect.click({ timeout: 15000, force: true });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/wlb3-00-dropdown.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("WF_APPEND_LOOPBACK3_ERROR", err);
  process.exit(1);
});
