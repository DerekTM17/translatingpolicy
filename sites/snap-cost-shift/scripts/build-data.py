"""Builds src/data/states.json and data/sources.xlsx from data/per_fy2025.tsv.

Run with: python3 -I scripts/build-data.py  (needs openpyxl for the .xlsx)
Inputs are copied by hand from two USDA FNS files (see README):
  per  = FY2025 SNAP payment error rate (percent)
  aug  = August 2026 (initial) SNAP benefit dollars
"""
import csv, json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent

def tier(per):
    # P.L. 119-21 sec. 10105: <6% pays 0; 6 to <8 pays 5%; 8 to <10 pays 10%; 10+ pays 15%.
    if per < 6: return 0
    if per < 8: return 5
    if per < 10: return 10
    return 15

rows = []
for name, code, over, under, per, aug in csv.reader(open(root/'data/per_fy2025.tsv'), delimiter='\t'):
    per = float(per); aug = int(aug); t = tier(per)
    annual = aug * 12
    rows.append(dict(name=name, code=code, over=float(over), under=float(under), per=per,
                     tier=t, delayFY2025=per * 1.5 >= 20, aug2026=aug, annualized=annual,
                     shareEstimate=round(annual * t / 100)))
rows.sort(key=lambda r: r['name'])
assert len(rows) == 53, len(rows)
(root/'src/data/states.json').write_text(json.dumps(rows, indent=1))

try:
    from openpyxl import Workbook
    from openpyxl.styles import Font
except ImportError:
    print('openpyxl missing: skipped sources.xlsx'); raise SystemExit
wb = Workbook(); ws = wb.active; ws.title = 'raw_data'
hdr = ['State', 'Code', 'FY2025 overpayment rate %', 'FY2025 underpayment rate %', 'FY2025 payment error rate %',
       'Cost-share tier % (if FY2025 rate used)', 'Delay test met on FY2025 (rate x 1.5 >= 20)',
       'Aug 2026 SNAP benefits $ (initial)', 'Annualized benefits $ (Aug 2026 x 12)', 'Illustrative state share $/yr']
ws.append(hdr)
for c in ws[1]: c.font = Font(bold=True)
for i, r in enumerate(rows, start=2):
    ws.append([r['name'], r['code'], r['over'], r['under'], r['per'], f'=IF(E{i}<6,0,IF(E{i}<8,5,IF(E{i}<10,10,15)))',
               f'=E{i}*1.5>=20', r['aug2026'], f'=H{i}*12', f'=I{i}*F{i}/100'])
n = len(rows) + 1
ws.append(['TOTAL', '', '', '', '', '', '', f'=SUM(H2:H{n})', f'=SUM(I2:I{n})', f'=SUM(J2:J{n})'])
for col, w in zip('ABCDEFGHIJ', [22, 6, 14, 14, 14, 16, 18, 20, 22, 22]): ws.column_dimensions[col].width = w

s = wb.create_sheet('sources')
s.append(['Item', 'Source', 'URL', 'Update cadence', 'Accessed'])
for c in s[1]: c.font = Font(bold=True)
for row in [
  ['FY2025 state payment error rates', 'USDA FNS, SNAP Quality Control, FY 25 Payment Error Rates (PDF)', 'https://www.fna.usda.gov/sites/default/files/resource-files/snap-qcfy25-per.pdf', 'Annual, about June 30', '2026-11-22'],
  ['National FY2025 rate 10.62%', 'Same PDF, UNITED STATES row', 'https://www.fns.usda.gov/snap/qc/per', 'Annual', '2026-11-22'],
  ['State monthly SNAP benefits (Aug 2026 initial)', 'USDA FNS, SNAP Data Tables, State Level Participation by Benefits (data as of Nov 13, 2026)', 'https://www.fna.usda.gov/sites/default/files/resource-files/snap-benefits-11.pdf', 'Monthly', '2026-11-22'],
  ['Cost-share tiers, FY2028 start, FY2025/FY2026 election, delay test', 'CRS R48552, SNAP and Related Nutrition Programs in P.L. 119-21 (sec. 10105)', 'https://www.congress.gov/crs_external_products/R/PDF/R48552/R48552.7.pdf', 'Static (law)', '2026-11-22'],
  ['Admin cost share: federal share falls to 25% from FY2027', 'CRS R48552 (sec. 10106)', 'https://www.congress.gov/crs_external_products/R/PDF/R48552/R48552.7.pdf', 'Static (law)', '2026-11-22'],
  ['Farm bill talks: one- vs two-year delay of state cost share', 'Holland & Knight, Beyond the Midterms (Oct 2026), secondary', 'https://www.hklaw.com/en/insights/publications/2026/10/beyond-the-midterms-congress-faces-converging-year-end-deadlines', 'Check weekly', '2026-11-22'],
]: s.append(row)
for col, w in zip('ABCDE', [48, 60, 70, 18, 12]): s.column_dimensions[col].width = w

m = wb.create_sheet('methodology')
for line in [
  'Tier: from each state\'s FY2025 payment error rate, using the bands in P.L. 119-21 sec. 10105.',
  'States may elect their FY2025 or FY2026 rate for FY2028. FY2026 rates are not yet published (expected about June 2027), so the tier shown can change.',
  'Delay test: a state whose FY2025 rate x 1.5 is 20 or more has its benefit cost share delayed to FY2029 (CRS R48552). A state that meets it on FY2026 is delayed to FY2030.',
  'Annualized benefits: August 2026 initial monthly benefits x 12. This is a rough scale, not a forecast. Monthly data are preliminary and may include disaster aid.',
  'Illustrative state share = annualized benefits x tier. It is not a CBO or USDA estimate and ignores caseload change, benefit changes and any delay.',
  'Guam and the Virgin Islands appear in the error rate table; whether the cost share applies to them is an open question and they are shown with a note.',
]: m.append([line])
m.column_dimensions['A'].width = 140
wb.save(root/'data/sources.xlsx'); print('wrote', len(rows), 'rows')
