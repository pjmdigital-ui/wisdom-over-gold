#!/usr/bin/env python3
"""Build the retail EPUB from the 52-week manuscript source.

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
MANUSCRIPT = os.path.join(REPO, "manuscript-52-week")
FRONT = os.path.join(MANUSCRIPT, "00-front-matter")
BACK = os.path.join(MANUSCRIPT, "90-back-matter")
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

# Four parts, 13 weeks each (52 total). Week files live at
# manuscript-52-week/<qfolder>/week-NN.md, each starting with its own
# "# Week N — Title" line.
PARTS = [
    ("q1-pursuit-of-piety", "Part One", "The Pursuit of Piety", range(1, 14)),
    ("q2-pursuit-of-protection", "Part Two", "The Pursuit of Protection", range(14, 27)),
    ("q3-pursuit-of-provision", "Part Three", "The Pursuit of Provision", range(27, 40)),
    ("q4-pursuit-of-posterity", "Part Four", "The Pursuit of Posterity", range(40, 53)),
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

.week-title {{
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

.today-step p, .prayer-block p {{
    margin: 0 0 0.8em 0;
    text-align: left;
}}
.today-step p:last-child, .prayer-block p:last-child {{ margin-bottom: 0; }}

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
    return md.markdown(text.strip(), extensions=["extra"])


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
    """Week files end with one or more bare, ALL-CAPS verse reference
    lines (e.g. MATTHEW 6:33). Pull those off so they can be rendered as
    a small styled reference line instead of a shouting paragraph in the
    middle of the prose."""
    paras = re.split(r"\n\s*\n", raw.strip())
    footer_lines = []
    while paras and paras[-1].strip() and not re.search(r"[a-z]", paras[-1]):
        block = paras.pop()
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        footer_lines = lines + footer_lines
    body = "\n\n".join(paras)
    # the 52-week source wraps its citation lines in markdown bold
    # (**MATTHEW 6:33**) -- strip that before title-casing, or the
    # asterisks get title-cased right along with the words.
    footer_lines = [l.strip("*").strip() for l in footer_lines]
    return body, footer_lines


def split_week_sections(raw):
    """A week's body is: main reflection, then a "### This Week" section
    (one or more paragraphs of practical application), then a
    "### Prayer" section (the closing prayer). Split on those headings
    so each piece can get its own styled callout box."""
    parts = re.split(r"(?m)^### This Week\s*$", raw, maxsplit=1)
    main = parts[0]
    rest = parts[1] if len(parts) > 1 else ""
    parts2 = re.split(r"(?m)^### Prayer\s*$", rest, maxsplit=1)
    this_week = parts2[0]
    prayer = parts2[1] if len(parts2) > 1 else ""
    return main.strip(), this_week.strip(), prayer.strip()


def wrap_labeled_section(raw_text, label, css_class):
    """Render a (possibly multi-paragraph) section as a styled callout
    box whose first paragraph opens with a bold label, matching the
    visual treatment the old day-by-day book used for its single-line
    "Today:"/"Prayer:" callouts."""
    if not raw_text:
        return ""
    paras = raw_text.split("\n\n", 1)
    first = f"**{label}:** {paras[0]}"
    combined = first + ("\n\n" + paras[1] if len(paras) > 1 else "")
    return f'<div class="{css_class}">{md_to_html(combined)}</div>'


def build_week_html(raw_body):
    """Full HTML for one week's body: main reflection + This Week callout
    + Prayer callout + scripture reference line."""
    body, footer_lines = split_citation_footer(raw_body)
    main, this_week, prayer = split_week_sections(body)
    html_body = md_to_html(main)
    html_body += wrap_labeled_section(this_week, "This Week", "today-step")
    html_body += wrap_labeled_section(prayer, "Prayer", "prayer-block")
    if footer_lines:
        ref_text = " &middot; ".join(title_case_ref(l) for l in footer_lines)
        html_body += f'<p class="scripture-ref">{ref_text}</p>'
    return html_body


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
    book.add_metadata("DC", "description", "A 52-week devotional for Catholic fathers and family men, built around four pursuits: Piety, Protection, Provision, and Posterity.")
    book.add_metadata("DC", "subject", "Religion & Spirituality / Christian Living")
    book.add_metadata("DC", "rights", "Copyright (c) PJM Digital Media Corp. All rights reserved.")
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
<p class="tagline">Husband. Father. Disciple. Every week.</p>
</div>"""
    add_chapter("Title Page", title_html, in_toc=False)

    # ---- Copyright page ----
    scripture_notice = strip_html_comments(read_md(os.path.join(FRONT, "scripture-notice.md")))
    scripture_notice_html = md_to_html(re.sub(r"^# Scripture Notice\s*\n", "", scripture_notice))
    copyright_html = f"""<div class="copyright-page">
<p>Seek First: The Four Pursuits of the Modern Catholic Man</p>
<p>Copyright &copy; 2026 PJM Digital Media Corp</p>
<p>Published by Wisdom Over Gold &middot; wisdomovergold.com</p>
<p>All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the author, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.</p>
{scripture_notice_html}
<p>This is a work of nonfiction. Except where the author explicitly identifies an account as his own true story (most notably in the Introduction), the real-world scenarios that open each weekly entry are illustrative composites and do not depict specific, identifiable individuals or events.</p>
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

    # ---- Parts / Weeks ----
    nested_toc = []
    for qfolder, part_label, part_title, week_range in PARTS:
        qdiv_html = divider_html(part_label, part_title.upper())
        qchap = add_chapter(f"{part_label}: {part_title}", qdiv_html, in_toc=False)
        week_chaps = []
        for week_num in week_range:
            wpath = os.path.join(MANUSCRIPT, qfolder, f"week-{week_num:02d}.md")
            raw = read_md(wpath)
            m = re.match(r"^# Week \d+ — (.+)\n", raw)
            week_title = m.group(1) if m else f"Week {week_num}"
            body = raw[m.end():] if m else raw
            html_body = f'<h1 class="week-title">Week {week_num} — {week_title}</h1>' + build_week_html(body)
            wchap = add_chapter(f"Week {week_num} — {week_title}", html_body, in_toc=False)
            week_chaps.append(wchap)
        part_section = epub.Section(f"{part_label}: {part_title}", href=qchap.file_name)
        nested_toc.append((part_section, week_chaps))

    # ---- Conclusion (back matter, in TOC) ----
    conclusion_raw = read_md(os.path.join(BACK, "conclusion.md"))
    cm = re.match(r"^# (.+)\n", conclusion_raw)
    conclusion_title = cm.group(1) if cm else "A Final Word"
    conclusion_body = conclusion_raw[cm.end():] if cm else conclusion_raw
    # The conclusion also contains its own "## Before You Close This Book"
    # sub-section with a "### Prayer" of its own -- render the whole thing
    # as flowing markdown rather than forcing it through the week-callout
    # splitter, since it isn't shaped like a week entry.
    conclusion_html = f"<h1>{conclusion_title}</h1>" + md_to_html(conclusion_body)
    conclusion_chap = add_chapter(conclusion_title, conclusion_html, in_toc=False)

    # NOTE: the conclusion is physically the LAST chapter in spine (it's
    # added after every Part/Week chapter above), so it must come after
    # nested_toc in book.toc too -- putting it in the flat front-matter
    # `toc` list would place it before the Parts in the nav document,
    # which epubcheck flags as the TOC being out of spine/reading order.
    book.toc = tuple(toc + nested_toc + [conclusion_chap])

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
