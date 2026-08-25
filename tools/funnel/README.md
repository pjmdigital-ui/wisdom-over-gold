# Seek First sales funnel — skeleton

Three self-contained pages for a basic GHL funnel: opt-in &rarr; sales &rarr; thank you. This is a **structural skeleton**, not final copy — real voice and framework (the Four Pursuits), but pricing, testimonials, guarantee terms, and the membership area are placeholders marked `[[LIKE THIS]]`. Fill those in before this goes live.

## Files

- `optin.html` — free 7-day sample opt-in. Captures name + email.
- `sales.html` — full book sales page. Author story, the problem, the Four Pursuits framework, what a day looks like, testimonials (placeholder), pricing/order box (placeholder), guarantee (placeholder), FAQ.
- `thank-you.html` — post-purchase confirmation, digital access, and an intro card for a membership area (placeholder — the membership product itself doesn't exist in GHL yet).
- `assets/seek-first-cover.png` — local copy of the cover art for previewing these pages in a browser before anything is uploaded to GHL.

## Preview locally

```
cd tools/funnel && python3 -m http.server 8080
```

Then open `http://localhost:8080/optin.html` (etc.) in a browser.

## Design

Same palette and typography as the book itself (EPUB/PDF, reading-page artifacts) — parchment background, gold accents, Spectral headings + Source Serif 4 body, both pulled from Google Fonts. This is a **different look on purpose** from the Instagram post system (`tools/content/`), which uses a black/gold palette — the funnel pages are selling the book itself, so they carry the book's own cover-and-page identity rather than the social-content one.

## Moving this into GHL

GHL doesn't have a public API for building visual funnel pages — the only way in is logging into the actual account and using GHL's Funnel Builder UI (or the Custom HTML/Code element, which each of these files is written to drop into directly). There's a browser-automation login script at `tools/ghl-automation/login.js` for driving that from this environment; it needs `GHL_EMAIL` and `GHL_PW` set as environment variables and hasn't been used to actually build anything yet — treat logging into a live account as something to confirm with Paul before doing it, not something to run automatically.

Once there's access:

1. **Images**: Never link to `assets/seek-first-cover.png` directly in production — GHL's own hosting (FileSafe CDN) has had 403 errors on mobile in prior builds. Upload the cover (and any other images added later) to the GHL Media Library first, then swap the `<img src="...">` paths to the resulting `storage.googleapis.com/msgsndr/...` URLs.
2. **Opt-in form**: Replace the plain `<form>` in `optin.html` with a GHL native form/survey element (Funnel Builder &rarr; Elements &rarr; Form), or wire the existing field names to a GHL form action per GHL's form-embed docs. Connect it to whatever email delivery sends the free 7-day sample.
3. **Order form / payment**: Replace the placeholder CTA button in `sales.html`'s order box with GHL's Order Form element, connected to Stripe or GHL Payments, priced once `[[$PRICE]]` is decided.
4. **Thank-you delivery**: Wire the `[[Connect download link]]` button to wherever the EPUB/PDF actually gets delivered (a GHL file/download link, or an automation that emails it).
5. **Membership area**: Doesn't exist yet. When it does (a GHL Membership/Community product), replace `[[Membership area name]]`, the benefit bullets, and the `[[Connect to GHL membership portal]]` link with the real thing.
6. **Domain/funnel steps**: Create a 3-step funnel in GHL (opt-in &rarr; sales &rarr; thank you), paste each file's contents into a Custom HTML/Code element on its step, and set the opt-in's form action and the order form's success action to advance to the next step.

## What's deliberately left out of this skeleton

Per Paul's ask ("just wanna build a skeleton"), this pass skips order bumps, OTO upsell pages, and A/B variants — all straightforward to add later using the same page shells once the base funnel is live and the pricing/offer stack is decided.
