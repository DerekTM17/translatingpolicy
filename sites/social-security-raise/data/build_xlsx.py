"""Builds social-security-raise_sources.xlsx and sources.csv: raw rates, sources and methodology.
Run: python3 data/build_xlsx.py (needs openpyxl). Figures mirror src/data/rates.js; check-data.mjs guards that file."""
import csv
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font

HERE = Path(__file__).parent
CHECKED = "2026-11-23"

SOURCES = [
    ("ssa-cola", "SSA press release: 3.6 percent benefit increase for 2027", "2026-10-14", "https://www.ssa.gov/news/en/press/releases/2026-10-14.html", "Once a year (October, with September CPI-W)"),
    ("ssa-blog", "SSA blog: COLA timing, notices, taxable maximum", "2026-10-14", "https://www.ssa.gov/blog/en/posts/2026-10-14.html", "Once a year"),
    ("cms-2027", "CMS-8094-N, Federal Register 2026-23601: Part B premium, deductible, income tiers for 2027", "2026-11-19", "https://www.federalregister.gov/documents/2026/11/19/2026-23601/medicare-program-medicare-part-b-monthly-actuarial-rates-premium-rates-and-annual-deductible", "Once a year (November)"),
    ("cms-2026", "CMS fact sheet: 2026 Medicare Parts A and B premiums and deductibles", "2025-11", "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles", "Once a year"),
    ("poms-irmaa", "SSA POMS HI 01101.031: how IRMAA is calculated (two-year lookback)", "2025-12-02", "https://secure.ssa.gov/poms.nsf/lnx/0601101031", "As revised"),
]

RATES = [
    ("COLA 2027", "3.6%", "ssa-cola"),
    ("Part B standard premium 2026", 202.90, "cms-2026"),
    ("Part B standard premium 2027", 209.40, "cms-2027"),
    ("Part B premium change", 6.50, "cms-2027"),
    ("Part B deductible 2026", 283, "cms-2026"),
    ("Part B deductible 2027", 292, "cms-2027"),
    ("SSA average retiree raise (stated)", "about $75 a month", "ssa-blog"),
    ("SSI raise starts", "2026-12-31", "ssa-cola"),
    ("Social Security raise starts", "January 2027 payments", "ssa-cola"),
    ("Taxable maximum 2026 to 2027", "$184,500 to $192,300 (context only, not used in calculator)", "ssa-blog"),
]

IRMAA = {
    2026: [("<= 109,000", "<= 218,000", 0.00, 202.90), ("109,001 to 137,000", "218,001 to 274,000", 81.20, 284.10),
           ("137,001 to 171,000", "274,001 to 342,000", 202.90, 405.80), ("171,001 to 205,000", "342,001 to 410,000", 324.60, 527.50),
           ("205,001 to < 500,000", "410,001 to < 750,000", 446.30, 649.20), (">= 500,000", ">= 750,000", 487.00, 689.90)],
    2027: [("<= 112,000", "<= 224,000", 0.00, 209.40), ("112,001 to 141,000", "224,001 to 282,000", 83.70, 293.10),
           ("141,001 to 177,000", "282,001 to 354,000", 209.40, 418.80), ("177,001 to 212,000", "354,001 to 424,000", 335.00, 544.40),
           ("212,001 to < 500,000", "424,001 to < 750,000", 460.60, 670.00), (">= 500,000", ">= 750,000", 502.40, 711.80)],
}

METHOD = [
    "New gross benefit = floor(current gross x 1.036). SSA applies the COLA to the PIA and rounds the payable benefit down to the whole dollar, so the page is an estimate within about $1.",
    "Net deposit = gross benefit minus the Part B premium when the premium is deducted from the check.",
    "Premium tier: user's MAGI from the 2024 return sets 2026, from the 2025 return sets 2027 (two-year lookback, POMS HI 01101.031). Default is the standard tier.",
    "Hold harmless (Social Security Act sec. 1839(f)): if Part B is deducted and no income-related amount applies, the 2027 premium is capped at the 2026 premium plus the dollar raise.",
    "State pays (Medicare Savings Program): premium treated as $0 both years.",
    "Share eaten = premium change / dollar raise, standard tier, shown for checks from $100 to $4,000.",
    "Out of scope: Medicare Advantage Part B giveback, Part D premiums, tax withholding, married filing separately, late enrollment penalties.",
]

wb = Workbook()
ws = wb.active; ws.title = "Rates"
ws.append(["Item", "Value", "Source id", "Checked"]); [setattr(c, "font", Font(bold=True)) for c in ws[1]]
for r in RATES: ws.append([*r, CHECKED])
for y, rows in IRMAA.items():
    s = wb.create_sheet(f"IRMAA {y}")
    s.append(["Individual MAGI ($)", "Joint MAGI ($)", "IRMAA ($/mo)", "Total Part B ($/mo)", "Source id"]); [setattr(c, "font", Font(bold=True)) for c in s[1]]
    for r in rows: s.append([*r, "cms-2027" if y == 2027 else "cms-2026"])
s = wb.create_sheet("Sources")
s.append(["Id", "Title", "Published", "URL", "Update cadence"]); [setattr(c, "font", Font(bold=True)) for c in s[1]]
for r in SOURCES: s.append(list(r))
s = wb.create_sheet("Methodology")
s.append(["Step"]); s["A1"].font = Font(bold=True)
for m in METHOD: s.append([m])
wb.save(HERE / "social-security-raise_sources.xlsx")

with open(HERE / "sources.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["id", "title", "published", "url", "update_cadence"]); w.writerows(SOURCES)
print("wrote social-security-raise_sources.xlsx and sources.csv")
