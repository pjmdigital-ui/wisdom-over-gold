// Shared helpers for building out the Seek First Weekly Newsletter
// workflow action-by-action. The canvas always keeps a fixed ~62px gap
// between the last "+" (add-action) node and the "END" node beneath it,
// regardless of how tall the preceding action box is (wraps to 1 or 2
// lines) -- so clicking just above END reliably opens the panel to
// APPEND the next action, without needing to hardcode a Y coordinate
// that drifts as the chain grows.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const WORKFLOW_ID = "ec2be1a1-9d12-4f9e-815a-b63812e3337d";

async function openWorkflow(page) {
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/automation/workflow/${WORKFLOW_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(10000);
}

async function launchContext() {
  return chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1900 },
  });
}

async function clickAppendPlus(page, frame) {
  // The canvas can have multiple "END" nodes while a branch exists, but
  // this workflow is a single straight line, so there is exactly one.
  const endNode = frame.getByText("END", { exact: true }).first();
  await endNode.scrollIntoViewIfNeeded();
  const box = await endNode.boundingBox();
  if (!box) throw new Error("Could not find END node bounding box");
  const plusX = box.x + box.width / 2;
  const plusY = box.y - 62;
  await page.mouse.click(plusX, plusY);
}

module.exports = { PROFILE_DIR, CHROME_PATH, LOCATION_ID, WORKFLOW_ID, openWorkflow, launchContext, clickAppendPlus };
