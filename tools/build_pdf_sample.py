#!/usr/bin/env python3
"""Build the free "First 4 Weeks" sample PDF for the opt-in funnel lead
magnet, from the 52-week manuscript source.

Requires: pip install weasyprint markdown --break-system-packages
Run from anywhere: python3 tools/build_pdf_sample.py
Writes to: build/Seek First - First 4 Weeks Sample.pdf (gitignored).

Reuses the same parsing/CSS approach as build_pdf.py (the full retail
PDF), just scoped to the Introduction + Part One, Weeks 1-4, plus a
closing CTA page pointing back at the funnel's sales page.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_epub as be  # noqa: E402
import build_pdf as bp  # noqa: E402

from weasyprint import HTML  # noqa: E402

OUT_PATH = os.path.join(be.REPO, "build", "Seek First - First 4 Weeks Sample.pdf")
SAMPLE_WEEKS = range(1, 5)

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
<p class="pursuits">FREE SAMPLE &nbsp;&middot;&nbsp; THE FIRST 4 WEEKS</p>
<p class="verse">&ldquo;But seek first his kingdom and his righteousness, and all these things shall be yours as well.&rdquo;<br/>Matthew 6:33</p>
<p class="author">PAUL MASCETTA</p>
<p class="tagline">Husband. Father. Disciple. Every week.</p>
</div>""")

    # ---- Copyright / permissions page (shortened) ----
    parts.append("""<div class="front copyright-page">
<p>Seek First: The Four Pursuits of the Modern Catholic Man &mdash; Free Sample</p>
<p>Copyright &copy; 2026 PJM Digital Media Corp</p>
<p>Published by Wisdom Over Gold &middot; wisdomovergold.com</p>
<p>This sample contains the Introduction and the first four weeks of the full 52-week devotional. All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the author, except in the case of brief quotations embodied in critical reviews.</p>
</div>""")

    # ---- Introduction ----
    raw = be.read_md(os.path.join(be.FRONT, "introduction.md"))
    raw = re.sub(r"^# .*\n", "", raw, count=1)
    html_body = be.md_to_html(raw)
    parts.append(f'<div class="fm-chapter"><h1>Introduction</h1>{html_body}</div>')

    # ---- Part One divider + Weeks 1-4 ----
    qfolder, part_label, part_title, week_range = be.PARTS[0]
    parts.append(bp.divider_html(part_label, part_title.upper()))

    for week_num in SAMPLE_WEEKS:
        raw = be.read_md(os.path.join(be.MANUSCRIPT, qfolder, f"week-{week_num:02d}.md"))
        m = re.match(r"^# Week \d+ — (.+)\n", raw)
        week_title = m.group(1) if m else f"Week {week_num}"
        body = raw[m.end():] if m else raw
        html_body = be.build_week_html(body)
        parts.append(
            f'<div class="week"><h2 class="week-title">Week {week_num} &mdash; {week_title}</h2>{html_body}</div>'
        )

    # ---- Closing CTA ----
    parts.append("""<div class="cta-page">
<p class="kicker">That's Week 4</p>
<h2>48 Weeks Still Waiting For You</h2>
<p>The rest of the year keeps going where this sample stopped &mdash; Protection, Provision, and Posterity are still ahead. Get the full 52-week devotional today.</p>
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
