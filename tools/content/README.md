# Seek First Instagram post system

How to make a new black/gold Instagram post for `@seekwisdomovergold`, and why it's built the way it is.

## Quick start

1. Copy `instagram-post-template.html` to `instagram-post-<topic-slug>.html`.
2. Fill in the `[bracketed]` placeholders in the `.post` block per the rules below. Delete the `.context` and `.notes` blocks — they're dev-only reference, and the renderer ignores them anyway (it only extracts `.post`).
3. Render it:
   ```
   node render_instagram_png.js instagram-post-<topic-slug>.html sf_ig_<topic-slug>.png
   ```
   Requires `npm install playwright-core` once (chromium is already present at `/opt/pw-browsers` in this environment). Output lands in `build/instagram/` at 3240x4050px — 3x a real 1080x1350 IG feed post.
4. **Actually look at the rendered PNG before calling it done.** Check the footer handle isn't clipped and nothing overflows the bottom of the canvas. This format has broken silently before when copy ran long — always verify visually, don't trust the CSS math alone.

## Format history — why it looks like this

Three rounds of user feedback shaped the current version, in order:

1. **Started as a discrete card**: big white sans-serif headline hook, a gold-serif "lesson" block below it, a hopeful closing line with a soft glow. Worked, but the "Anxious About Money" post built in this style got feedback that it felt vague — it talked *about* worry in the abstract instead of using the book's real, vivid details.
2. **Went too far the other way**: added specific details from the source story (a mortgage due on the first, a slow business month). Feedback: too specific — it pinned the post to one guy's exact situation instead of a moment any reader would recognize. Fix: keep concrete *behavior* (checking a balance, running the numbers again, staying up), drop the narrow *scenario* (mortgage, business).
3. **Reference format supplied by the user** (Benjamin Lundquist's IG posts — white background, black text, yellow-highlighted opening line, dense unbroken paragraph, ends "Amen.", "type amen and share" CTA in the caption): adopted the **content structure** — one flowing paragraph instead of a broken-up card, opening claim highlighted, "Amen." as the literal last word — while keeping **our own black/gold palette** instead of copying his white/yellow look or using his name/handle/photo. Also noticed his posts keep God as the active grammatical subject throughout ("God is not starting over with you... He is building...", not just "you should trust God") — our first pass at this structure was still mostly about the reader's behavior with God mentioned once at the end; rewrote to put God at the center of most sentences.
4. **Font size**: shipped at 3.45cqw-4.3cqw first, got "hard to read, make it bigger" twice in a row. Landed on **5.6cqw** with copy cut to ~50-60 words total. The lesson: when told to make it bigger, cut the copy *first*, then push the size — don't just nudge the number and hope it still fits.

## The rules, distilled

**Visual structure** (see `instagram-post-template.html` for the exact CSS):
- 1080x1350 canvas (IG feed 4:5), black `#0a0a0a` background, gold `#d9b25f` / cream `#e4ddcc` text — matches the book cover's palette.
- A short gold rule mark, then one flowing paragraph. No separate hook/lesson/hope blocks anymore (that was v1; superseded).
- The opening 1-2 sentences carry a gold highlight (`.thesis` span) — same visual move as a highlighter, translated into our palette.
- The paragraph's literal last word is `Amen.` in bold gold (`.amen` span) — not a separate signature line.
- Footer is just `@seekwisdomovergold`, nothing else.
- Body copy at **5.6cqw**, ~50-60 words total. Cut copy before shrinking this number.

**Content rules:**
- Source every post from an actual day/story in the manuscript. Paraphrase in the author's voice — **never quote scripture directly**, consistent with the citation-only approach the main manuscript itself is moving toward (see `manuscript-citation-only/` and its own `00-front-matter/scripture-notice.md`).
- Concrete **behavior**, not a narrow **scenario**. "Checking your bank balance at 2am" is universal; "the mortgage due on the first" is one guy's situation. Favor the former.
- **God is the active subject** in most sentences after the opening thesis — "God is...", "He is...", "He has never..." — not just a passive mention at the end.
- No name, no day, no verse citation on the card itself. If the person wants to know the book/day/verse behind a post, that belongs in the caption, not the image.
- No hyperlinks or outside references of any kind — the author does not want the book linking out to other websites.

## Files in this folder

- `instagram-post-template.html` — start here for a new post.
- `render_instagram_png.js` — the renderer. Takes `[source.html] [output.png]` as optional CLI args; defaults to the very first post if you call it with no args.
- `instagram-post-anxious-about-money.html` — the current reference implementation of the format above (money anxiety / Philippians 4:19).
- `instagram-post-hook-lesson.html`, `instagram-post-covenant-eyes.html` — earlier posts still using the superseded v1 card structure (headline hook + separate lesson block). Not yet retrofitted to the current format — do that before reusing them as a reference.
- `instagram-post-mockups.html` — an earlier, even older concept grid (multiple post-type mockups: pull-quote, scripture card, saint spotlight, etc.), predates the black/gold-only direction being locked in. Historical reference only.
- `captions.md` — the caption text for the caption field under each post (not on the image itself): a standard CTA line reused across every post, plus a short summary paragraph per post. Add a new entry here whenever a new post ships.
- `build_video_outlines_pptx.js`, `build_web_slides.js` — unrelated: the 17-video PPTX/HTML teleprompter scripts, not Instagram content.
