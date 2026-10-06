#!/usr/bin/env python3
"""Build the "You're In" welcome email for the Seek First Weekly
newsletter -- sent immediately on signup, before the first "Wait until
next Sunday" delay, so a new subscriber isn't left wondering whether
anything happened.

Requires: nothing beyond stdlib (reuses style constants from
build_newsletter_emails.py but doesn't need markdown/manuscript parsing).

Run from anywhere: python3 tools/build_welcome_email.py
Writes to: build/newsletter-emails/welcome.html (gitignored, same as
the 52 weekly emails).

Visual style matches tools/funnel/newsletter.html (the opt-in page):
paper/gold/ink palette, an eyebrow badge, bold headline, checkmark
benefit list -- translated into the same inline-styled, web-safe-font
format as the 52 weekly emails (not the opt-in page's Google Fonts/CSS
classes, which most email clients strip).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_newsletter_emails as bne  # noqa: E402

OUT_PATH = os.path.join(bne.be.REPO, "build", "newsletter-emails", "welcome.html")
SUBJECT = "You're In — Your First Weekly Devotion Arrives Sunday at 8PM"

FONT = bne.FONT
INK = bne.INK
MUTED = bne.MUTED
GOLD = bne.GOLD
CALLOUT_BG = bne.CALLOUT_BG

P = f'margin:0 0 1.5em; {FONT} font-size:16px; line-height:1.7; color:{INK};'
P_MUTED = f'margin:0 0 1.5em; {FONT} font-size:16px; line-height:1.7; color:{MUTED};'

BENEFITS = [
    "One devotion a week &mdash; not another daily inbox obligation",
    "Arrives every Sunday at 8PM, timed to set up your week",
    "Unsubscribe anytime, one click",
]


def benefit_list_html():
    items = "".join(
        f'<li style="position:relative; padding-left:22px; margin:0 0 16px; {FONT} font-size:15px; line-height:1.5; color:{INK};">'
        f'<span style="position:absolute; left:0; color:{GOLD}; font-weight:bold;">&#10003;</span>{b}</li>'
        for b in BENEFITS
    )
    return f'<ul style="list-style:none; margin:0 0 1.6em; padding:0;">{items}</ul>'


def build_welcome_html():
    return f"""<div style="max-width:600px; margin:0 auto; padding:8px 4px;">
<p style="margin:0 0 0.8em; {FONT} font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:{GOLD}; background:{CALLOUT_BG}; display:inline-block; padding:5px 12px; border-radius:999px;">Free Weekly Email</p>
<h1 style="margin:0.8em 0 0.8em; {FONT} font-size:26px; font-weight:bold; color:{INK};">You're In.</h1>
<p style="{P}">Hi {{{{contact.first_name}}}},</p>
<p style="{P}">Thanks for subscribing &mdash; you're officially on the list.</p>
<p style="{P}">Sunday nights used to get to me. When I had a job, it was just the usual Sunday-night blues. But once I became self-employed, it turned into something closer to anxiety &mdash; that quiet nervousness knowing Monday was coming. The bills start again. The world comes back to life. Responsibility kicks back in.</p>
<p style="{P}">So I started writing this weekly devotional as a way to mentally prepare myself for the week ahead &mdash; something to read Sunday night that puts my head in the right place before Monday hits. I think it'll do the same for you.</p>
<p style="margin:0 0 0.8em; {FONT} font-size:16px; line-height:1.7; color:{INK};"><strong>Your first devotion arrives this Sunday at 8PM.</strong></p>
<p style="{P_MUTED}">No need to do anything else. Just watch for it Sunday evening, and it'll be waiting for you to start the week off right.</p>
{benefit_list_html()}
<p style="margin:2.2em 0 0; {FONT} font-size:15px; line-height:1.8; color:{INK};">In faith,<br/>Paul Mascetta</p>
<p style="margin:2.2em 0 0; {FONT} font-size:11px; color:{MUTED}; text-align:center;">Seek First Weekly &middot; wisdomovergold.com</p>
</div>"""


def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(build_welcome_html())
    print("Wrote", OUT_PATH)
    print("Subject:", SUBJECT)


if __name__ == "__main__":
    main()
