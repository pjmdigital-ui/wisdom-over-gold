const { launchContext, LOCATION_ID } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/contacts/smart_list/All`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(16000);

  const searchBox = page.getByPlaceholder(/search/i).first();
  await searchBox.fill("paulmascetta@gmail.com");
  await page.waitForTimeout(2500);

  await page.screenshot({ path: "screenshots/contactdetail-prehover.png", fullPage: true });
  await page.mouse.click(384, 289);
  await page.waitForTimeout(8000);
  await page.screenshot({ path: "screenshots/contactdetail-00.png", fullPage: true });
  console.log("URL=" + page.url());

  await context.close();
})().catch((err) => {
  console.error("CHECK_CONTACT_DETAIL_ERROR", err);
  process.exit(1);
});
