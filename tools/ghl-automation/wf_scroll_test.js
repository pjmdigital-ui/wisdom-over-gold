const { launchContext, openWorkflow } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await openWorkflow(page);

  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');

  // Scroll/pan the canvas down by wheeling over its center, checking
  // after each step whether END has come into view.
  for (let i = 0; i < 15; i++) {
    const endCount = await frame.getByText("END", { exact: true }).count();
    console.log(`step=${i} END_COUNT=${endCount}`);
    if (endCount > 0) break;
    await page.mouse.move(700, 900);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(600);
  }

  await page.screenshot({ path: "screenshots/scrolltest-00.png", fullPage: true });
  await context.close();
})().catch((err) => {
  console.error("WF_SCROLL_TEST_ERROR", err);
  process.exit(1);
});
