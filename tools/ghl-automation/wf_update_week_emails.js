// Push the updated (spacer-paragraph-formatted) HTML body into each
// existing "Week N Email" action in the live workflow, one week at a
// time, reusing the same edit pattern proven for the welcome email:
// Source code toggle -> replace textarea content -> modal Save ->
// "Save action" -> explicit top-level workflow Save (required for
// edits to an EXISTING action to actually persist).
//
// Each week is wrapped in its own try/catch with a retry so one slow
// render in a long unattended run doesn't abort the whole batch --
// failures are collected and printed at the end for a follow-up pass.
//
// Usage: node wf_update_week_emails.js <startWeek> <endWeek>
const fs = require("fs");
const path = require("path");
const { launchContext, openWorkflow } = require("./wf_lib");

const START = parseInt(process.argv[2] || "1", 10);
const END = parseInt(process.argv[3] || "52", 10);

async function panToText(page, frame, text, maxSteps = 80) {
  const node = frame.getByText(text, { exact: true }).first();
  for (let i = 0; i < maxSteps; i++) {
    const count = await node.count();
    if (count > 0) {
      const box = await node.boundingBox();
      if (box && box.y > 100 && box.y < 1700) {
        // settle: re-check the box is stable (not mid pan-animation)
        await new Promise((r) => setTimeout(r, 200));
        const box2 = await node.boundingBox();
        if (box2 && Math.abs(box2.y - box.y) < 2) {
          return node;
        }
      }
    }
    await page.mouse.move(700, 900);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(350);
  }
  throw new Error(`Could not pan to node: ${text}`);
}

async function updateOneWeek(page, frame, week) {
  const label = `Week ${week} Email`;
  const htmlPath = path.join(
    __dirname,
    "..",
    "..",
    "build",
    "newsletter-emails",
    `week-${String(week).padStart(2, "0")}.html`
  );
  const HTML_CONTENT = fs.readFileSync(htmlPath, "utf8");

  const node = await panToText(page, frame, label);
  await node.click({ timeout: 15000, force: true });

  // Wait for the panel to actually render (the "Action Name" field
  // label is plain static text in this UI, not a real <label for>, so
  // getByLabel doesn't match it -- use getByText instead) before
  // touching anything else.
  await frame.getByText("Action Name", { exact: false }).first().waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1500);

  await page.mouse.click(1024, 1115);

  // Wait for the source-code textarea to be present before typing into it.
  const sourceArea = frame.locator("textarea").first();
  await sourceArea.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(500);

  await page.mouse.click(719, 275);
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Delete");
  await page.waitForTimeout(500);
  await page.keyboard.insertText(HTML_CONTENT);
  await page.waitForTimeout(1000);

  // Confirm the textarea actually received the new content before saving.
  let textareaVal = "";
  for (let i = 0; i < 20; i++) {
    textareaVal = await sourceArea.inputValue().catch(() => "");
    if (textareaVal.length > HTML_CONTENT.length * 0.9) break;
    await page.waitForTimeout(300);
  }
  console.log(`WEEK_${week}_TEXTAREA_LEN=${textareaVal.length} EXPECTED=${HTML_CONTENT.length}`);

  const saveModalBtn = frame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 20000 });
  await page.waitForTimeout(2000);

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 20000, force: true });
  await page.waitForTimeout(2500);

  // Explicit top-level workflow Save (required for edits to an
  // existing action to persist -- confirmed via the welcome email fix).
  // These weekly bodies are much larger than the welcome email, so the
  // save network request can still be in flight well past a flat 3s --
  // poll until the top bar actually reads "Saved" (no spinner) instead
  // of a fixed sleep, or we risk closing the browser mid-save.
  await page.mouse.click(1378, 28);
  await page.waitForTimeout(1500);
  const topSaveBtn = frame.getByText(/^(Save|Saved|Saving)/).first();
  for (let i = 0; i < 20; i++) {
    const txt = await topSaveBtn.textContent().catch(() => "");
    if (/^Saved\s*$/.test((txt || "").trim())) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1500);
}

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  const failed = [];

  for (let week = START; week <= END; week++) {
    console.log(`WEEK_${week}_START`);
    let ok = false;
    for (let attempt = 1; attempt <= 2 && !ok; attempt++) {
      try {
        await updateOneWeek(page, frame, week);
        ok = true;
      } catch (err) {
        console.error(`WEEK_${week}_ATTEMPT_${attempt}_ERROR`, err.message);
        await page
          .screenshot({ path: `screenshots/batchfail-week${week}-attempt${attempt}.png`, fullPage: true })
          .catch(() => {});
        // Try to recover: close any open panel before retrying/continuing.
        await page.keyboard.press("Escape").catch(() => {});
        await page.waitForTimeout(1500);
        if (attempt === 1) {
          // reload the workflow fresh before the retry
          await openWorkflow(page);
        }
      }
    }
    if (ok) {
      console.log(`WEEK_${week}_DONE`);
    } else {
      console.log(`WEEK_${week}_FAILED`);
      failed.push(week);
    }
  }

  await context.close();
  console.log("ALL_WEEKS_PROCESSED");
  console.log("FAILED_WEEKS=" + JSON.stringify(failed));
})().catch((err) => {
  console.error("WF_UPDATE_WEEK_EMAILS_FATAL_ERROR", err);
  process.exit(1);
});
