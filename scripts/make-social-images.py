#!/usr/bin/env python3
"""Write the site icons and the link-preview image into public/.

    python3 scripts/make-social-images.py

Outputs:
  public/favicon.svg           the "TP" monogram, drawn from plain shapes
  public/favicon.ico           16x16 + 32x32 PNGs of the monogram
  public/apple-touch-icon.png  180x180 monogram, full bleed
  public/og-image.png          1200x630, shown when the site is shared

Uses Python Playwright (headless Chromium) so the real site fonts load from
Google Fonts, the same way the page gets them. Nothing here is a build-time
dependency: run it by hand when the text or the colors change, then commit
the PNGs. Colors mirror src/styles/tokens.css.
"""
import struct
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


# The "TP" monogram, drawn with blocky shapes in the spirit of Chakra Petch
# (squared letters, one clipped corner) so it needs no web font. Every
# coordinate is even on a 32 grid, so the 16px render stays pixel-crisp.
# Colors: --void-mid field, light-blue ink, --accent bar.
FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#031020"/>
  <g fill="#bfe6ff">
    <path d="M4 6h12v4h-4v14H8V10H4z"/>
    <path fill-rule="evenodd" d="M18 6h8l2 2v8l-2 2h-4v6h-4zM22 10v4h2v-4z"/>
  </g>
  <rect x="4" y="26" width="10" height="2" fill="#ff6a00"/>
</svg>
"""


def icon_html(size: int, full_bleed: bool = False) -> str:
    """The monogram at `size` px. Full bleed fills the rounded corners, since
    iOS applies its own mask to touch icons."""
    bg = '#031020' if full_bleed else 'transparent'
    return f"""<!doctype html><html><head><style>
  * {{ margin: 0; }}
  html, body {{ width: {size}px; height: {size}px; background: {bg}; }}
  svg {{ display: block; width: {size}px; height: {size}px; }}
</style></head><body>{FAVICON_SVG}</body></html>"""


def write_ico(pngs: list[tuple[int, bytes]], out: Path) -> None:
    """Pack PNG images into an .ico (PNG-in-ICO, read by every current browser)."""
    header = struct.pack('<HHH', 0, 1, len(pngs))
    offset = 6 + 16 * len(pngs)
    entries, blobs = b'', b''
    for size, data in pngs:
        entries += struct.pack('<BBBBHHII', size, size, 0, 0, 1, 32, len(data), offset)
        offset += len(data)
        blobs += data
    out.write_bytes(header + entries + blobs)
    print(f'wrote {out.relative_to(ROOT)}')


def render(browser, html: str, width: int, height: int, out: Path | None = None) -> bytes:
    """Screenshot `html` at width x height; save to `out` if given."""
    page = browser.new_page(viewport={'width': width, 'height': height})
    page.set_content(html, wait_until='networkidle')
    page.evaluate('document.fonts.ready')
    png = page.screenshot(
        omit_background=True, clip={'x': 0, 'y': 0, 'width': width, 'height': height}
    )
    page.close()
    if out:
        out.write_bytes(png)
        print(f'wrote {out.relative_to(ROOT)}')
    return png


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        (PUBLIC / 'favicon.svg').write_text(FAVICON_SVG)
        print('wrote public/favicon.svg')
        icos = [(n, render(browser, icon_html(n), n, n)) for n in (16, 32)]
        write_ico(icos, PUBLIC / 'favicon.ico')
        render(browser, icon_html(180, full_bleed=True), 180, 180, PUBLIC / 'apple-touch-icon.png')
        render(browser, OG_HTML, 1200, 630, PUBLIC / 'og-image.png')
        browser.close()


if __name__ == '__main__':
    main()
