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

  await page.mouse.click(1158, 298);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Loop Back to Week 1");
  await page.waitForTimeout(400);

  const workflowSelect = frame.getByText("Select", { exact: true }).first();
  await workflowSelect.click({ timeout: 15000, force: true });
  await page.waitForTimeout(1000);

  const typeSearch = frame.getByPlaceholder("Type to search").first();
  await typeSearch.fill("Weekly");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/wlbs-00-typed-weekly.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("WF_LOOPBACK_SEARCH_ERROR", err);
  process.exit(1);
});
