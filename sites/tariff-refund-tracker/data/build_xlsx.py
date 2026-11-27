"""Builds tariff-refund-tracker_sources.xlsx and sources.csv from src/data/refunds.json.
Run: python3 data/build_xlsx.py  (from sites/tariff-refund-tracker)"""
import csv, json, pathlib
from openpyxl import Workbook
from openpyxl.styles import Font

here = pathlib.Path(__file__).parent
d = json.loads((here.parent / "src/data/refunds.json").read_text())
srcname = {s["id"]: s["name"] for s in d["sources"]}
bold = Font(bold=True)
wb = Workbook()

ws = wb.active; ws.title = "Raw data"
ws.append(["Item", "Value", "Unit", "Qualifier", "Date", "Source id", "Note"]); 
t = d["totals"]
ws.append(["IEEPA tariffs paid by importer class (est.)", t["ieepaCollectedBillions"], "USD billions", "about", "Feb 1, 2025 to Feb 19, 2026", t["ieepaCollectedSource"], t["ieepaCollectedNote"]])
ws.append(["May stay with government (court estimate)", t["mayStayWithGovernmentBillions"], "USD billions", "roughly", d["asOf"], t["mayStaySource"], t["mayStayNote"]])
ws.append(["US households", t["householdsThousands"], "thousands", "", str(t["householdsYear"]), t["householdsSource"], "FRED TTLHH annual observation"])
for m in d["milestones"]:
    ws.append([m["measure"], m["billions"], "USD billions", m["qualifier"], m["date"], m["source"], m["label"]])
c = d["capeSnapshot"]
for k in ["acceptedIntoCapeBillions", "declarationsSubmitted", "declarationsAccepted", "entriesCovered", "onHoldNoBankInfoCount", "onHoldNoBankInfoBillions"]:
    ws.append([f"CAPE snapshot: {k}", c[k], "USD billions" if "Billions" in k else "count", "about / more than", "2026-09-17", c["source"], "Relayed from CBP declaration to the CIT"])

ws2 = wb.create_sheet("Timeline")
ws2.append(["Date", "Approximate", "Event", "Detail", "Source id", "Date note"])
for e in d["timeline"]:
    ws2.append([e["date"], "yes" if e.get("approxDate") else "no", e["label"], e["detail"], e["source"], e.get("dateNote", "")])

ws3 = wb.create_sheet("Sources")
ws3.append(["Id", "Name", "URL", "Kind", "What it cites"])
for s in d["sources"]:
    ws3.append([s["id"], s["name"], s["url"], s["kind"], s["cites"]])

ws4 = wb.create_sheet("Methodology")
for line in [
    "Household figure = IEEPA total (USD) x pass-through share / US households. Pass-through share is a reader-chosen assumption (0 to 100%), not an estimate.",
    "Even split across households is illustrative; spending on imported goods varies widely by household.",
    "Refund milestones come from three different reports and measure slightly different things (disbursed vs certified and sent to Treasury). They are shown side by side, not as a single series.",
    "Most figures are secondary reports that cite court filings and CBP data. Primary documents (CBP declarations, CIT orders, Treasury Monthly Statement) should replace them before publication; see open questions in the mini-PRD.",
    "Approximate dates (month only) are stored as mid-month placeholders and displayed as month and year.",
]:
    ws4.append([line])

for w in wb.worksheets:
    for cell in w[1]: cell.font = bold
wb.save(here / "tariff-refund-tracker_sources.xlsx")

with open(here / "sources.csv", "w", newline="") as f:
    wr = csv.writer(f); wr.writerow(["id", "name", "url", "kind", "cites"])
    for s in d["sources"]: wr.writerow([s["id"], s["name"], s["url"], s["kind"], s["cites"]])
print("wrote xlsx and csv")
