#!/usr/bin/env python3
"""Builds the companion sources and methodology workbook from the page's own data file.

Run from sites/permitting-bill:  python3 data/build_xlsx.py
Output: data/permitting-bill_sources.xlsx (also copied to public/ so the page can link it)
"""
import json
import shutil
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent.parent
d = json.loads((ROOT / 'src/data/bill.json').read_text())

BOLD = Font(bold=True)
HEAD = PatternFill('solid', fgColor='E2E8F0')
WRAP = Alignment(wrap_text=True, vertical='top')
CHECK = {
    'both': 'CRS summary and a reading of the passed text agree',
    'crs': 'CRS summary of the bill as introduced',
    'tracker': "A tracker's reading of the passed text only",
    'reported': 'Reported by a law firm or advocates, not yet confirmed',
}


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
    ('The Permitting Bill (BAAJA): sources and methodology', ''),
    ('Bill', f"{d['name']} ({d['short']}). Introduced as S. 5653; passed the Senate as H.R. 2347 with substitute S.Amdt. 6883."),
    ('Last verified', d['lastVerified']),
    ('Status at last check', d['statusNote']),
    ('Vote counts', 'From senate.gov roll call records. Final passage (roll call 270) and the party split were read on the vote detail page on 2026-11-24; party counts were tallied from its name lists. Other tallies come from the senate.gov 119th Congress, 2nd session vote list. Not voting = 100 minus yea minus nay. The sheet Votes has formulas that recompute totals and the yea share.'),
    ('What the bill does', 'From CRS R49506 (Nov 5, 2026), which summarizes the bill as introduced on Sept 30, checked against the More Than Just Parks tracker, which quotes the Senate-passed substitute with Congressional Record page numbers. We could not read the substitute text ourselves: the govinfo Congressional Record pages we reached held only amendment notices, and congress.gov refuses automated reads. Each change is labeled with how firmly it is sourced (sheet Changes, column Sourcing).'),
    ('Sourcing labels', '; '.join(f'{k} = {v}' for k, v in CHECK.items())),
    ('Balance rule', 'Supporters and opponents are listed in equal numbers, attributed, and never stated as fact. The build fails if the counts differ.'),
    ('Left out on purpose', 'Any estimate of power bill savings, jobs or the federal deficit (no official estimate for the passed version was found); House timing beyond "no date set as of Nov 23"; reported but unconfirmed details of the transmission backstop in the passed text.'),
    ('Open checks', 'Read Sec. 2107 (Ratepayer protection), Sec. 2101 (transmission backstop), Secs. 1401 and 1402 (bad-faith suits) and Title III in the Senate-passed text. Find a CBO estimate for the substitute. Recheck House status daily.'),
]
for k, v in notes:
    ws.append([k, v])
ws['A1'].font = Font(bold=True, size=14)
for r in range(2, ws.max_row + 1):
    ws.cell(r, 1).font = BOLD
    ws.cell(r, 2).alignment = WRAP
ws.column_dimensions['A'].width = 24
ws.column_dimensions['B'].width = 110

vrows = []
for v in d['votes']:
    vrows.append([v['roll'], v['date'], v['short'], v['question'], v['result'], v['yea'], v['nay'], v['notVoting'], None, None, v['url']])
vs = sheet(wb, 'Votes', ['Roll call', 'Date', 'Short name', 'Question', 'Result', 'Yea', 'Nay', 'Not voting', 'Total (formula)', 'Yea share of those voting (formula)', 'Source'],
           vrows, [10, 12, 22, 50, 12, 8, 8, 11, 14, 18, 80])
for r in range(2, vs.max_row + 1):
    vs.cell(r, 9).value = f'=F{r}+G{r}+H{r}'
    vs.cell(r, 10).value = f'=ROUND(F{r}/(F{r}+G{r})*100,0)'

final = next(v for v in d['votes'] if v['roll'] == 270)
prow = [[p, c['yea'], c['nay'], c['notVoting'], None] for p, c in final['parties'].items()]
ps = sheet(wb, 'Final_passage_by_party', ['Party', 'Yea', 'Nay', 'Not voting', 'Seats (formula)'], prow, [16, 8, 8, 11, 14])
for r in range(2, ps.max_row + 1):
    ps.cell(r, 5).value = f'=B{r}+C{r}+D{r}'
n = ps.max_row
ps.append(['Total', f'=SUM(B2:B{n})', f'=SUM(C2:C{n})', f'=SUM(D2:D{n})', f'=SUM(E2:E{n})'])
ps.append(['Source', final['url']])

crows = []
for c in d['changes']:
    crows.append([c['id'], c['topic'], c['title'], c['section'], CHECK[c['check']], c['felt'], c['who'],
                  '\n'.join(f"{x['value']}: {x['label']} ({x['url']})" for x in c['numbers']),
                  c['mechanics'], '\n'.join(f"{s['label']}: {s['url']}" for s in c['sources'])])
sheet(wb, 'Changes', ['ID', 'Topic', 'Change', 'Section', 'Sourcing', 'Felt impact', 'Who notices', 'Numbers and source', 'Mechanics', 'Sources'],
      crows, [14, 14, 34, 18, 34, 50, 40, 50, 70, 70])

srows = [[s['date'] or 'pending', s['label'], s['detail'], 'Yes' if s['done'] else 'No', s['source']['label'], s['source']['url']] for s in d['steps']]
sheet(wb, 'Status_steps', ['Date', 'Step', 'Detail', 'Done', 'Source', 'URL'], srows, [12, 34, 70, 8, 34, 70])

side_rows = [[k, p['who'], p['claim'], p['url']] for k in ('support', 'oppose') for p in d['sides'][k]]
sheet(wb, 'Supporters_opponents', ['Side', 'Who', 'Claim (attributed)', 'Source'], side_rows, [10, 40, 70, 80])

myth_rows = [[m['claim'], m['fact'], m['url']] for m in d['myths']]
sheet(wb, 'Easy_to_get_wrong', ['Claim', 'Fact', 'Source'], myth_rows, [40, 80, 80])

src = {}
def add(url, label, use):
    src.setdefault(url, [label, set()])[1].add(use)
for v in d['votes']:
    add(v['url'], f"senate.gov roll call {v['roll']}" if 'vote_119' in v['url'] else 'senate.gov roll call vote list, 119th Congress 2nd session', 'votes')
for c in d['changes']:
    for s in c['sources']:
        add(s['url'], s['label'], c['id'])
for s in d['steps']:
    add(s['source']['url'], s['source']['label'], 'status')
for k in ('support', 'oppose'):
    for p in d['sides'][k]:
        add(p['url'], p['who'], k)
for m in d['myths']:
    add(m['url'], m['url'], 'quick facts')
for l in d['billLinks']:
    add(l['url'], l['label'], 'read it yourself')
sheet(wb, 'Sources', ['Source', 'URL', 'Used for'], [[v[0], u, ', '.join(sorted(v[1]))] for u, v in src.items()], [60, 90, 40])

checks = [
    ['Senate passed 62 to 33 on Nov 19, 2026 (roll call 270)', 'Confirmed', 'senate.gov vote 270 detail page, read 2026-11-24: 62 yea, 33 nay, 5 not voting.'],
    ['Party split on final passage', 'Confirmed', 'Counted from the vote 270 name lists: yea R 47, D 14, I 1; nay R 2, D 30, I 1; not voting R 4, D 1.'],
    ['Roll calls 257, 258, 264, 266, 267, 268', 'Confirmed', 'senate.gov vote list, read 2026-11-24.'],
    ['House has not voted on the Senate version', 'Confirmed as of Nov 23', 'More Than Just Parks and Bommarito (both updated Nov 23): no House vote date set. congress.gov all-actions could not be read.'],
    ['150-day limit to file a NEPA challenge (Sec. 1110)', 'Two sources agree', 'CRS R49506 (introduced text) and the MTJP tracker quoting the substitute (Record p. S5478). A Nov 21 note said this was read in the Record at govinfo PgS5471-2; on Nov 24 that page held only an amendment notice, so we no longer count it as read in the text.'],
    ['1 year EA and 2 year EIS deadlines (Sec. 1106)', 'Tracker only for the numbers', 'CRS confirms Sec. 1106 sets decision deadlines; the 1 and 2 year figures are from MTJP quoting Record pp. S5476 to S5477.'],
    ['Bad-faith payment provisions (Secs. 1401, 1402)', 'Tracker only', 'MTJP quoting Record pp. S5488 to S5490. Not in the CRS sections we read.'],
    ['Data center ratepayer protection (Sec. 2107)', 'Reported', 'Section title confirmed in an earlier read of the substitute table of contents; content from White & Case (Nov 11). MTJP did not describe a cost rule.'],
    ['Transmission backstop siting (Sec. 2101)', 'CRS (introduced) only', 'Not confirmed in the passed text.'],
    ['Title III changes for tribal programs', 'Reported', 'Bommarito, based on a committee summary; NARF and NCAI oppose.'],
]
sheet(wb, 'Fact_checks', ['Claim', 'Result', 'Evidence'], checks, [50, 24, 110])

out = ROOT / 'data/permitting-bill_sources.xlsx'
wb.save(out)
shutil.copy(out, ROOT / 'public/permitting-bill_sources.xlsx')
print('wrote', out)
