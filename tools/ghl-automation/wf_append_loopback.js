// Append an "Add to Workflow" action (re-enrolling the contact into
// this same workflow) after Week 52's email, so the newsletter loops
// back to Week 1 indefinitely instead of ending for good.
const { launchContext, openWorkflow, clickAppendPlus } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  await clickAppendPlus(page, frame);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/wlb-00-panel.png", fullPage: true });

  const searchBox = frame.getByPlaceholder(/search/i).first();
  await searchBox.fill("Add to workflow");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/wlb-01-search.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("WF_APPEND_LOOPBACK_ERROR", err);
  process.exit(1);
});
