#!/usr/bin/env python3
"""Builds the companion sources and methodology workbook from the page's own data files.

Run from sites/cliff-calendar:  python3 data/build_xlsx.py
Output: data/cliff-calendar_sources.xlsx
"""
import json
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent.parent
deadlines = json.loads((ROOT / 'src/data/deadlines.json').read_text())
states = json.loads((ROOT / 'src/data/states.json').read_text())

BOLD = Font(bold=True)
HEAD = PatternFill('solid', fgColor='E2E8F0')
WRAP = Alignment(wrap_text=True, vertical='top')


def sheet(wb, title, header, rows, widths):
    ws = wb.create_sheet(title)
    ws.append(header)
    for c in ws[1]:
        c.font = BOLD
        c.fill = HEAD
    for r in rows:
        ws.append(r)
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = WRAP
    ws.freeze_panes = 'A2'
    return ws


wb = Workbook()
ws = wb.active
ws.title = 'Methodology'
notes = [
    ('Funding Cliff Calendar: sources and methodology', ''),
    ('Last verified', deadlines['lastVerified']),
    ('Status at last check', deadlines['statusNote']),
    ('What this is', 'A hand-curated list of federal programs and authorities that end on December 11 or December 31, 2026 unless Congress acts, written in plain language, with the statute and a primary source for each.'),
    ('How dates were verified', 'Division A dates were checked against CRS R49353 (Sept 17, 2026), which describes the enacted law. Dates in Divisions B to D come from the Senate committee text of the extension divisions dated August 2, 2026. The House agreed to the Senate-passed version on September 1, 2026 (CRS R49353), but the enrolled text itself was not read line by line, so a floor change between August 2 and August 8 would not be caught. Health dates come from CRS R49126 (Aug 11, 2026) and TANF from CRS R48413 (May 4, 2026). Flood insurance mechanics come from CRS IN10835 (Sept 11, 2026).'),
    ('Countdown', 'Calendar days from today in US Eastern time to the deadline date. Funding lapses at 12:01 a.m. Eastern the day after the deadline.'),
    ('Status chips', 'Set by hand in v1 (Pending in Congress). No automated congress.gov poll yet.'),
    ('Reach figures', 'Only figures printed in a cited source are shown. Items with no sourced figure show none. Nothing is estimated.'),
    ('State counts', 'Health center patients (2024) come from HRSA state overview pages. Only 5 states could be read in v1 (the rest of the HRSA state pages refused automated reads); the page links every other state to its official HRSA page. NFIP policies by state are in a FEMA FloodSmart Excel file (data through Oct 31, 2026) that could not be downloaded from the build environment; no state flood numbers are shown.'),
    ('Secondary sources', 'Holland & Knight (Oct 9, 2026) is used only for the telehealth and hospital-at-home end dates in "Not on this calendar", and is labeled secondary on the page. Unofficial shutdown trackers were used only to check that no new funding law had passed by mid-November.'),
    ('Out of scope', 'Predicting what Congress will do, furlough counts, the debt limit (no source found that lists it as a current deadline), farm bill detail.'),
]
for k, v in notes:
    ws.append([k, v])
ws['A1'].font = Font(bold=True, size=14)
for r in range(2, ws.max_row + 1):
    ws.cell(r, 1).font = BOLD
    ws.cell(r, 2).alignment = WRAP
ws.column_dimensions['A'].width = 26
ws.column_dimensions['B'].width = 110

rows = []
for it in deadlines['items']:
    reach = it.get('reach') or {}
    rows.append([
        it['date'], it['id'], it['title'], it['whatStops'], it['whoFeelsIt'],
        reach.get('value', ''), reach.get('label', ''), it['citation'], it['mechanics'],
        '\n'.join(it.get('list', [])),
        '\n'.join(f"{s['label']}: {s['url']}" for s in it['sources']),
        deadlines['lastVerified'],
    ])
sheet(wb, 'Deadlines', ['Date', 'ID', 'Item', 'What stops', 'Who feels it', 'Reach value', 'Reach label', 'Law', 'Mechanics', 'Sub-items', 'Sources', 'Last verified'],
      rows, [12, 22, 28, 50, 45, 16, 40, 28, 60, 50, 70, 12])

src = {}
for it in deadlines['items']:
    for s in it['sources']:
        src.setdefault(s['url'], [s['label'], s['kind'], []])[2].append(it['id'])
for s in deadlines['statusSources']:
    src.setdefault(s['url'], [s['label'], 'Official', []])[2].append('status')
for n in deadlines['notOnCalendar']:
    if n['url']:
        src.setdefault(n['url'], [n['sourceLabel'], 'Secondary' if 'secondary' in n['sourceLabel'] else 'CRS', []])[2].append('not-on-calendar')
src[states['healthCenterPatients2024']['nationalUrl']] = src.get(states['healthCenterPatients2024']['nationalUrl'], ['HRSA national health center data, 2024', 'Data', []])
src[states['nfipPolicies']['fileUrl']] = ['FEMA FloodSmart, NFIP policy information by state (data through Oct 31, 2026), not loaded', 'Data', ['state-picker']]
sheet(wb, 'Sources', ['Source', 'Type', 'URL', 'Used for'],
      [[v[0], v[1], u, ', '.join(sorted(set(v[2])))] for u, v in src.items()], [60, 12, 90, 40])

srows = []
for s in states['states']:
    srows.append([s['code'], s['name'], s['healthCenterPatients2024'] if s['healthCenterPatients2024'] is not None else 'not loaded',
                  s['healthCenterUrl'], 'not loaded'])
srows.append(['US', 'National total', states['healthCenterPatients2024']['national'], states['healthCenterPatients2024']['nationalUrl'], 'nearly 4.5 million (CRS IN10835)'])
sheet(wb, 'State_counts', ['Code', 'State', 'Health center patients 2024 (HRSA UDS)', 'HRSA source page', 'NFIP policies in force'], srows, [8, 22, 22, 70, 28])

checks = [
    ['CR end date Dec 11, 2026 (P.L. 119-103 Sec. 106)', 'Confirmed', 'CRS R49353; signed Sept 2, 2026 per White House. The House section summary says Dec 4, which reflects an earlier draft.'],
    ['NFIP lapse Dec 11; borrowing $30.425B to $1B', 'Confirmed', 'CRS IN10835 (Sept 11, 2026), CRS R49353 Sec. 139.'],
    ['1,400+ closings delayed per day in 2010 lapse', 'Confirmed as past estimate', 'CRS IN10835: over 1,400 per day, over 40,000 per month, June 2010.'],
    ['About 4.5 million NFIP policies', 'Confirmed', 'CRS IN10835: nearly 4.5 million, about $1.3 trillion coverage.'],
    ['Livestock reporting, CFTC whistleblower, TSA pilot, E-Verify, Conrad 30, H-2B, firefighter pay to Dec 11', 'Confirmed', 'CRS R49353 Secs. 119, 134, 138, 101(6), 142.'],
    ['OMB grants rule delay ends Dec 11', 'Confirmed in primary source', 'CRS R49353 Sec. 157 (mini-PRD cited only Holland & Knight).'],
    ['Dec 31 items are in P.L. 119-103 Division B', 'Wrong', 'Division B of P.L. 119-103 has no health or TANF items. The Dec 31 dates come from P.L. 119-75 (Consolidated Appropriations Act, 2026) and the underlying statutes (CRS R49126, R48413).'],
    ['TANF ends Dec 31, 2026', 'Confirmed', 'CRS R48413 (May 4, 2026): P.L. 119-75 funds TANF through Dec 31, 2026.'],
    ['CHC Fund, NHSC, Special Diabetes, 2.5% physician increase, low-volume hospital, MDH end Dec 31', 'Confirmed', 'CRS R49126 Table 1.'],
    ['Surface transportation: conflicting sources', 'Resolved', 'Division C sets an extension end date of Dec 11, 2026; Highway Trust Fund spending authority runs to Dec 12, 2026.'],
    ['Debt limit an active deadline', 'Not found', 'No source checked lists it; left off the page.'],
    ['Medicare telehealth or hospital at home end Dec 31, 2026', 'No', 'Telehealth runs to Dec 31, 2027 and hospital at home to Sept 30, 2030 (Holland & Knight, secondary). Listed under Not on this calendar.'],
]
sheet(wb, 'Fact_checks', ['Mini-PRD claim', 'Result', 'Evidence'], checks, [60, 24, 100])

out = ROOT / 'data/cliff-calendar_sources.xlsx'
wb.save(out)
print('wrote', out)
