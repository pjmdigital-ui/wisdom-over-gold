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
  - Step "Opt-In" — raw preview: `https://sites.leadconnectorhq.com/preview/RMHZInAJov3GdExt6F4h` — **live domain: `https://wisdomovergold.com/optin-page`**
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

**Not yet decided/built:** how much of the 365-day book to load in as lessons. Populating all 365 days as individual lessons through this browser-automation pipeline (the same one that needed many retries per single funnel content block) would mean roughly 365 separate multi-field lesson saves — a large, slow undertaking. Scope (skeleton vs. a subset vs. full 365) needs a decision before committing to that work. See `../funnel/README.md` and the thank-you page's placeholder membership card, which still needs the real course URL once scope is settled.

## What's still manual / not done here

- **Opt-in form wiring**: the form fields are plain HTML, not connected to a GHL contact/form action yet.
- **First-7-days PDF delivery**: the sample PDF exists (`tools/build_pdf_sample.py`) but isn't uploaded/attached to whatever sends it when the opt-in form is submitted.
- **Order form / payment**: the sales page's CTA is a placeholder link, not a real GHL Order Form / Stripe element. Price is set ($9); the audio-narration order bump's price is still a placeholder.
- **Membership area**: doesn't exist as a GHL product yet; the thank-you page just has a placeholder card for it.
- **Thank-you page links**: the digital-download button and the "Link to Day 1 / reader" button are both still placeholders.

Done: cover image (uploaded to GHL Media Library, wired into opt-in + sales), custom domain (wisdomovergold.com, connected and publishing correctly), pricing copy, 30-day guarantee copy, copyright year.

See `../funnel/README.md` for the fuller picture of what's placeholder vs. real on these pages.
