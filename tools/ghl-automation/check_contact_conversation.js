const { launchContext, LOCATION_ID } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/contacts/smart_list/All`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(16000);
  await page.screenshot({ path: "screenshots/contact-00-list.png", fullPage: true });

  // Search for the contact
  const searchBox = page.getByPlaceholder(/search/i).first();
  const searchVisible = await searchBox.isVisible({ timeout: 5000 }).catch(() => false);
  console.log("SEARCH_VISIBLE=" + searchVisible);
  if (searchVisible) {
    await searchBox.fill("paulmascetta@gmail.com");
    await page.waitForTimeout(2500);
  }
  await page.screenshot({ path: "screenshots/contact-01-searched.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("CHECK_CONTACT_ERROR", err);
  process.exit(1);
});
