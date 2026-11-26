# Method
1. 2026 monthly basic pay: officers O-1 to O-6 copied from the DFAS 2026 table (S6).
2. Enlisted: the DFAS enlisted page served on Nov 25, 2026 still showed the April 1, 2025 table (S7). 2026 rates = April 2025 rate x 1.038, rounded to $0.10, except where Military.com publishes the 2026 rate (S8), which is used instead, including other cells in the same row with the same 2025 rate. Computed cells differ from published ones by at most $0.10 in the 49 cells we could compare.
3. 2027 = 2026 x (1 + scenario rate). Officers capped at Executive Schedule Level V using the 2026 rate ($15,408.30), because 2027 executive pay is not set.
4. Annual gap = monthly gap x 12. Basic pay only, before taxes.
Each cell's basis is stored in src/data/pay.json (dfas_2026, published_2026, published_2026_same_rate, computed_2025x1.038).
