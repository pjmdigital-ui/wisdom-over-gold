#!/usr/bin/env python3
"""Build the free "First 7 Days" sample PDF for the opt-in funnel lead
magnet, from the citation-only manuscript source.

Requires: pip install weasyprint markdown --break-system-packages
Run from anywhere: python3 tools/build_pdf_sample.py
Writes to: build/Seek First - First 7 Days Sample.pdf (gitignored).

Reuses the same parsing/CSS approach as build_pdf.py (the full retail
PDF), just scoped to the Introduction + January Days 1-7, plus a closing
CTA page pointing back at the funnel's sales page.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_epub as be  # noqa: E402
import build_pdf as bp  # noqa: E402

from weasyprint import HTML  # noqa: E402

OUT_PATH = os.path.join(be.REPO, "build", "Seek First - First 7 Days Sample.pdf")

CTA_CSS = """
.cta-page {
    page: main;
    page-break-before: always;
    text-align: center;
    margin-top: 2.6in;
}
.cta-page .kicker {
    font-family: "Spectral", Georgia, serif;
    font-style: italic;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-size: 10pt;
    color: #93691f;
    margin-bottom: 0.2in;
}
.cta-page h2 {
    font-size: 19pt;
    margin: 0 0 0.25in;
}
.cta-page p {
    text-align: center;
    font-size: 11pt;
    color: #6b5c42;
    max-width: 4in;
    margin: 0 auto 0.35in;
}
.cta-page .link {
    font-family: "Spectral", Georgia, serif;
    font-weight: 700;
    font-size: 12pt;
    color: #93691f;
}
.sample-badge {
    page: front;
}
"""


def main():
    parts = []

    # ---- Cover ----
    parts.append(f'<div class="cover-page"><img src="{bp.cover_data_uri()}" /></div>')

    # ---- Title page (sample framing) ----
    parts.append("""<div class="front titlepage">
<h1>SEEK FIRST</h1>
<p class="subtitle">The Four Pursuits of the Modern Catholic Man</p>
<p class="pursuits">FREE SAMPLE &nbsp;&middot;&nbsp; THE FIRST 7 DAYS</p>
<p class="verse">&ldquo;But seek first his kingdom and his righteousness, and all these things shall be yours as well.&rdquo;<br/>Matthew 6:33</p>
<p class="author">PAUL MASCETTA</p>
<p class="tagline">Husband. Father. Disciple. Every day.</p>
</div>""")

    # ---- Copyright / permissions page (shortened) ----
    parts.append("""<div class="front copyright-page">
<p>Seek First: The Four Pursuits of the Modern Catholic Man &mdash; Free Sample</p>
<p>Copyright &copy; 2026 PJM Digital Media Corp</p>
<p>Published by Wisdom Over Gold &middot; wisdomovergold.com</p>
<p>This sample contains the Introduction and the first seven days of the full 365-day devotional. All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the author, except in the case of brief quotations embodied in critical reviews.</p>
</div>""")

    # ---- Introduction ----
    raw = be.read_md(os.path.join(be.FRONT, "introduction.md"))
    raw = re.sub(r"^# .*\n", "", raw, count=1)
    html_body = be.md_to_html(raw)
    parts.append(f'<div class="fm-chapter"><h1>Introduction</h1>{html_body}</div>')

    # ---- January divider + Days 1-7 ----
    q1 = be.QUARTERS[0]
    qfolder, part_label, part_title, months = q1
    jan = months[0]
    mfolder, month_name, month_theme = jan

    parts.append(bp.divider_html(part_label, part_title.upper()))
    parts.append(bp.divider_html(part_title, month_name.upper(), month_theme))

    day_dir = os.path.join(be.MANUSCRIPT, qfolder, mfolder)
    day_files = sorted(f for f in os.listdir(day_dir) if re.match(r"day-0[1-7]\.md$", f))
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

    # ---- Closing CTA ----
    parts.append("""<div class="cta-page">
<p class="kicker">That's Day 7</p>
<h2>358 Days Still Waiting For You</h2>
<p>The rest of the year keeps going where this sample stopped &mdash; Protection, Provision, and Posterity are still ahead. Get the full 365-day devotional today.</p>
<p class="link">wisdomovergold.com</p>
</div>""")

    full_html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>{bp.CSS}{CTA_CSS}</style></head>
<body>{''.join(parts)}</body></html>"""

    HTML(string=full_html).write_pdf(OUT_PATH)
    print("Wrote", OUT_PATH)
    print("Total sections:", len(parts))


if __name__ == "__main__":
    main()
