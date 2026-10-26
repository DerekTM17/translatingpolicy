#!/usr/bin/env python3
"""Flesch-Kincaid grade check for translatingpolicy.com prose.

Adapted from ATTRACTOR's scripts/reading-level.py. Site prose targets an 8th
grade reading level; the default cap is 9.0 (a buffer, since FK on short
passages is noisy). Never loosen it. Numerals are replaced with a
one-syllable token first so precise figures do not penalize the grade.

Scans prose only:
  - src/data/projects.json: each project's `description`
  - src/data/hero.json: `headline`, `lede`, `after`
  - src/data/about.json: `bio` and each `principles[].text`
  - src/**/*.astro: paragraph-like text (<p>, <li>, <blockquote>; headings are too short for FK)

Files that do not exist yet are skipped (Tasks 2-3 create the data files and
components). Strings starting with `[DEREK:` are placeholders and are skipped.
hero.json `before.text` is deliberately NOT scanned: it quotes statute, which
is dense on purpose.

Usage: python3 scripts/reading-level.py [threshold]
Exits 1 if any block exceeds the threshold.
"""
import glob
import json
import os
import re
import sys


def syllables(word: str) -> int:
    word = re.sub(r'[^a-z]', '', word.lower())
    if not word:
        return 0
    groups = re.findall(r'[aeiouy]+', word)
    n = len(groups)
    if word.endswith('e') and n > 1 and not word.endswith(('le', 'ee', 'ye')):
        n -= 1
    return max(n, 1)


def fk_grade(text: str) -> float:
    # Digit-led groups only: '$42.45' -> 'ten' but sentence periods survive.
    text = re.sub(r'\$?\d[\d.,]*', 'ten', text)
    sents = [s for s in re.split(r'[.!?:]+', text) if s.strip()]
    words = re.findall(r"[A-Za-z']+", text)
    if not sents or not words:
        return 0.0
    syl = sum(syllables(w) for w in words)
    return 0.39 * (len(words) / len(sents)) + 11.8 * (syl / len(words)) - 15.59


def load(path: str):
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def json_blocks() -> list[tuple[str, str]]:
    blocks: list[tuple[str, str]] = []
    projects = load('src/data/projects.json')
    if projects is not None:
        items = projects if isinstance(projects, list) else projects.get('projects', [])
        for i, p in enumerate(items):
            blocks.append((f'projects.json[{i}].description', p.get('description', '')))
    hero = load('src/data/hero.json')
    if hero is not None:
        # `before.text` is quoted statute, dense on purpose: not scanned.
        for key in ('headline', 'lede', 'after'):
            blocks.append((f'hero.json {key}', hero.get(key, '')))
    about = load('src/data/about.json')
    if about is not None:
        blocks.append(('about.json bio', about.get('bio', '')))
        for i, pr in enumerate(about.get('principles', [])):
            blocks.append((f'about.json principles[{i}]', pr.get('text', '')))
    return blocks


PROSE_TAG = re.compile(r'<(p|li|blockquote)\b[^>]*>(.*?)</\1>', re.S)


def astro_blocks() -> list[tuple[str, str]]:
    blocks: list[tuple[str, str]] = []
    for path in sorted(glob.glob('src/**/*.astro', recursive=True)):
        src = open(path).read()
        src = re.sub(r'^---.*?---', '', src, count=1, flags=re.S)  # frontmatter
        for n, m in enumerate(PROSE_TAG.finditer(src), 1):
            text = re.sub(r'\{[^}]*\}', ' ', m.group(2))  # expressions
            text = re.sub(r'<[^>]+>', ' ', text)            # nested markup
            blocks.append((f'{path} #{n}', text))
    return blocks


def main() -> int:
    threshold = float(sys.argv[1]) if len(sys.argv) > 1 else 9.0
    failures = 0
    for label, raw in json_blocks() + astro_blocks():
        text = ' '.join(raw.split())
        if not text or text.startswith('[DEREK:'):
            continue
        grade = fk_grade(text)
        over = grade > threshold
        failures += int(over)
        flag = f'  <-- FK exceeds {threshold}' if over else ''
        print(f'{label}: FK grade {grade:.1f}{flag}')
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
