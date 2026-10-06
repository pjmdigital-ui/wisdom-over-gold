// Append a "Wait Until Next Sunday 8PM" action to the end of the chain
// (dynamically finds the insertion point above END).
const { launchContext, openWorkflow, clickAppendPlus } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  await clickAppendPlus(page, frame);
  await page.waitForTimeout(2000);

  const searchBox = frame.getByPlaceholder(/search/i).first();
  await searchBox.fill("Wait");
  await page.waitForTimeout(1200);

  const waitOption = frame.getByText("Wait", { exact: true }).first();
  await waitOption.click({ timeout: 15000 });
  await page.waitForTimeout(2000);

  const recurringOption = frame.getByText("Until a recurring window opens", { exact: false }).first();
  await recurringOption.click({ timeout: 15000, force: true });
  await page.waitForTimeout(1500);

  for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri"]) {
    const dayBox = frame.getByText(day, { exact: true }).first();
    await dayBox.click({ timeout: 10000, force: true });
    await page.waitForTimeout(300);
  }
  const sunBox = frame.getByText("Sun", { exact: true }).first();
  await sunBox.click({ timeout: 10000, force: true });
  await page.waitForTimeout(500);

  await page.mouse.click(1158, 738);
  await page.waitForTimeout(1000);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("08:00:00 PM");
  await page.waitForTimeout(800);

  const okBtn = frame.getByText("OK", { exact: true }).first();
  await okBtn.click({ timeout: 10000, force: true });
  await page.waitForTimeout(800);

  await page.mouse.click(1158, 323);
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Wait Until Next Sunday 8PM");
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/waw-00-configured.png", fullPage: true });

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/waw-01-saved.png", fullPage: true });
  console.log("WAIT_APPENDED");

  await context.close();
})().catch((err) => {
  console.error("WF_APPEND_WAIT_ERROR", err);
  process.exit(1);
});
