#!/usr/bin/env python3
"""Build the companion sources and methodology workbook from the page's JSON data.

Usage: python3 scripts/build_xlsx.py
Writes public/medicaid-work-rule-countdown_sources.xlsx so the page can link it.
The JSON files in src/data are the single source of truth; rerun after editing them.
"""
import json
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "data"
OUT = ROOT / "public" / "medicaid-work-rule-countdown_sources.xlsx"
CHECKED = "2026-11-22"

states = json.loads((DATA / "states.json").read_text())
timeline = json.loads((DATA / "timeline.json").read_text())
sources = json.loads((DATA / "sources.json").read_text())
src_by_id = {s["id"]: s for s in sources}

HEAD = Font(bold=True, color="FFFFFF")
FILL = PatternFill("solid", fgColor="0F766E")
WRAP = Alignment(wrap_text=True, vertical="top")

HH = {
    "yes": "Using the grace period",
    "leaning": "Leaning toward the grace period",
    "no": "Not using the grace period",
    "undecided": "Has not decided",
    "not_announced": "No public decision yet",
    "n/a": "Rule does not apply",
}
COVERAGE = {
    "expansion": "Yes (ACA expansion adults)",
    "waiver": "Yes (waiver group only; not a full expansion state)",
    "none": "No",
}


def sheet(wb, title, headers, rows, widths):
    ws = wb.create_sheet(title)
    ws.append(headers)
    for c in ws[1]:
        c.font = HEAD
        c.fill = FILL
        c.alignment = WRAP
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
readme = wb.active
readme.title = "README"
lines = [
    ["Medicaid Work Rule Countdown: data, sources and methodology"],
    ["Companion workbook for the translating.policy page (v1). Facts checked " + CHECKED + "."],
    [""],
    ["Sheets"],
    ["States", "Raw data: one row per state and DC. Whether the federal rule applies, the state's public hold harmless (grace period) position, early starts, and sources."],
    ["Timeline", "Dated milestones shown on the page, with sources."],
    ["Sources", "Every source used, with URL, publisher, date, type and what it supports."],
    ["Checker rules", "The logic behind the 'Does this apply to me?' tool."],
    ["Methodology", "How the data was gathered and what it does not cover."],
    ["PRD corrections", "Where the Nov 20 mini-PRD differed from what primary sources say."],
    [""],
    ["Not legal advice. Every cell is sourced; nothing is estimated."],
]
for ln in lines:
    readme.append(ln)
readme["A1"].font = Font(bold=True, size=14)
readme.column_dimensions["A"].width = 22
readme.column_dimensions["B"].width = 110

sheet(
    wb,
    "States",
    ["Code", "State", "Must run the rule?", "Hold harmless position", "Reported protection through", "Early start", "Note", "Source IDs", "Source URLs", "Checked"],
    [
        [
            s["code"],
            s["name"],
            COVERAGE[s["coverage"]],
            HH[s["holdHarmless"]],
            s.get("protectedThrough", ""),
            s.get("early", ""),
            s["note"],
            ", ".join(s["sources"]),
            "\n".join(src_by_id[i]["url"] for i in s["sources"]),
            s["checked"],
        ]
        for s in sorted(states, key=lambda x: x["name"])
    ],
    [7, 20, 26, 26, 26, 40, 70, 30, 70, 12],
)

sheet(
    wb,
    "Timeline",
    ["Date", "Type", "Event", "Detail", "Source IDs", "Source URLs"],
    [
        [e["date"], e["kind"], e["label"], e["detail"], ", ".join(e["sources"]), "\n".join(src_by_id[i]["url"] for i in e["sources"])]
        for e in timeline
    ],
    [12, 10, 32, 70, 30, 70],
)

sheet(
    wb,
    "Sources",
    ["ID", "Title", "Publisher", "Date", "Type", "Used for", "URL", "Read on"],
    [[s["id"], s["title"], s["publisher"], s["date"], s["type"], s["usedFor"], s["url"], CHECKED] for s in sources],
    [16, 60, 26, 12, 26, 60, 70, 12],
)

sheet(
    wb,
    "Checker rules",
    ["Step", "Question", "Rule", "Source IDs"],
    [
        [1, "State", "If the state has not adopted the ACA expansion and has no covered waiver group (AL, FL, KS, MS, SC, TX, WY), result: likely does not apply. GA, TN, WI: covered for waiver adults only, with a caveat.", "kff-expansion, kff-elections, cms-factsheet"],
        [2, "Age", "Under 19 or 65 and older: likely does not apply.", "cms-factsheet, crs-r48755"],
        [3, "Medicare", "Entitled to or enrolled in Medicare: likely does not apply.", "cms-factsheet"],
        [4, "Medicaid group", "Covered only in the adult (expansion) group or certain 1115 demonstrations. Other groups: likely does not apply.", "cms-factsheet"],
        [5, "Exemptions", "Any of: pregnant or postpartum; parent or caretaker of a child 13 or under or of a disabled person; medically frail (5 groups; extra impairment test vacated Oct 29, 2026); veteran with total disability rating; American Indian or Alaska Native; former foster youth; in drug or alcohol treatment; meets TANF work rules or in a SNAP household not exempt from SNAP work rules; inmate. Result: likely exempt.", "cms-factsheet, ml-vacatur, hma-ruling"],
        [6, "Activities", "80 hours a month of work, community service, or work program; half-time school; a combination; or income of at least federal minimum wage x 80 ($580 a month in 2026). Result: covered and likely meets it.", "cms-factsheet, fed-reg"],
        [7, "Fallback", "Any 'not sure' answer with no exemption or activity: unclear. Otherwise: likely covered. The result distinguishes reported grace-period protection, no grace period, and unconfirmed timing. Shows notice and hardship guidance.", "cms-factsheet, smd-26-006"],
    ],
    [6, 18, 100, 40],
)

sheet(
    wb,
    "Methodology",
    ["Topic", "Method"],
    [
        ["Rule details", "Taken from federal primary sources first: CMS fact sheet for CMS-2454-IFC, the Federal Register rule (FR Doc. 2026-11094), CMS letter SMD 26-006 and the CMS press release. CRS report R48755 used for statute details. Law firm and research summaries used only to cross-check or where noted."],
        ["Which states must run the rule", "CMS says 43 states and DC cover the affected groups. KFF (Nov 13, 2026) says 44 jurisdictions including DC: the 41 expansion jurisdictions (40 states plus DC) plus waiver groups in Georgia, Tennessee and Wisconsin. The 7 remaining states are not covered. These two counts agree."],
        ["Hold harmless positions", "No federal list exists. Positions come from dated public statements by governors or state agencies, as reported by news and trade outlets. States with no public statement are marked 'No public decision yet', not guessed. Leaning or undecided statements are labeled as such."],
        ["Early starts", "From a June 2026 law firm summary and the April 2026 KFF state survey. Nebraska's launch is confirmed by trade press; Montana, Iowa and Arkansas show planned dates."],
        ["Court cases", "From law firm and consulting summaries of the Oct 29, 2026 ruling and news coverage of the Nov 5, 2026 suit. The court order itself was not read for v1."],
        ["Not included in v1", "State enrollment counts for the adult group (data.medicaid.gov and catalog.data.gov could not be reached from the build environment). No coverage loss projections are shown on the page. No user answers are stored."],
        ["Refresh", "Recheck state positions weekly through Dec 11, 2026, then monthly. Edit src/data/*.json, then rerun scripts/build_xlsx.py."],
    ],
    [28, 120],
)

sheet(
    wb,
    "PRD corrections",
    ["Mini-PRD said", "What sources show", "Source IDs"],
    [
        ["States must elect the hold harmless period by Dec 11, 2026.", "CMS 'asked' states that want it from Jan 1 to notify CMS by Dec 11, 2026, as part of their mitigation plans; CMS must approve. It reads as a request, not a statutory deadline.", "smd-26-006"],
        ["The Oct 29 ruling was a 'partial court vacatur on medical frailty'.", "Correct in substance: it vacated only the extra requirement that people in a medically frail group also show a functional impairment. Sources differ on whether it covers all states or only the 25 plaintiff states and DC.", "ml-vacatur, hma-ruling"],
        ["43 states plus DC; seven states outside the requirement.", "Confirmed. Note that Tennessee, a non-expansion state, is covered through a TennCare waiver group, alongside Georgia and Wisconsin.", "cms-factsheet, kff-elections"],
        ["Checker inputs listed half-time school and $580 earnings alongside the exemptions.", "Those are ways to comply rather than exemptions, so the page asks about them as a separate question.", "cms-factsheet"],
        ["CBO estimate of about $326 billion (unverified).", "Not used. Not verified against CBO for v1.", ""],
    ],
    [50, 90, 30],
)

OUT.parent.mkdir(parents=True, exist_ok=True)
wb.save(OUT)
print("wrote", OUT.relative_to(ROOT))
