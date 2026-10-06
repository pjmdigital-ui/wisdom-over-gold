const { launchContext, openWorkflow } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await openWorkflow(page);
  await page.screenshot({ path: "screenshots/wfpub-00-before.png", fullPage: true });

  // Toggle the Draft/Publish switch near the top-right
  await page.mouse.click(1335, 80);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/wfpub-01-after.png", fullPage: true });
  console.log("DONE");

  await context.close();
})().catch((err) => {
  console.error("WF_PUBLISH_ERROR", err);
  process.exit(1);
});
