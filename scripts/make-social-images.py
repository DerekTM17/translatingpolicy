#!/usr/bin/env python3
"""Render the link-preview image and the Apple touch icon into public/.

    python3 scripts/make-social-images.py

Outputs:
  public/og-image.png          1200x630, shown when the site is shared
  public/apple-touch-icon.png  180x180, the favicon on the site's dark field

Uses Python Playwright (headless Chromium) so the real site fonts load from
Google Fonts, the same way the page gets them. Nothing here is a build-time
dependency: run it by hand when the text or the colors change, then commit
the PNGs. Colors mirror src/styles/tokens.css.
"""
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'

FONTS = (
    'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700'
    '&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&display=block'
)

OG_HTML = f"""<!doctype html>
<html><head><meta charset="utf-8">
<link href="{FONTS}" rel="stylesheet">
<style>
  :root {{
    --void: #010509; --void-mid: #031020; --glow: #00b4ff;
    --ink: rgba(214, 238, 255, 0.92); --ink-dim: rgba(150, 200, 235, 0.62);
    --line: rgba(0, 180, 255, 0.16); --accent: #ff6a00;
  }}
  * {{ margin: 0; box-sizing: border-box; }}
  html, body {{ width: 1200px; height: 630px; }}
  body {{
    position: relative; overflow: hidden; color: var(--ink);
    background:
      radial-gradient(ellipse 70% 80% at 85% 10%, rgba(0, 180, 255, 0.18), transparent 60%),
      linear-gradient(160deg, var(--void-mid), var(--void) 70%);
    font-family: Inter, system-ui, sans-serif;
  }}
  .grid {{
    position: absolute; inset: 0;
    background-image:
      linear-gradient(var(--line) 1px, transparent 1px),
      linear-gradient(90deg, var(--line) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: linear-gradient(90deg, transparent, #000 55%, #000);
    opacity: 0.55;
  }}
  .frame {{ position: absolute; inset: 36px; border: 1px solid var(--line); }}
  .content {{ position: absolute; left: 96px; right: 96px; top: 170px; }}
  h1 {{
    font-family: "Chakra Petch", sans-serif; font-weight: 700;
    font-size: 112px; line-height: 1; letter-spacing: -0.01em;
    text-shadow: 0 0 40px rgba(0, 180, 255, 0.35);
  }}
  .bar {{ margin-top: 34px; width: 120px; height: 5px; background: var(--accent); }}
  p {{ margin-top: 30px; font-size: 40px; line-height: 1.3; color: var(--ink-dim); max-width: 1010px; }}
  .url {{
    position: absolute; left: 96px; bottom: 70px;
    font-family: "JetBrains Mono", monospace; font-size: 22px; color: var(--ink-dim);
  }}
</style></head>
<body>
  <div class="grid"></div><div class="frame"></div>
  <div class="content">
    <h1>Translating Policy</h1>
    <div class="bar"></div>
    <p>Free tools that turn public policy into plain facts.</p>
  </div>
  <div class="url">translatingpolicy.com</div>
</body></html>"""


def icon_html() -> str:
    """The favicon's path, filled white on the site's dark field."""
    svg = (PUBLIC / 'favicon.svg').read_text()
    path = re.search(r'<path d="([^"]+)"', svg).group(1)
    return f"""<!doctype html><html><head><style>
  * {{ margin: 0; }}
  html, body {{ width: 180px; height: 180px; background: #010509; }}
  svg {{ display: block; margin: 26px; width: 128px; height: 128px; }}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#ffffff" d="{path}"/></svg>
</body></html>"""


def render(browser, html: str, width: int, height: int, out: Path) -> None:
    page = browser.new_page(viewport={'width': width, 'height': height})
    page.set_content(html, wait_until='networkidle')
    page.evaluate('document.fonts.ready')
    page.screenshot(path=str(out), clip={'x': 0, 'y': 0, 'width': width, 'height': height})
    page.close()
    print(f'wrote {out.relative_to(ROOT)}')


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        render(browser, OG_HTML, 1200, 630, PUBLIC / 'og-image.png')
        render(browser, icon_html(), 180, 180, PUBLIC / 'apple-touch-icon.png')
        browser.close()


if __name__ == '__main__':
    main()
