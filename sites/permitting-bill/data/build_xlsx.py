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
    'text': "In the sponsors' Nov 7 substitute text, which we read",
    'both': 'CRS summary and a reading of the passed text agree',
    'crs': 'CRS summary of the bill as introduced',
    'tracker': "A tracker's reading of the passed text only",
    'reported': 'Reported by tribal groups, advocates or law firms; not confirmed in the text',
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
    ('What the bill does', "On 2026-11-24 we read pages 1 to 96 of the sponsors' Nov 7 substitute text (posted by Senate EPW, offered on the floor as S.Amdt. 6883): Division A Title I, NEPA, through Sec. 1121, including Sec. 1110 judicial review. The rest of the PDF was beyond what our reader could reach, the Congressional Record text and congress.gov were not reachable, and floor changes of Nov 17 and 18 are not checked line by line. On 2026-11-25 the official text as passed by the Senate (Nov 19) was found on GovInfo; its table of contents lists Secs. 1402, 2101, 2215 and 2301 under the same headings we cite, but our reader again stopped in Division A (Sec. 1121), so those sections are still not read. For other parts we use CRS R49506 (all sections, introduced bill), CRS R49511 (Title IV, introduced bill), the More Than Just Parks tracker, and named analyses. Each change and worry is labeled with how firmly it is sourced."),
    ('Who is worried and why', "Sheet Whos_worried lists each criticism: who raises it, their claim (attributed, short quotes), our plain explanation of what it could mean in practice (an explanation of mechanics, not a prediction), what we could confirm and what we could not, and a supporter's response or a sourced note that none was found. The build fails if a worry lacks either."),
    ('Sourcing labels', '; '.join(f'{k} = {v}' for k, v in CHECK.items())),
    ('Balance rule', 'Supporters and opponents are listed in equal numbers, attributed, and never stated as fact. The build fails if the counts differ.'),
    ('Left out on purpose', 'Any estimate of power bill savings, jobs or the federal deficit (no official estimate for the passed version was found); House timing beyond "no date set as of Nov 23"; reported but unconfirmed details of the transmission backstop in the passed text.'),
    ('Open checks', 'Read Title IV (Secs. 1401 to 1403), Division B Title I (Secs. 2101, 2102, 2107, 2117), Sec. 2215 (mill sites) and Title III (Secs. 2301, 2302, historic preservation and tribal consultation) in the passed text. Confirm whether a FERC backstop permit carries eminent domain. Check the Nov 17 and 18 floor changes. Find a CBO estimate. Recheck House status daily.'),
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

wrows = []
for c in d['concerns']:
    resp = f"{c['response']['who']}: {c['response']['claim']} ({c['response']['url']})" if c.get('response') else f"None found. {c['noResponse']['text']} ({c['noResponse']['url']})"
    if c.get('concession'):
        resp += f"\n{c['concession']['text']} ({c['concession']['url']})"
    wrows.append([c['id'], c['topic'], c['title'], c['section'], CHECK[c['check']],
                  '\n'.join(f"{p['who']} ({p['url']})" for p in c['critics']), c['claim'], c['practice'],
                  c['confirmed'], c['open'], resp, '\n'.join(f"{s['label']}: {s['url']}" for s in c['sources'])])
sheet(wb, 'Whos_worried', ['ID', 'Topic', 'Worry', 'Section', 'How solid', 'Raised by', 'What critics say (attributed)', 'What it could mean in practice (our explanation)', 'What we could confirm', 'Not confirmed yet', 'Supporter response', 'Sources'],
      wrows, [14, 16, 34, 20, 30, 40, 70, 70, 60, 50, 60, 80])

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
for c in d['concerns']:
    for s in c['sources']:
        add(s['url'], s['label'], f"worry: {c['id']}")
    for p in c['critics']:
        add(p['url'], p['who'], f"worry: {c['id']}")
    if c.get('response'):
        add(c['response']['url'], c['response']['who'], f"worry: {c['id']} (response)")
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
    ['150-day limit to file a NEPA challenge (Sec. 1110)', 'Confirmed in text', "Read in the sponsors' Nov 7 substitute text, new NEPA sec. 111, pp. 72 to 74, with the comment requirement, the direct-harm test and appeals-court venue. Also in CRS R49506 and MTJP."],
    ['Remand without vacatur or injunction is the only NEPA remedy; permit stays in effect (Sec. 1110)', 'Confirmed in text', 'Substitute text pp. 75 to 77. Preliminary injunctions still possible for likely violations of laws other than NEPA and the NHPA (pp. 75 to 76).'],
    ["No claims over omissions from the developer's stakeholder engagement list (Sec. 1110)", 'Confirmed in text', 'Substitute text p. 79, referring to the list in new NEPA sec. 3(22)(B), pp. 24 to 25.'],
    ['NEPA suits over tribal trust land projects limited to the trust tribe (Sec. 1110)', 'Confirmed in text', 'Substitute text pp. 78 to 79; exception for effects outside the trust lands.'],
    ['1 year EA and 2 year EIS deadlines (Sec. 1106)', 'Confirmed in text', 'Substitute text pp. 49 to 53; decisions on authorizations 90 or 120 days later. CEQ dispute rulings final and not reviewable, pp. 53 to 56.'],
    ['Loan-only projects and certain gas pipeline covered activities are not major federal actions (Sec. 1102)', 'Confirmed in text', "Substitute text pp. 16 to 22. Which pipeline work is a covered activity depends on a new Natural Gas Act section we did not read."],
    ['Bad-faith payment provisions (Secs. 1401, 1402)', 'CRS (introduced), tracker and Earthjustice on the substitute', 'CRS R49511: clear and convincing standard, 25 to 50 percent and 50 to 100 percent payments, Judgment Fund. MTJP reports the same in the passed text. Protected-permit date moved from Sept 16 to Nov 6, 2026 per IFP. Earthjustice on the substitute: Title IV kept, with health and environment exceptions, a savings clause, a bad-faith requirement for Sec. 1402 suits, a 10-year look-back and Judgment Fund payments only by court order or approved settlement. No source gives the percentages for the substitute.'],
    ['Data center ratepayer protection (Sec. 2107)', 'Reported', 'Section title in the substitute table of contents; content from White & Case (Nov 11) and sponsors. NRDC says local impacts are not addressed.'],
    ['Transmission backstop siting (Sec. 2101)', 'CRS (introduced) and an advocacy reading', 'Not confirmed in the passed text. IFP (Oct 12, introduced bill) says a federally sited line could use federal eminent domain; no source confirms that for the passed version.'],
    ['Title III Section 106 changes: 30-day response clock, softer consultation wording, financial-assistance exclusion, THPO reviews', 'Quoted by both sides, not read', 'Not read in the text. Earthjustice (critic) and IFP (defends the tribal provisions) both quote the substitute: "seek, discuss, as appropriate, and incorporate, as applicable", a 30-day window for tribal information, "may consult" deleted, sacred-property redefinition and THPO takeover dropped, transportation projects over $10 million kept in review. IFP: objection window 30 to 45 days. CRS and IFP: Section 106 claims get their own 150-day, remand-only rule. Also TNPI, NATHPO, Native News Online, CWP.'],
    ['Mill sites and mine waste on public land (Sec. 2215)', 'Reported', 'Section title in the table of contents. Content from Earthworks, Earthjustice, CWP, NRDC and Heatmap News.'],
    ['Seabed mining near U.S. territories', 'Left out', 'One outlet (Pasquines, Nov 18) reported it; the page would not load, so we did not use it.'],
]
sheet(wb, 'Fact_checks', ['Claim', 'Result', 'Evidence'], checks, [50, 24, 110])

out = ROOT / 'data/permitting-bill_sources.xlsx'
wb.save(out)
shutil.copy(out, ROOT / 'public/permitting-bill_sources.xlsx')
print('wrote', out)
