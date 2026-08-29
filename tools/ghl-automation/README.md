# GHL browser automation

Playwright scripts that drive the real GHL account (`app.gohighlevel.com`) headlessly from this environment, since GHL has no public API for building funnel pages. Everything here is destructive-capable — it edits a live account — so treat these as tools to run deliberately, not to leave running unattended.

## Required one-time environment fix

Chromium in this environment can't reach **any** HTTPS site through the session's proxy out of the box — every `page.goto()` fails with `net::ERR_CONNECTION_RESET`, even though `curl` and Node's own `https` module work fine through the same proxy. Root cause: this Chromium build's TLS `ClientHello` includes Encrypted Client Hello (ECH) and a post-quantum key share (X25519MLKEM768), and the proxy's TLS-terminating layer resets the connection when it can't parse those extensions.

Fix (not a workaround — this doesn't disable certificate verification, it just turns off two newer TLS extensions Chromium enables by default):

```
mkdir -p /etc/chromium/policies/managed /etc/opt/chrome/policies/managed
cat > /etc/chromium/policies/managed/root_store.json << 'EOF'
{
  "EncryptedClientHelloEnabled": false,
  "PostQuantumKeyAgreementEnabled": false
}
EOF
cp /etc/chromium/policies/managed/root_store.json /etc/opt/chrome/policies/managed/root_store.json
```

This is host-level state (not part of the repo) — **a fresh container needs this reapplied** before any script here will be able to load a page. If you see `ERR_CONNECTION_RESET` again, this is the first thing to check.

## Login + 2FA

```
GHL_EMAIL=... GHL_PW=... node login_and_verify.js
```

Logs in and, if GHL asks for a security code (it does, every time — there's no way found yet to skip this), stops and polls `/tmp/ghl_otp_code.txt` for up to 5 minutes. Get the code from whoever received it, then in another shell:

```
echo -n "123456" > /tmp/ghl_otp_code.txt
```

The OTP screen is 6 separate single-digit boxes, not one field — `login_and_verify.js` already handles that (typing digit-by-digit). Session cookies persist in `~/.ghl-profile` (a Playwright persistent context profile dir) across script runs once logged in.

**Important:** this only reflects the actual credentials/2FA flow observed for the `paulmascetta@gmail.com` login into the `proleadz` agency. If the login screen changes (different 2FA method, different field labels), the script will need updating — it's brittle by nature since it's driving someone else's UI.

## Known account structure

- Agency: **proleadz**
- Sub-account for this project: **Wisdom Over Gold**, location ID `Pie9yvZA1BYJnWPk99Yj`
- Funnel: **Seek First Launch Funnel**, funnel ID `jhYyaoVGGGAsks0EcrQf`
  - Step "Opt-In" — raw preview: `https://sites.leadconnectorhq.com/preview/RMHZInAJov3GdExt6F4h` — **live domain: `https://wisdomovergold.com/seek-first-free-sample`** (changed from `/optin-page` via the step's Publishing tab)
  - Step "Sales" — raw preview: `https://sites.leadconnectorhq.com/preview/wrDudhSU88OTRsuv91AN` — **live domain: `https://wisdomovergold.com/sales-page`**
  - Step "Thank You" — raw preview: `https://sites.leadconnectorhq.com/preview/pfJ09P7VHRxSswmzi0dx` — **live domain: `https://wisdomovergold.com/thank-you-page-470466`**

`wisdomovergold.com` was connected as a custom domain partway through this build (not by anything in this repo — check GHL's Domains settings if you need to reconnect it elsewhere). **The raw preview URL and the live domain can show different content** — see the Publishing section below.

`list_subaccounts.js` will re-discover the sub-account list and switch into one if you need to find these again (e.g. after they change).

## Editing a funnel step's content

The funnel builder is GHL's own heavy drag-and-drop page builder (a cross-origin iframe at `page-builder.leadconnectorhq.com`), not something with a raw HTML paste field on the page itself. The working path found through trial and error:

1. Add a 1-column row to the step's canvas.
2. Add a **Custom Code** element (`Elements > Custom > Code`) into that row.
3. Open its code editor and paste a full HTML/CSS fragment (Google Fonts `<link>` tags + a scoped `<style>` block + the page markup).
4. Save the code modal, then **save the page itself** — autosave is off, and closing the browser without an explicit save discards everything.

`paste_and_save.js` does all four steps in one run:

```
node paste_and_save.js <content-file.html> <tag> "<Step Name>"
```

- `content-file.html` — a self-contained HTML/CSS fragment (see `scope_css.py` below for how the funnel pages in `../funnel/` get converted into one).
- `tag` — just a label used in screenshot filenames for that run (`screenshots/p1-<tag>-...png` etc.).
- `Step Name` — the exact sidebar step name to select first (e.g. `"Sales"`). Omit only if there's just one step, since some step names collide with the funnel's own top-level tabs (there's a "Sales" *analytics* tab on every funnel, separate from a step literally named "Sales" — the script disambiguates by picking whichever match sits lower on the page, but pass the name explicitly to be safe).

Because autosave is off, **every run of `paste_and_save.js` rebuilds the row + Custom Code block from scratch** (a fresh browser session never sees the prior run's unsaved canvas state) — that's why it re-adds the row and element each time rather than assuming they're already there. This means re-running it on a step that already has content will add a *second* row unless the first one is deleted first — check the step visually before re-running.

`build_step.js "<Name>" "<path-slug>"` creates a new, empty funnel step (the "Add new step" flow) — use this before `paste_and_save.js` for a step that doesn't exist yet.

`update_existing_block.js` is the one to use once a step already has content — it edits the existing Custom Code block in place instead of adding a second row/element (same arguments as `paste_and_save.js`). Use `paste_and_save.js` only for a step's first-ever content.

**A `<script>` tag inside the Custom Code content can silently break the save** — one run had the editor visibly show the correct pasted content, the modal "Save" and page-save both got clicked, but the "Last saved" timestamp never advanced and nothing actually persisted. Removing the `<script>` tag (a live total-calculator for an order bump) fixed it immediately. Not confirmed *why* — possibly the script executing inside the edit-mode canvas throws and wedges the save handler — but until that's understood, avoid live `<script>` tags in these blocks; keep interactive bits (checkboxes etc.) visually present but non-dynamic. **Always check the "Last saved" timestamp actually advanced after a save** — a stuck timestamp is the tell that it silently failed.

## Publishing (required after every content change)

A draft save (what `paste_and_save.js`/`update_existing_block.js` do) only updates what you see in the builder and at the raw `sites.leadconnectorhq.com/preview/...` URL. Once a custom domain is connected, **that domain serves the last *published* version**, not the draft — so a perfectly good save can look like it "didn't work" if you're checking the live domain and forgot to publish.

```
node publish_step.js "<Step Name>"
```

Clicks the step's Publish button (also inside the cross-origin builder iframe, so it's a coordinate click, not a locator). Run this after every `paste_and_save.js`/`update_existing_block.js` call once a domain is live. Verify with a cache-busting curl against the real domain (`curl -sS "https://wisdomovergold.com/sales-page?nocache=$(date +%s)" | grep ...`), not just a browser screenshot — browser-level caching can also mask a stale page.

## `scope_css.py`

The pages built for local preview in `../funnel/` (`optin.html`, `sales.html`, `thank-you.html`) are standalone documents with unscoped CSS (`* { }`, `h1 { }`, etc.) — fine for a full page, but GHL's Custom Code element injects into an *existing* page, so unscoped selectors would leak into the rest of that page's styling. This script wraps the whole thing in a `.sf-<scope>` div and prefixes every top-level selector:

```
python3 scope_css.py ../funnel/sales.html sf-sales /tmp/sales_ghl_content.html
node paste_and_save.js /tmp/sales_ghl_content.html sales "Sales"
```

It also strips the dev-only leading HTML comment, `<title>`/`<meta viewport>` tags, and local `assets/...` image references (those paths don't resolve on the live GHL site — upload the image to GHL's Media Library separately and add a real `<img>` tag).

## Memberships / Courses (membership area)

A real course product now exists in the live account: **"Seek First: The Four Pursuits of the Modern Catholic Man"**, offer "Seek First Member Access" (Free plan), `product_id=06474a72-c950-49c8-ab9e-75f499d69b8d`. Editor: `https://app.gohighlevel.com/v2/location/Pie9yvZA1BYJnWPk99Yj/memberships/courses/course-creator-studio?view=manager&sub_view=outline&product_id=06474a72-c950-49c8-ab9e-75f499d69b8d`.

Structure, confirmed by walking the "Start from scratch" wizard and opening a lesson:
- **Course → Modules → Lessons.** A module is a named group (e.g. "Course Contents"); a lesson is the actual content unit.
- Each **lesson** has: a name, a rich-text description field (formatted paragraphs — this is where devotion text would go), optional lesson media (video **or audio** — `.mp3`/`.wav`/`.aac` accepted, up to 2GB), a thumbnail, and downloadable resources. Save or Save & Publish per lesson.
- GHL seeds every new "from scratch" course with placeholder gamification content (a "Welcome Badge", a default "Course Contents" module with 5 sample lessons, and a "Course Completion Credential") — all currently untouched placeholder text, not yet replaced.
- No bulk/CSV import was found in a quick pass — content looks like it has to go in lesson-by-lesson through this same form-fill UI.

**Scope decision (made):** structure only, no lesson content yet. Built via `delete_sample_lessons.js` (removes GHL's 5 default placeholder lessons from the seeded "Course Contents" module), `rename_first_module.js` (renames that module to the real January title), and `add_remaining_modules.js` (adds the other 11 months). Current state: **12 empty modules**, one per month, named and ordered to match the manuscript's own chapter structure (`../../manuscript/q1-pursuit-of-piety/`, etc.):

1. January — God First (Pursuit I: Piety)
2. February — Sacrifice and Struggle (Piety)
3. March — Faith Under Doubt (Piety)
4. April — Integrity and Character (Pursuit II: Protection)
5. May — Patience and Anger Management (Protection)
6. June — Friendship and Brotherhood (Protection)
7. July — Work and Vocation (Pursuit III: Provision)
8. August — Personal Finance and Stewardship (Provision)
9. September — Leading the Household (Provision)
10. October — Marriage and Love (Pursuit IV: Posterity)
11. November — Fatherhood Fundamentals (Posterity)
12. December — Hope and Presence (Posterity)

The "Welcome Badge" and "Course Completion Credential" gamification placeholders GHL seeds automatically were left as-is (harmless, not devotion content). **Not yet done:** any lesson content inside the 12 modules — that's the next decision, and `explore_lesson_editor.js` documents what a lesson's edit form looks like (name, rich-text description, optional audio/video media, thumbnail, downloadable resource) for whenever that's scoped. See `../funnel/README.md` and the thank-you page's placeholder membership card, which still needs the real course URL (`course-creator-studio?...&product_id=06474a72-c950-49c8-ab9e-75f499d69b8d`) once lesson content exists.

## Opt-in form + sample delivery (done)

The opt-in page's form is now real and live, end to end:

- **Form**: a native GHL Form ("Form 0", `form_id=oIxrLZEdl80kXTwfP0hW`) with just First Name + Email (the default Phone field and both SMS-consent checkboxes were deleted — see `Deleting a rich-text/consent field` below for why that one was fiddly). Built with `create_form_start` steps directly in the browser (no dedicated script survives for the initial field deletion — it was iterative trial-and-error; `explore_lesson_editor.js`-style one-offs were deleted once the state was correct). Settings → On Submit is set to **Redirect to URL** → the Thank You page (`https://wisdomovergold.com/thank-you-page-470466`).
- **Embedded on the page**: `pb_finalize_form.js` adds a new row below the hero (GHL's native Form element can't nest inside the existing Custom Code block's own grid) and points it at "Form 0". The old fake placeholder `<form>` in `../funnel/optin.html` was removed and replaced with a note — pushed via `update_existing_block.js`.
- **Sample PDF**: uploaded to Media Library via `upload_pdf4.js` (`https://assets.cdn.filesafe.space/Pie9yvZA1BYJnWPk99Yj/media/6a91f7350914f11215f695e4.pdf` — get the direct link for any file with `get_pdf_url2.js`'s "Copy link" pattern, reading `navigator.clipboard.readText()` after the click).
- **Delivery workflow**: `create_email_workflow.js` builds a GHL Workflow ("Seek First - Free Sample Delivery", `workflow_id=a5ee6b1a-149a-4644-ae3f-1f7ffb493af4") — trigger **Form submitted** (filtered to Form 0) → action **Send email** with the PDF attached (via Media Storage picker) and a download link in the body, using the `{{contact.first_name}}` merge tag. **Leave 'From Name' blank unless you also fill 'From Email'** — GHL rejects the action with "From email is mandatory when From Name is entered" otherwise. The workflow uses GHL's newer **autosave** (a one-time "Enable auto save now" prompt on first open of a *new* workflow) for the canvas/trigger, but each **action's own fields still need an explicit "Save action" click** — autosave doesn't cover that.
- **Opt-in step URL**: changed from `/optin-page` to `/seek-first-free-sample` via the funnel step's Publishing tab (Step name/Step url fields, "Update step" button) — not something `paste_and_save.js` touches, this lives one level up in the funnel's own settings, not the page builder.

### The workflow builder is its own cross-origin iframe

Unlike the funnel page builder (`page-builder.leadconnectorhq.com`), the **Workflow** builder lives in a *different* iframe: `client-app-automation-workflows.leadconnectorhq.com`. Locator-based queries (`getByText`, `getByRole`, DOM `evaluate`) against anything inside an action's edit panel (like the "Save action" button) must go through `page.frameLocator('iframe[src*="client-app-automation-workflows"]')` — plain `page.locator(...)` finds nothing and fails silently with a 0-count match, not an error, which is an easy trap. Media-picker modals (Media Storage's "Insert media") are **not** inside that iframe — they're top-level, so those stay on plain `page.getByRole(...)`.

### Coordinate clicks + a tall viewport, not `mouse.wheel`

Getting to an action panel's lower fields (message body, attachments, Save action) needs the panel scrolled into view. **Don't use `page.mouse.wheel()` on this canvas** — the wheel event hits the workflow canvas itself (which treats wheel = zoom/pan), not the side panel, and silently wrecks the whole layout (confirmed: it zoomed the canvas to 243% and repositioned every node, breaking every subsequent hardcoded coordinate in that run). The fix that worked: launch the browser with an oversized viewport (`height: 1900`) so the entire action panel fits without scrolling at all, and keep every fill/click as a fixed coordinate tuned to that one viewport height. For the final "Save action" click specifically, a locator with `.scrollIntoViewIfNeeded()` inside the correct frame is more reliable than a raw coordinate, since a screenshot's `fullPage: true` coordinates don't equal real on-screen coordinates once content exceeds the viewport height.

### Deleting a rich-text/consent field

GHL's form builder shows a gear+trash icon pair at the top-right of whichever field block is currently selected — but a **single click inside a rich-text/consent block's text selects (and opens for editing) the whole block**, not just that paragraph. The two default SMS-consent checkboxes on a new form are one such combined block: clicking either paragraph reveals ONE shared delete icon for both, at the top of the whole block (not near wherever you clicked). Structured fields (Phone, Last Name, etc.) behave more predictably — clicking the *label* text selects just that field, with its own delete icon roughly 9px above the label.

## Media uploads: `upload_and_get_link.js`

`upload_and_get_link.js <file-path>` uploads a file to Media Storage and prints its public CDN link (uses the clipboard "Copy link" button on the file's preview modal). Used so far for the full EPUB and PDF:

- PDF: `https://assets.cdn.filesafe.space/Pie9yvZA1BYJnWPk99Yj/media/6a921de2058f231d6af85205.pdf`
- EPUB: `https://assets.cdn.filesafe.space/Pie9yvZA1BYJnWPk99Yj/media/6a921e66478fdaf1c7e35f05.epub`

**Gotcha the first upload run hit:** the freshly-uploaded file's card sits at a fixed grid position (~x=356, y=369 at this viewport, newest-first sort) once the upload completes — a plausible-looking-but-wrong coordinate like `(203, 468)` is just outside the card's actual bounding box and silently clicks blank page background, so every downstream click (open the card, hit "Copy link") does nothing and `navigator.clipboard.readText()` comes back empty with no error. There's no exception to catch — the only tell is an empty result. Re-run and screenshot the intermediate state (`upl-card-opened.png`) if a link ever comes back blank.

## The actual funnel logic (corrected)

Early in this build the Opt-In form's "On Submit" redirect was pointed at the Thank You step, and that step handed out the full EPUB/PDF for free — which meant a free-sample signup got the entire paid book at no charge. The intended flow, per direct correction:

**Opt-In (free 7-day sample)** → **Sales** (pitches the full book, $7, with the audio narration as a $9 order bump) → **Thank You** (generic confirmation only).

- The Opt-In form's redirect (`form-builder-v2` → Settings → On Submit) now points to `https://wisdomovergold.com/sales-page`, not the Thank You step.
- The Sales page price is `$7`; the audio order bump is `+$9` (`../funnel/sales.html`, `.price` and `.bump-label`).
- The Thank You page (`../funnel/thank-you.html`) was stripped back to a generic confirmation — no direct download buttons, no membership pitch card. It just says everything opted into or purchased is on its way by email, and that membership access will unlock to match what was bought. Building out *what* actually gets emailed (sample vs. full book vs. + audio, by tag) and the real membership area are both still open — see below.

## Real order form + payment (done)

Stripe is already connected to this location — both live mode and test mode enabled (`payments/integrations/stripe/manage`) — so the products created here can take real charges immediately.

- **Products** (`payments/products`, `create_book_product.js` / `create_product_audio.js`): "Seek First: The Four Pursuits of the Modern Catholic Man" at $7 one-time (`product_id=6a9229a548b96f4d26d65fff`), "Seek First - Audio Narration Add-On" at $9 one-time (`product_id=6a9229f92a5a14696c096088`).
- **Attaching products to the Sales step**: a funnel step has its own "Products" tab (`Steps → <step> → Products`, separate from the page builder) where each product+price gets attached individually (`add_step_products_ref.js`, `add_audio_step_product5.js`). **A product's "Additional Options" has a Main Product / Bump Product radio (`designate_bump_product.js` / `finish_designate_bump.js`)** — this, not anything in the order-form element itself, is what makes a product available to pick as a bump. Without it, the order form's own "Add Bump Product → Select Product" dropdown just says "Sorry, no matching options," which looks like a bug but really means no step-level product is flagged `Bump Product` yet.
- **The order-form element** (`build_order_form.js`): GHL's "1 Step Order" Quick Add element (search "order" in Quick Add), placed as a new row. Its own settings panel has no product picker at all beyond Order Bump — the base product comes automatically from whichever step-level product is *not* flagged as a bump. In the builder it always previews a placeholder "Dynamic Item @ $99" regardless of the real product/price — **this is cosmetic only**; the live published page resolves it correctly (verified: `curl` against the real domain shows the actual $7/$9 prices, no "Dynamic Item" anywhere).
- **After-purchase redirect**: the order form's own "Sale Actions → Go to Next step" (the default) sends a completed purchase to whatever step comes next in the funnel — here, Thank You — matching the intended Opt-In → Sales → Thank You flow.

## What's still manual / not done here

- **Purchase-triggered tagging + delivery**: nothing yet tags a contact by what they bought (sample-only vs. full book vs. + audio) or emails the full book/audio after a real purchase. This needs a Workflow triggered on "Order Form Submitted" / a purchase event, mirroring the `create_email_workflow.js` pattern already built for the free-sample delivery.
- **Membership area**: 12 empty modules exist (see below) but no lesson content yet, and no automation grants access by tag yet.

Done: cover image (uploaded to GHL Media Library, wired into opt-in + sales), custom domain (wisdomovergold.com, connected and publishing correctly), pricing copy ($7 book / $9 audio bump), 30-day guarantee copy, copyright year, opt-in form + free-sample PDF delivery, opt-in → sales (not thank-you) redirect, generic thank-you confirmation page, full e-book (EPUB + PDF) uploaded to Media Storage and ready to attach to a real post-purchase delivery once that exists.

See `../funnel/README.md` for the fuller picture of what's placeholder vs. real on these pages.
