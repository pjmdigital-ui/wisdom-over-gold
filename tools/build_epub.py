#!/usr/bin/env python3
"""Build the retail EPUB from the manuscript source.

Requires: pip install ebooklib markdown
Run from anywhere: python3 tools/build_epub.py
Writes to: build/Seek First - Paul Mascetta.epub (gitignored; rebuild after any
manuscript edit rather than expecting the output file to be committed).

Validate with: pip install epubcheck && python3 -m epubcheck "build/Seek First - Paul Mascetta.epub"
"""
import os
import re
import markdown as md
from ebooklib import epub

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANUSCRIPT = os.path.join(REPO, "manuscript-citation-only")
FRONT = os.path.join(MANUSCRIPT, "00-front-matter")
COVER_PATH = os.path.join(REPO, "manuscript", "Seek First Cover.png")
OUT_PATH = os.path.join(REPO, "build", "Seek First - Paul Mascetta.epub")
FONT_DIR = os.path.join(REPO, "tools", "fonts")

# Embedded fonts: (file, family, weight, style)
FONTS = [
    ("SourceSerif4-Regular.ttf", "Source Serif 4", "400", "normal"),
    ("SourceSerif4-Italic.ttf", "Source Serif 4", "400", "italic"),
    ("SourceSerif4-SemiBold.ttf", "Source Serif 4", "600", "normal"),
    ("Spectral-SemiBold.ttf", "Spectral", "600", "normal"),
    ("Spectral-SemiBoldItalic.ttf", "Spectral", "600", "italic"),
    ("Spectral-Bold.ttf", "Spectral", "700", "normal"),
]

QUARTERS = [
    ("q1-pursuit-of-piety", "Part One", "The Pursuit of Piety", [
        ("01-january-god-first", "January", "God First"),
        ("02-february-sacrifice-and-struggle", "February", "Sacrifice & Struggle"),
        ("03-march-faith-under-doubt", "March", "Faith Under Doubt"),
    ]),
    ("q2-pursuit-of-protection", "Part Two", "The Pursuit of Protection", [
        ("04-april-integrity-and-character", "April", "Integrity & Character"),
        ("05-may-patience-and-anger-management", "May", "Patience & Anger Management"),
        ("06-june-friendship-and-brotherhood", "June", "Friendship & Brotherhood"),
    ]),
    ("q3-pursuit-of-provision", "Part Three", "The Pursuit of Provision", [
        ("07-july-work-and-vocation", "July", "Work & Vocation"),
        ("08-august-personal-finance-and-stewardship", "August", "Personal Finance & Stewardship"),
        ("09-september-leading-the-household", "September", "Leading the Household"),
    ]),
    ("q4-pursuit-of-posterity", "Part Four", "The Pursuit of Posterity", [
        ("10-october-marriage-and-love", "October", "Marriage & Love"),
        ("11-november-fatherhood-fundamentals", "November", "Fatherhood Fundamentals"),
        ("12-december-hope-and-presence", "December", "Hope & Presence"),
    ]),
]

FONT_FACES = "\n".join(
    f"""@font-face {{
    font-family: '{family}';
    font-weight: {weight};
    font-style: {style};
    src: url(../fonts/{fname}) format('truetype');
}}"""
    for fname, family, weight, style in FONTS
)

CSS_CONTENT = f"""
@namespace epub "http://www.idpf.org/2007/ops";

{FONT_FACES}

body {{
    font-family: "Source Serif 4", Georgia, "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
    color: #2b2318;
    line-height: 1.55;
    margin: 0;
    padding: 0 1em;
}}

h1, h2, h3 {{
    font-family: "Spectral", Georgia, "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
    font-weight: 700;
    color: #2b2318;
    line-height: 1.2;
}}

.divider-page {{
    text-align: center;
    margin-top: 35%;
}}

.divider-kicker {{
    font-family: "Spectral", Georgia, serif;
    font-style: italic;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-size: 0.85em;
    color: #93691f;
    margin-bottom: 0.5em;
}}

.divider-title {{
    font-family: "Spectral", Georgia, serif;
    font-size: 2em;
    font-weight: 700;
    margin: 0.2em 0;
}}

.divider-sub {{
    font-size: 1.1em;
    font-style: italic;
    margin-top: 0.4em;
    color: #6b5c42;
}}

.day-title {{
    font-family: "Spectral", Georgia, serif;
    font-weight: 600;
    font-style: italic;
    font-size: 1.5em;
    border-bottom: 1px solid #d8c79a;
    padding-bottom: 0.3em;
    margin-bottom: 1em;
    color: #2b2318;
}}

p {{
    margin: 0 0 1em 0;
    text-align: justify;
}}

.saint-callout, .today-step, .prayer-block {{
    margin: 1.3em 0;
    padding: 0.8em 1em;
    border-left: 3px solid #93691f;
    background: #ece0c0;
}}

.prayer-block {{
    border-left-color: #b3822a;
    background: #f0e6c9;
    font-style: italic;
}}

.titlepage {{
    text-align: center;
    margin-top: 25%;
}}

.titlepage h1 {{
    font-family: "Spectral", Georgia, serif;
    font-size: 2.6em;
    margin-bottom: 0.1em;
    letter-spacing: 0.02em;
}}

.titlepage .subtitle {{
    font-size: 1.3em;
    font-style: italic;
    margin: 0.6em 0 1.5em 0;
    color: #6b5c42;
}}

.titlepage .pursuits {{
    font-size: 0.95em;
    letter-spacing: 0.05em;
    margin: 1.5em 0;
    color: #93691f;
}}

.titlepage .verse {{
    font-style: italic;
    margin-top: 2em;
    color: #6b5c42;
}}

.titlepage .author {{
    font-family: "Spectral", Georgia, serif;
    font-size: 1.4em;
    font-weight: 700;
    margin-top: 2.5em;
}}

.titlepage .tagline {{
    font-size: 0.85em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #93691f;
}}

.copyright-page {{
    font-size: 0.85em;
    margin-top: 40%;
    color: #6b5c42;
}}

.scripture-ref {{
    margin-top: 1.6em;
    text-align: center;
    font-style: normal;
    font-size: 0.8em;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #93691f;
}}
"""


def md_to_html(text):
    body = md.markdown(text.strip(), extensions=["extra"])
    # style the fixed-format callout lines
    body = re.sub(
        r"<p><strong>On ([^:]+):</strong>",
        r'<p class="saint-callout"><strong>On \1:</strong>',
        body,
    )
    body = re.sub(
        r"<p><strong>Today:</strong>",
        r'<p class="today-step"><strong>Today:</strong>',
        body,
    )
    body = re.sub(
        r"<p><strong>Prayer:</strong>",
        r'<p class="prayer-block"><strong>Prayer:</strong>',
        body,
    )
    return body


def read_md(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def strip_html_comments(text):
    return re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL).strip()


def title_case_ref(line):
    words = line.strip().split(" ")
    out = []
    for w in words:
        out.append(w if re.match(r"^[\d:.,-]+$", w) else w[:1].upper() + w[1:].lower())
    return " ".join(out)


def split_citation_footer(raw):
    """Citation-only day files end with one or more bare, ALL-CAPS verse
    reference lines (e.g. MATTHEW 6:33). Pull those off so they can be
    rendered as a small styled reference line instead of a shouting
    paragraph in the middle of the prose."""
    paras = re.split(r"\n\s*\n", raw.strip())
    footer_lines = []
    while paras and paras[-1].strip() and not re.search(r"[a-z]", paras[-1]):
        block = paras.pop()
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        footer_lines = lines + footer_lines
    body = "\n\n".join(paras)
    return body, footer_lines


def make_chapter(uid, title, html_body, filename):
    c = epub.EpubHtml(title=title, file_name=filename, lang="en")
    c.content = f"<html><body>{html_body}</body></html>"
    return c


def divider_html(kicker, title, subtitle=""):
    sub = f'<p class="divider-sub">{subtitle}</p>' if subtitle else ""
    return f"""<div class="divider-page">
<p class="divider-kicker">{kicker}</p>
<p class="divider-title">{title}</p>
{sub}
</div>"""


def main():
    book = epub.EpubBook()
    book.set_identifier("seek-first-mascetta")
    book.set_title("Seek First: The Four Pursuits of the Modern Catholic Man")
    book.set_language("en")
    book.add_author("Paul Mascetta")
    book.add_metadata("DC", "description", "A 365-day devotional for Catholic fathers and family men, built around four pursuits: Piety, Protection, Provision, and Posterity.")
    book.add_metadata("DC", "subject", "Religion & Spirituality / Christian Living")
    book.add_metadata("DC", "rights", "Copyright (c) Paul Mascetta. All rights reserved.")
    book.add_metadata("DC", "publisher", "Wisdom Over Gold")

    with open(COVER_PATH, "rb") as f:
        book.set_cover("cover.png", f.read())
    for item in book.items:
        if item.get_id() == "cover":
            item.is_linear = True

    css = epub.EpubItem(uid="style_main", file_name="style/main.css", media_type="text/css", content=CSS_CONTENT)
    book.add_item(css)

    for i, (fname, family, weight, style) in enumerate(FONTS):
        with open(os.path.join(FONT_DIR, fname), "rb") as f:
            font_item = epub.EpubItem(
                uid=f"font_{i}",
                file_name=f"fonts/{fname}",
                media_type="application/font-sfnt",
                content=f.read(),
            )
        book.add_item(font_item)

    spine = ["cover", "nav"]
    toc = []
    chapter_count = 0

    def add_chapter(title, html_body, in_toc=True, css_link=True):
        nonlocal chapter_count
        chapter_count += 1
        fname = f"chap_{chapter_count:04d}.xhtml"
        c = make_chapter(f"c{chapter_count}", title, html_body, fname)
        if css_link:
            c.add_item(css)
        book.add_item(c)
        spine.append(c)
        if in_toc:
            toc.append(c)
        return c

    # ---- Title page ----
    title_html = """<div class="titlepage">
<h1>SEEK FIRST</h1>
<p class="subtitle">The Four Pursuits of the Modern Catholic Man</p>
<p class="pursuits">THE PURSUIT OF PIETY &nbsp;&middot;&nbsp; THE PURSUIT OF PROTECTION &nbsp;&middot;&nbsp; THE PURSUIT OF PROVISION &nbsp;&middot;&nbsp; THE PURSUIT OF POSTERITY</p>
<p class="verse">&ldquo;But seek first his kingdom and his righteousness, and all these things shall be yours as well.&rdquo;<br/>Matthew 6:33, RSV-CE</p>
<p class="author">PAUL MASCETTA</p>
<p class="tagline">Husband. Father. Disciple. Every day.</p>
</div>"""
    add_chapter("Title Page", title_html, in_toc=False)

    # ---- Copyright page ----
    scripture_notice = strip_html_comments(read_md(os.path.join(FRONT, "scripture-notice.md")))
    scripture_notice_html = md_to_html(re.sub(r"^# Scripture Notice\s*\n", "", scripture_notice))
    copyright_html = f"""<div class="copyright-page">
<p>Seek First: The Four Pursuits of the Modern Catholic Man</p>
<p>Copyright &copy; 2026 Paul Mascetta</p>
<p>Published by Wisdom Over Gold &middot; wisdomovergold.com</p>
<p>All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the author, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.</p>
{scripture_notice_html}
<p>This is a work of nonfiction. Except where the author explicitly identifies an account as his own true story (most notably in the Introduction), the real-world scenarios that open each daily entry are illustrative composites and do not depict specific, identifiable individuals or events.</p>
</div>"""
    add_chapter("Copyright", copyright_html, in_toc=False)

    # ---- Front matter (in TOC) ----
    front_matter_files = [
        ("introduction.md", "Introduction"),
        ("a-note-on-these-stories.md", "A Note on These Stories"),
        ("a-daily-prayer.md", "A Daily Prayer"),
        ("your-list-of-truths.md", "Your List of Truths"),
    ]
    for fname, nice_title in front_matter_files:
        raw = read_md(os.path.join(FRONT, fname))
        raw = re.sub(r"^# .*\n", "", raw, count=1)  # strip the markdown H1, we render our own
        html_body = f"<h1>{nice_title}</h1>" + md_to_html(raw)
        add_chapter(nice_title, html_body)

    # ---- Quarters / Months / Days ----
    nested_toc = []
    for qfolder, part_label, part_title, months in QUARTERS:
        qdiv_html = divider_html(part_label, part_title.upper())
        qchap = add_chapter(f"{part_label}: {part_title}", qdiv_html, in_toc=False)
        month_links = []
        for mfolder, month_name, month_theme in months:
            mdiv_html = divider_html(part_title, month_name.upper(), month_theme)
            mchap = add_chapter(f"{month_name} — {month_theme}", mdiv_html, in_toc=False)
            day_dir = os.path.join(MANUSCRIPT, qfolder, mfolder)
            day_files = sorted(
                f for f in os.listdir(day_dir) if re.match(r"day-\d\d\.md$", f)
            )
            day_chaps = []
            for dfname in day_files:
                raw = read_md(os.path.join(day_dir, dfname))
                first_line_match = re.match(r"^# (.+)\n", raw)
                day_title = first_line_match.group(1) if first_line_match else dfname
                body = raw[first_line_match.end():] if first_line_match else raw
                body, footer_lines = split_citation_footer(body)
                html_body = f'<h1 class="day-title">{day_title}</h1>' + md_to_html(body)
                if footer_lines:
                    ref_text = " &middot; ".join(title_case_ref(l) for l in footer_lines)
                    html_body += f'<p class="scripture-ref">{ref_text}</p>'
                dchap = add_chapter(day_title, html_body, in_toc=False)
                day_chaps.append(dchap)
            month_section = epub.Section(f"{month_name} — {month_theme}", href=mchap.file_name)
            month_links.append((month_section, day_chaps))
        part_section = epub.Section(f"{part_label}: {part_title}", href=qchap.file_name)
        nested_toc.append((part_section, month_links))

    book.toc = tuple(toc + nested_toc)

    book.add_item(epub.EpubNcx())
    nav = epub.EpubNav()
    book.add_item(nav)
    spine_final = []
    for item in spine:
        spine_final.append(item)
    book.spine = spine_final

    epub.write_epub(OUT_PATH, book, {"epub3_pages": False})
    print("Wrote", OUT_PATH)
    print("Total chapter files:", chapter_count)


if __name__ == "__main__":
    main()
