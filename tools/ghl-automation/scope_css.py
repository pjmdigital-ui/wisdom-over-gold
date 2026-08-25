#!/usr/bin/env python3
"""Scope a funnel page's inline <style> block under a wrapper class, and
strip the dev-only comment header / title / meta / local image ref, so the
result is safe to drop into a GHL Custom Code element (which injects into
an existing page, not a standalone document).

Usage: python3 scope_css.py <input.html> <scope-class> <output.html>
"""
import re
import sys

def scope_selector_line(line, scope):
    m = re.match(r'^(\s*)([^{]+)\{(.*)$', line)
    if not m:
        return line
    indent, selectors, rest = m.groups()
    # Skip @media / @keyframes / @font-face block openers themselves.
    if selectors.strip().startswith('@'):
        return line
    parts = [s.strip() for s in selectors.split(',')]
    scoped_parts = []
    for p in parts:
        if p == ':root':
            scoped_parts.append(f'.{scope}')
        elif p == '*':
            scoped_parts.append(f'.{scope} *')
        elif p in ('html', 'body', 'html, body'):
            scoped_parts.append(f'.{scope}')
        else:
            scoped_parts.append(f'.{scope} {p}')
    deduped = list(dict.fromkeys(scoped_parts))
    return f'{indent}{", ".join(deduped)} {{{rest}\n'

def main():
    in_path, scope, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    with open(in_path) as f:
        text = f.read()

    # Strip leading HTML comment block.
    text = re.sub(r'^<!--.*?-->\s*\n', '', text, flags=re.DOTALL)
    # Strip <title> and <meta viewport> lines.
    text = re.sub(r'^<title>.*?</title>\s*\n', '', text, flags=re.MULTILINE)
    text = re.sub(r'^<meta name="viewport".*?>\s*\n', '', text, flags=re.MULTILINE)
    # Strip local cover image tags (won't resolve on the live site).
    text = re.sub(r'\s*<img src="assets/[^"]+"[^>]*>\s*\n?', '\n<!-- Cover image: upload to GHL Media Library and add <img> here. -->\n', text)

    # Split into <style>...</style> and the rest.
    style_match = re.search(r'<style>(.*?)</style>', text, flags=re.DOTALL)
    if not style_match:
        print("No <style> block found", file=sys.stderr)
        sys.exit(1)
    css = style_match.group(1)

    out_lines = []
    for line in css.split('\n'):
        stripped = line.strip()
        if not stripped:
            out_lines.append(line)
            continue
        if stripped.startswith('/*') or stripped.startswith('*') and stripped.endswith('*/'):
            out_lines.append(line)
            continue
        if stripped.startswith('}'):
            out_lines.append(line)
            continue
        if '{' in line:
            out_lines.append(scope_selector_line(line, scope).rstrip('\n'))
        else:
            out_lines.append(line)
    new_css = '\n'.join(out_lines)

    text = text[:style_match.start()] + '<style>' + new_css + '</style>' + text[style_match.end():]

    # Wrap the whole body content (everything after </style>) in a scope div.
    style_end = text.index('</style>') + len('</style>')
    head = text[:style_end]
    body = text[style_end:]
    wrapped = f'{head}\n<div class="{scope}">{body.rstrip()}\n</div>\n'

    with open(out_path, 'w') as f:
        f.write(wrapped)
    print(f"Wrote {out_path}")

if __name__ == '__main__':
    main()
