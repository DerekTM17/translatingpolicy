#!/usr/bin/env python3
"""Build the companion data, sources and methodology workbook from src/data/*.json.

Usage: python3 scripts/build_xlsx.py   (or: npm run xlsx)
Writes public/aca-premium-check_sources.xlsx so the page can link it.
"""
import json
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "data"
OUT = ROOT / "public" / "aca-premium-check_sources.xlsx"

states = json.loads((DATA / "states.json").read_text())
rules = json.loads((DATA / "rules.json").read_text())
sources = json.loads((DATA / "sources.json").read_text())

HEAD = Font(bold=True, color="010509")
FILL = PatternFill("solid", fgColor="C6FF3D")
WRAP = Alignment(wrap_text=True, vertical="top")


def sheet(wb, title, headers, rows, widths):
    ws = wb.create_sheet(title)
    ws.append(headers)
    for c in ws[1]:
        c.font, c.fill, c.alignment = HEAD, FILL, WRAP
    for r in rows:
        ws.append(r)
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = WRAP
    ws.freeze_panes = "A2"
    return ws


wb = Workbook()
wb.remove(wb.active)

AGE = {"federal": "Federal default curve", "own": "State's own curve (estimate approximate)", "none": "No age rating"}
rows = [[s["code"], s["name"], s["b2026"], s["b2027"], round((s["b2027"] - s["b2026"]) / s["b2026"] * 100, 1),
         "Yes" if s["medicaidExpansion"] else "No", AGE[s["ageRating"]], s["fplRegion"]] for s in states["states"]]
us = states["usAverage"]
rows.append(["US", "United States average", us["b2026"], us["b2027"], round((us["b2027"] - us["b2026"]) / us["b2026"] * 100, 1), "", "", ""])
sheet(wb, "Benchmarks by state",
      ["Code", "State", "2026 benchmark, age 40 ($/mo)", "2027 benchmark, age 40 ($/mo)", "Change %", "Medicaid expansion", "Age rating", "Poverty table"],
      rows, [7, 24, 16, 16, 10, 12, 30, 10])

fpl = rules["fpl"]
sheet(wb, "Poverty lines 2026",
      ["Household size", "48 states and DC", "Alaska", "Hawaii"],
      [[i + 1, fpl["US48"]["base"][i], fpl["AK"]["base"][i], fpl["HI"]["base"][i]] for i in range(8)]
      + [["Each additional person", fpl["US48"]["each"], fpl["AK"]["each"], fpl["HI"]["each"]]],
      [22, 18, 14, 14])

sheet(wb, "Applicable % 2027",
      ["Income from (% FPL)", "Income to (% FPL)", "Initial %", "Final %"],
      [[b["from"], b["to"], b["start"], b["end"]] for b in rules["applicable"]["bands"]] + [[400, "and above", "No credit", "No credit"]],
      [18, 18, 12, 12])

sheet(wb, "Age curve", ["Age", "Premium ratio"], [[k, v] for k, v in rules["ageCurve"]["ratios"].items()], [10, 14])

sheet(wb, "Sources", ["ID", "Publisher", "Title", "URL", "Date", "Type", "Supports"],
      [[s["id"], s["publisher"], s["title"], s["url"], s["date"], s["type"], s["supports"]] for s in sources],
      [16, 22, 40, 50, 12, 22, 60])

method = [
    ["Full price", "State average benchmark for a 40-year-old x (age ratio / 1.278), summed over adults, plus up to 3 children under 21 at the age 0-14 ratio (0.765). NY and VT: no age adjustment."],
    ["Household size", "Adults entered plus all children entered."],
    ["Income as % of poverty line", "Expected 2027 household MAGI / 2026 HHS poverty guideline for household size (Alaska and Hawaii tables where applicable)."],
    ["Expected contribution", "Applicable % from Rev. Proc. 2026-26, interpolated linearly within each band, x income / 12."],
    ["Tax credit", "max(0, household benchmark - expected contribution) when income is 100% to 400% of the poverty line; otherwise 0."],
    ["Status", "Medicaid likely: expansion state and under 138%. Coverage gap: non-expansion state and under 100%. Cliff: over 400%. Otherwise: credit."],
    ["Hero example", "Single 60-year-old in Pennsylvania: at $63,840 (400% FPL) pays about $544/mo for the benchmark; at $63,900 pays the full estimated $1,376/mo, about $9,989 more a year. Model estimate, not a quote."],
    ["Known limits", "State averages, not county prices; children all priced at the 0-14 rate; no cost sharing reductions, state top-up subsidies, employer offers or immigration limits; states with their own age curves are approximate."],
    ["Checked", rules["checked"]],
]
sheet(wb, "Methodology", ["Step", "Rule"], method, [24, 110])

OUT.parent.mkdir(parents=True, exist_ok=True)
wb.save(OUT)
print(f"wrote {OUT}")
