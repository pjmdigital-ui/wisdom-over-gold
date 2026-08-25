#!/usr/bin/env python3
"""Build narration-ready plain-text files from the citation-only manuscript,
for recording the audiobook (e.g. an ElevenLabs voice-clone narration pass).

Run from anywhere: python3 tools/build_audio_script.py
Writes to: build/audio-script/ (gitignored; rebuild after manuscript edits).

What this does, per day file:
  - Strips the markdown ** / * emphasis markers (keeping the words)
  - Expands "St."/"Sts." -> "Saint"/"Saints" and "a.m."/"p.m." -> "AM"/"PM"
  - Expands numbered Bible book prefixes ("1 Corinthians" -> "First
    Corinthians") so TTS doesn't read them as "one Corinthians"
  - Drops the trailing bare-caps citation footer line(s) (e.g. "MATTHEW
    6:33") -- redundant for narration since the citation-only manuscript
    always references the verse inline in the prose already
  - Turns the "# Day N -- Title" heading into a spoken lead line

Outputs, all under build/audio-script/:
  - One .txt per day, mirroring the manuscript's quarter/month folders
  - One .txt per front-matter file
  - One combined .txt per month (all that month's days concatenated)
  - One combined full-book .txt
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_epub as be  # noqa: E402

OUT_DIR = os.path.join(be.REPO, "build", "audio-script")

NUM_WORDS = {"1": "First", "2": "Second", "3": "Third"}
NUMBERED_BOOKS = [
    "Chronicles", "Corinthians", "John", "Kings", "Peter",
    "Samuel", "Thessalonians", "Timothy",
]
NUM_BOOK_RE = re.compile(r"\b([123])\s+(" + "|".join(NUMBERED_BOOKS) + r")\b")


def expand_numbered_books(text):
    return NUM_BOOK_RE.sub(lambda m: f"{NUM_WORDS[m.group(1)]} {m.group(2)}", text)


def strip_emphasis(text):
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    return text


def clean_text(text):
    text = strip_emphasis(text)
    text = expand_numbered_books(text)
    text = re.sub(r"\bSts\.", "Saints", text)
    text = re.sub(r"\bSt\.", "Saint", text)
    text = re.sub(r"\ba\.m\.", "AM", text)
    text = re.sub(r"\bp\.m\.", "PM", text)
    return text


def convert_day_file(path):
    raw = be.strip_html_comments(be.read_md(path))
    m = re.match(r"^# Day (\d+) — (.+)\n", raw)
    if not m:
        raise ValueError(f"Unexpected heading format in {path}")
    day_num, title = int(m.group(1)), m.group(2).strip()
    body = raw[m.end():]
    body, _footer = be.split_citation_footer(body)
    heading = f"Day {day_num}: {clean_text(title)}."
    return heading + "\n\n" + clean_text(body).strip() + "\n"


def convert_front_matter_file(path):
    raw = be.strip_html_comments(be.read_md(path))
    m = re.match(r"^# (.+)\n", raw)
    title = m.group(1).strip() if m else ""
    body = raw[m.end():] if m else raw
    body, _footer = be.split_citation_footer(body)
    # Strip underscore "write here" rule lines and bullet-list dashes,
    # specific to your-list-of-truths.md but harmless elsewhere.
    lines = []
    for line in body.split("\n"):
        if re.match(r"^_{5,}\s*$", line):
            continue
        lines.append(re.sub(r"^-\s+", "", line))
    body = "\n".join(lines)
    body = re.sub(r"\n{3,}", "\n\n", body)
    heading = f"{clean_text(title)}." if title else ""
    parts = [p for p in (heading, clean_text(body).strip()) if p]
    return "\n\n".join(parts) + "\n"


def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    all_book_parts = []
    day_count = 0

    # ---- Front matter ----
    front_out = os.path.join(OUT_DIR, "00-front-matter")
    for fname in sorted(os.listdir(be.FRONT)):
        if not fname.endswith(".md"):
            continue
        content = convert_front_matter_file(os.path.join(be.FRONT, fname))
        write(os.path.join(front_out, fname.replace(".md", ".txt")), content)

    # ---- Quarters / months / days ----
    for qfolder, part_label, part_title, months in be.QUARTERS:
        for mfolder, month_name, month_theme in months:
            day_dir = os.path.join(be.MANUSCRIPT, qfolder, mfolder)
            day_files = sorted(
                f for f in os.listdir(day_dir) if re.match(r"day-\d\d\.md$", f)
            )
            month_parts = [f"{month_name.upper()} — {month_theme}\n"]
            for dfname in day_files:
                content = convert_day_file(os.path.join(day_dir, dfname))
                out_path = os.path.join(OUT_DIR, qfolder, mfolder, dfname.replace(".md", ".txt"))
                write(out_path, content)
                month_parts.append(content)
                day_count += 1

            month_combined = "\n\n".join(month_parts)
            write(os.path.join(OUT_DIR, "_combined-by-month", f"{mfolder}.txt"), month_combined)
            all_book_parts.append(month_combined)

    # ---- Full-book combined file ----
    write(os.path.join(OUT_DIR, "_combined-full-book.txt"), "\n\n\n".join(all_book_parts))

    print(f"Wrote {day_count} day files + front matter to {OUT_DIR}")


if __name__ == "__main__":
    main()
