#!/usr/bin/env python3
"""Build the retail PDF from the citation-only manuscript source.

Requires: pip install weasyprint markdown --break-system-packages
Run from anywhere: python3 tools/build_pdf.py
Writes to: build/Seek First - Paul Mascetta.pdf (gitignored; rebuild after
any manuscript edit rather than expecting the output file to be committed).

Reuses the manuscript parsing/markdown helpers from build_epub.py so the
two builds never drift out of sync with each other.
"""
import os
import re
import sys
import base64

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_epub as be  # noqa: E402

from weasyprint import HTML  # noqa: E402

OUT_PATH = os.path.join(be.REPO, "build", "Seek First - Paul Mascetta.pdf")


def font_data_uri(fname):
    with open(os.path.join(be.FONT_DIR, fname), "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:font/ttf;base64,{b64}"


def cover_data_uri():
    with open(be.COVER_PATH, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:image/png;base64,{b64}"


FONT_FACES = "\n".join(
    f"""@font-face {{
    font-family: '{family}';
    font-weight: {weight};
    font-style: {style};
    src: url({font_data_uri(fname)}) format('truetype');
}}"""
    for fname, family, weight, style in be.FONTS
)

CSS = f"""
{FONT_FACES}

@page {{
    size: 6in 9in;
    margin: 0.7in 0.75in 0.85in 0.75in;
}}

@page main {{
    @bottom-left {{
        content: "Seek First";
        font-family: "Source Serif 4", Georgia, serif;
        font-style: italic;
        font-size: 8.5pt;
        color: #93691f;
    }}
    @bottom-right {{
        content: "Page " counter(page);
        font-family: "Source Serif 4", Georgia, serif;
        font-size: 8.5pt;
        color: #6b5c42;
    }}
}}

@page cover {{
    margin: 0;
}}

* {{ box-sizing: border-box; }}

html, body {{
    margin: 0;
    padding: 0;
    color: #2b2318;
    font-family: "Source Serif 4", Georgia, "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
    font-size: 10.5pt;
    line-height: 1.55;
}}

h1, h2, h3 {{
    font-family: "Spectral", Georgia, serif;
    font-weight: 700;
    color: #2b2318;
    line-height: 1.2;
}}

p {{
    margin: 0 0 0.85em 0;
    text-align: justify;
    orphans: 3;
    widows: 3;
}}

/* ---------- Cover ---------- */
.cover-page {{
    page: cover;
    page-break-after: always;
    width: 6in;
    height: 9in;
    margin: 0;
    padding: 0;
}}
.cover-page img {{
    width: 6in;
    height: 9in;
    display: block;
    object-fit: cover;
}}

/* ---------- Title / copyright / TOC (front matter, no footer) ---------- */
.front {{
    page: front;
    page-break-after: always;
}}
@page front {{
    @bottom-left {{ content: none; }}
    @bottom-right {{ content: none; }}
}}

.titlepage {{
    text-align: center;
    margin-top: 1.3in;
}}
.titlepage h1 {{
    font-size: 27pt;
    letter-spacing: 0.03em;
    margin: 0 0 0.15in;
}}
.titlepage .subtitle {{
    font-size: 13pt;
    font-style: italic;
    color: #6b5c42;
    margin: 0 0 0.5in;
}}
.titlepage .pursuits {{
    font-size: 9pt;
    letter-spacing: 0.06em;
    color: #93691f;
    margin: 0 0 0.6in;
}}
.titlepage .verse {{
    font-style: italic;
    color: #6b5c42;
    font-size: 10pt;
    margin-bottom: 0.7in;
}}
.titlepage .author {{
    font-family: "Spectral", Georgia, serif;
    font-size: 15pt;
    font-weight: 700;
    margin-bottom: 0.05in;
}}
.titlepage .tagline {{
    font-size: 8.5pt;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #93691f;
}}

.copyright-page {{
    margin-top: 1.4in;
    font-size: 8.5pt;
    color: #6b5c42;
    line-height: 1.6;
}}
.copyright-page p {{ text-align: left; }}

.toc-page h2 {{
    font-size: 15pt;
    text-align: center;
    margin: 0 0 0.35in;
}}
.toc-page .toc-part {{
    font-weight: 700;
    color: #93691f;
    letter-spacing: 0.03em;
    margin: 0.22in 0 0.05in;
    font-size: 9.5pt;
    text-transform: uppercase;
}}
.toc-page .toc-month {{
    font-size: 9.5pt;
    margin: 0 0 0.03in 0.18in;
    color: #2b2318;
}}

/* ---------- Quarter / month dividers ---------- */
.divider-page {{
    page: main;
    page-break-before: always;
    text-align: center;
    margin-top: 3.4in;
}}
.divider-kicker {{
    font-family: "Spectral", Georgia, serif;
    font-style: italic;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-size: 10pt;
    color: #93691f;
    margin-bottom: 0.15in;
}}
.divider-title {{
    font-size: 20pt;
    margin: 0.05in 0;
}}
.divider-sub {{
    font-size: 11pt;
    font-style: italic;
    color: #6b5c42;
    margin-top: 0.1in;
}}

/* ---------- Front-matter chapters (Introduction, etc.) ---------- */
.fm-chapter {{
    page: main;
    page-break-before: always;
}}
.fm-chapter h1 {{
    font-size: 15pt;
    text-align: center;
    margin: 0 0 0.3in;
}}

/* ---------- Days ---------- */
.day {{
    page: main;
    page-break-before: always;
}}
.day-title {{
    font-style: italic;
    font-weight: 600;
    font-size: 13.5pt;
    border-bottom: 1px solid #d8c79a;
    padding-bottom: 0.08in;
    margin-bottom: 0.22in;
}}

.saint-callout, .today-step, .prayer-block {{
    margin: 0.9em 0;
    padding: 0.6em 0.75em;
    border-left: 2.5px solid #93691f;
    background: #ece0c0;
    text-align: left;
}}
.prayer-block {{
    border-left-color: #b3822a;
    background: #f0e6c9;
    font-style: italic;
}}

.scripture-ref {{
    margin-top: 1.1em;
    text-align: center;
    font-style: normal;
    font-size: 8pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #93691f;
}}
"""


def divider_html(kicker, title, subtitle=""):
    sub = f'<p class="divider-sub">{subtitle}</p>' if subtitle else ""
    return f"""<div class="divider-page">
<p class="divider-kicker">{kicker}</p>
<p class="divider-title">{title}</p>
{sub}
</div>"""


def build_toc_html():
    rows = []
    for _, part_label, part_title, months in be.QUARTERS:
        rows.append(f'<p class="toc-part">{part_label}: {part_title}</p>')
        for _, month_name, month_theme in months:
            rows.append(f'<p class="toc-month">{month_name} &mdash; {month_theme}</p>')
    return f"""<div class="front toc-page">
<h2>Contents</h2>
{''.join(rows)}
</div>"""


def main():
    parts = []

    # ---- Cover ----
    parts.append(f'<div class="cover-page"><img src="{cover_data_uri()}" /></div>')

    # ---- Title page ----
    parts.append("""<div class="front titlepage">
<h1>SEEK FIRST</h1>
<p class="subtitle">The Four Pursuits of the Modern Catholic Man</p>
<p class="pursuits">THE PURSUIT OF PIETY &nbsp;&middot;&nbsp; THE PURSUIT OF PROTECTION &nbsp;&middot;&nbsp; THE PURSUIT OF PROVISION &nbsp;&middot;&nbsp; THE PURSUIT OF POSTERITY</p>
<p class="verse">&ldquo;But seek first his kingdom and his righteousness, and all these things shall be yours as well.&rdquo;<br/>Matthew 6:33</p>
<p class="author">PAUL MASCETTA</p>
<p class="tagline">Husband. Father. Disciple. Every day.</p>
</div>""")

    # ---- Copyright page ----
    scripture_notice = be.strip_html_comments(be.read_md(os.path.join(be.FRONT, "scripture-notice.md")))
    scripture_notice_html = be.md_to_html(re.sub(r"^# Scripture Notice\s*\n", "", scripture_notice))
    parts.append(f"""<div class="front copyright-page">
<p>Seek First: The Four Pursuits of the Modern Catholic Man</p>
<p>Copyright &copy; 2026 PJM Digital Media Corp</p>
<p>Published by Wisdom Over Gold &middot; wisdomovergold.com</p>
<p>All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the author, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.</p>
{scripture_notice_html}
<p>This is a work of nonfiction. Except where the author explicitly identifies an account as his own true story (most notably in the Introduction), the real-world scenarios that open each daily entry are illustrative composites and do not depict specific, identifiable individuals or events.</p>
</div>""")

    # ---- TOC ----
    parts.append(build_toc_html())

    # ---- Front matter chapters ----
    front_matter_files = [
        ("introduction.md", "Introduction"),
        ("a-note-on-these-stories.md", "A Note on These Stories"),
        ("a-daily-prayer.md", "A Daily Prayer"),
        ("your-list-of-truths.md", "Your List of Truths"),
    ]
    for fname, nice_title in front_matter_files:
        raw = be.read_md(os.path.join(be.FRONT, fname))
        raw = re.sub(r"^# .*\n", "", raw, count=1)
        html_body = be.md_to_html(raw)
        parts.append(f'<div class="fm-chapter"><h1>{nice_title}</h1>{html_body}</div>')

    # ---- Quarters / months / days ----
    for qfolder, part_label, part_title, months in be.QUARTERS:
        parts.append(divider_html(part_label, part_title.upper()))
        for mfolder, month_name, month_theme in months:
            parts.append(divider_html(part_title, month_name.upper(), month_theme))
            day_dir = os.path.join(be.MANUSCRIPT, qfolder, mfolder)
            day_files = sorted(f for f in os.listdir(day_dir) if re.match(r"day-\d\d\.md$", f))
            for dfname in day_files:
                raw = be.read_md(os.path.join(day_dir, dfname))
                m = re.match(r"^# (.+)\n", raw)
                day_title = m.group(1) if m else dfname
                body = raw[m.end():] if m else raw
                body, footer_lines = be.split_citation_footer(body)
                html_body = be.md_to_html(body)
                ref_html = ""
                if footer_lines:
                    ref_text = " &middot; ".join(be.title_case_ref(l) for l in footer_lines)
                    ref_html = f'<p class="scripture-ref">{ref_text}</p>'
                parts.append(f'<div class="day"><h2 class="day-title">{day_title}</h2>{html_body}{ref_html}</div>')

    full_html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>{CSS}</style></head>
<body>{''.join(parts)}</body></html>"""

    HTML(string=full_html).write_pdf(OUT_PATH)
    print("Wrote", OUT_PATH)
    print("Total day/front sections:", len(parts))


if __name__ == "__main__":
    main()
