const { launchContext, openWorkflow } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await openWorkflow(page);

  // The 4-corner "fit view" icon at the bottom of the left zoom-control
  // stack (below pan/+/100%/-).
  await page.mouse.click(104, 1372);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/fitview2-00.png", fullPage: true });

  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  const endCount = await frame.getByText("END", { exact: true }).count();
  console.log("END_COUNT_AFTER_FIT=" + endCount);

  await context.close();
})().catch((err) => {
  console.error("WF_FIT_VIEW2_ERROR", err);
  process.exit(1);
});
