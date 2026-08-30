// Removes the Sales page's placeholder testimonials section from the
// hero Custom Code block. Does get+edit+set+verify all in ONE browser
// session (no re-navigation between steps) to rule out any step-selection
// drift between separate script invocations, and re-fetches content
// after save (not just editor in-memory state) to confirm it persisted.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";

function stripTestimonials(content) {
  const oldSection = `<section class="testimonials-section">
  <div class="wrap">
    <h2>What Readers Are Saying</h2>
    <div class="testimonials">
      <div class="testimonial-card">
        <span class="placeholder-tag">[[Testimonial 1]]</span>
        <p>[[Pull a real quote from an early reader/reviewer here once available.]]</p>
      </div>
      <div class="testimonial-card">
        <span class="placeholder-tag">[[Testimonial 2]]</span>
        <p>[[Pull a real quote from an early reader/reviewer here once available.]]</p>
      </div>
      <div class="testimonial-card">
        <span class="placeholder-tag">[[Testimonial 3]]</span>
        <p>[[Pull a real quote from an early reader/reviewer here once available.]]</p>
      </div>
    </div>
  </div>
</section>

`;
  if (!content.includes(oldSection)) throw new Error("testimonials section not found verbatim");
  content = content.replace(oldSection, "");

  const oldCss = `  /* ---- testimonials ---- */
  .sf-sales .testimonials {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .sf-sales .testimonial-card {
    background: #fffdf5;
    border: 1px dashed var(--border);
    border-radius: 8px;
    padding: 20px;
    font-size: 15px;
    color: var(--ink-soft);
  }

  .sf-sales .testimonial-card .placeholder-tag {
    display: inline-block;
    font-family: ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 10px;
  }

`;
  if (!content.includes(oldCss)) throw new Error("testimonials CSS not found verbatim");
  content = content.replace(oldCss, "");

  const oldMedia = "    .sf-sales .testimonials { grid-template-columns: 1fr; }\n";
  if (!content.includes(oldMedia)) throw new Error("testimonials media-query rule not found verbatim");
  content = content.replace(oldMedia, "");

  return content;
}

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 900 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/funnels-websites/funnels/${FUNNEL_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(9000);
  const stepsTab = page.getByText(/^Steps$/i).first();
  await stepsTab.click({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const matches = page.getByText("Sales", { exact: true });
  const count = await matches.count();
  let bestIdx = 0, bestY = -1;
  for (let i = 0; i < count; i++) {
    const box = await matches.nth(i).boundingBox().catch(() => null);
    if (box && box.y > bestY) { bestY = box.y; bestIdx = i; }
  }
  console.log("Sales text matches found:", count, "picking index", bestIdx, "at y=", bestY);
  await page.screenshot({ path: "screenshots/rt-00-steps-list.png", fullPage: true });
  await matches.nth(bestIdx).click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/rt-01-step-selected.png", fullPage: true });

  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);

  // VERIFY we're really on the Sales page before touching anything
  const frame = page.frameLocator('iframe[src*="page-builder"]');
  const salesMarker = frame.locator('text=/Wait! Add the Audio Narration/i').first();
  const markerBox = await salesMarker.boundingBox({ timeout: 15000 }).catch(() => null);
  if (!markerBox) {
    console.error("SAFETY ABORT: this is not the Sales page (marker not found)");
    await page.screenshot({ path: "screenshots/rt-abort.png", fullPage: true });
    await context.close();
    process.exit(1);
  }
  console.log("Confirmed on Sales page.");

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const block = builderFrame.getByText("Custom HTML/Javascript", { exact: false }).first();
  await block.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2000);

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);

  const realFrame = page.frames().find((f) => f.url().includes("page-builder.leadconnectorhq.com"));

  const before = await realFrame.evaluate(() => document.querySelector(".CodeMirror").CodeMirror.getValue());
  console.log("Fetched editor content, length:", before.length, "has testimonials:", before.includes("testimonials-section"));
  if (!before.includes("testimonials-section")) {
    console.error("SAFETY ABORT: testimonials-section not present in fetched content -- wrong block?");
    fs.writeFileSync("/tmp/rt-unexpected-content.html", before, "utf8");
    await context.close();
    process.exit(1);
  }

  const after = stripTestimonials(before);
  console.log("New content length:", after.length);

  const result = await realFrame.evaluate((content) => {
    const cm = document.querySelector(".CodeMirror").CodeMirror;
    cm.setValue(content);
    return cm.getValue().length;
  }, after);
  console.log("SET content, new length in editor=" + result);

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/rt-02-modal-saved.png", fullPage: true });

  await page.mouse.click(1305, 25); // page-level save
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/rt-03-page-saved.png", fullPage: true });

  // re-open the code editor in this SAME session to verify persistence
  const block2 = builderFrame.getByText("Custom HTML/Javascript", { exact: false }).first();
  await block2.click({ timeout: 15000, force: true });
  await page.waitForTimeout(1500);
  const openEditorBtn2 = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn2.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);

  const verify = await realFrame.evaluate(() => document.querySelector(".CodeMirror").CodeMirror.getValue());
  console.log("VERIFY after reopening editor: length=" + verify.length + " has testimonials=" + verify.includes("testimonials-section"));

  fs.writeFileSync("/tmp/hero_verified_final.html", verify, "utf8");

  await context.close();
})().catch((err) => {
  console.error("REMOVE_TESTIMONIALS_ERROR", err);
  process.exit(1);
});
