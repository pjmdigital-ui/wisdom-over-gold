#!/usr/bin/env python3
"""Build the 52 weekly newsletter email bodies (full devotional content,
inline, for the "Seek First Weekly" Sunday-8PM newsletter) from the
52-week manuscript source.

Requires: pip install markdown --break-system-packages
Run from anywhere: python3 tools/build_newsletter_emails.py
Writes to: build/newsletter-emails/week-NN.html (one self-contained,
inline-styled HTML email body per week) and
build/newsletter-emails/subjects.json (week number -> subject line),
both gitignored -- rebuild after any manuscript edit.

Reuses the manuscript parsing/markdown helpers from build_epub.py so
this never drifts out of sync with the book or the free sample.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_epub as be  # noqa: E402

OUT_DIR = os.path.join(be.REPO, "build", "newsletter-emails")

# Inline styles only -- most email clients strip <style> blocks, so
# every element carries its own style="" attribute.
FONT = "font-family: Georgia, 'Times New Roman', serif;"
INK = "#2b2318"
MUTED = "#6b5c42"
GOLD = "#93691f"
CALLOUT_BG = "#ece0c0"
PRAYER_BG = "#f0e6c9"


def md_inline_to_html(text):
    """Convert just the markdown this manuscript actually uses inside a
    paragraph (**bold**) to HTML, without pulling in the full
    markdown library's block-level assumptions (we handle paragraphs
    ourselves so each <p> gets its own inline style)."""
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    return text


def paragraphs_html(raw_text, style):
    paras = [p.strip() for p in raw_text.split("\n\n") if p.strip()]
    return "".join(
        f'<p style="{style}">{md_inline_to_html(p)}</p>' for p in paras
    )


def callout_html(raw_text, label, bg, border_color, italic=False):
    if not raw_text:
        return ""
    paras = raw_text.split("\n\n", 1)
    first = f"<strong>{label}:</strong> {md_inline_to_html(paras[0].strip())}"
    rest_html = ""
    if len(paras) > 1:
        rest_html = paragraphs_html(paras[1], f"margin:0 0 0.8em; {FONT} font-size:15px; line-height:1.6; color:{INK};")
    style_extra = "font-style: italic;" if italic else ""
    return f"""<div style="margin:1.5em 0; padding:14px 18px; border-left:3px solid {border_color}; background:{bg}; {style_extra}">
<p style="margin:0 0 0.8em; {FONT} font-size:15px; line-height:1.6; color:{INK};">{first}</p>
{rest_html}
</div>"""


def build_email_html(week_num, week_title, raw_body):
    body, footer_lines = be.split_citation_footer(raw_body)
    main, this_week, prayer = be.split_week_sections(body)

    main_html = paragraphs_html(main, f"margin:0 0 1em; {FONT} font-size:16px; line-height:1.7; color:{INK};")
    this_week_html = callout_html(this_week, "This Week", CALLOUT_BG, GOLD)
    prayer_html = callout_html(prayer, "Prayer", PRAYER_BG, "#b3822a", italic=True)

    ref_html = ""
    if footer_lines:
        ref_text = " &middot; ".join(be.title_case_ref(l) for l in footer_lines)
        ref_html = f'<p style="margin:1.5em 0 0; text-align:center; {FONT} font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:{GOLD};">{ref_text}</p>'

    return f"""<div style="max-width:600px; margin:0 auto; padding:8px 4px;">
<p style="margin:0 0 0.3em; {FONT} font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:{GOLD};">Seek First &middot; Week {week_num} of 52</p>
<h1 style="margin:0 0 1.1em; {FONT} font-size:22px; font-weight:bold; color:{INK}; border-bottom:1px solid #d8c79a; padding-bottom:0.3em;">{week_title}</h1>
<p style="margin:0 0 1.2em; {FONT} font-size:16px; line-height:1.6; color:{INK};">Hi {{{{contact.first_name}}}},</p>
<p style="margin:0 0 1.2em; {FONT} font-size:16px; line-height:1.6; color:{MUTED}; font-style:italic;">Here's what's in front of you this week.</p>
{main_html}
{this_week_html}
{prayer_html}
{ref_html}
<p style="margin:2em 0 0; {FONT} font-size:15px; line-height:1.6; color:{INK};">In faith,<br/>Paul Mascetta</p>
<p style="margin:2em 0 0; {FONT} font-size:11px; color:{MUTED}; text-align:center;">Seek First: The Four Pursuits of the Modern Catholic Man &middot; wisdomovergold.com</p>
</div>"""


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    subjects = {}

    for qfolder, part_label, part_title, week_range in be.PARTS:
        for week_num in week_range:
            raw = be.read_md(os.path.join(be.MANUSCRIPT, qfolder, f"week-{week_num:02d}.md"))
            m = re.match(r"^# Week \d+ — (.+)\n", raw)
            week_title = m.group(1) if m else f"Week {week_num}"
            body = raw[m.end():] if m else raw

            email_html = build_email_html(week_num, week_title, body)
            out_path = os.path.join(OUT_DIR, f"week-{week_num:02d}.html")
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(email_html)

            subjects[week_num] = f"Week {week_num}: {week_title} — your setup for the week ahead"

    with open(os.path.join(OUT_DIR, "subjects.json"), "w", encoding="utf-8") as f:
        json.dump(subjects, f, indent=2)

    print(f"Wrote {len(subjects)} weekly emails to {OUT_DIR}")


if __name__ == "__main__":
    main()
