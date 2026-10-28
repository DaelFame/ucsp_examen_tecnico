# Academic Demand & Competitive Benchmark — Peruvian Higher Education

## 📌 Business Problem
Peruvian universities decide which academic programs to open, sustain, or discontinue without a consolidated view of demand or competitive position. Enrollment and admission data is published as fragmented, dirty semester-level files, making strategic decisions a matter of intuition rather than data.

## 🎯 The Solution
This project consolidates that data into a validated star schema, moving from 21.4 million raw records to 617,000 trustworthy records across 5 dimensions (university, program, period, geography, and campus) covering 177 institutions and 537 professional programs.

## 📊 Business Impact & Key Findings
* **Data Quality:** Removed 902,000+ duplicates and achieved 100% referential integrity across 9 foreign-key relationships.
* **Competitive Benchmarking:** Built a 33-measure semantic model delivering market-share tracking (benchmarking the institution against 177 universities) and year-over-year variance analysis.
* **Decision Support:** Delivered annual Top/Bottom-5 program rankings to support academic portfolio decisions, enrollment planning, and marketing budget allocation.
* **DAX & Logic Audit:** Identified and resolved critical filter-context bugs (REMOVEFILTERS) that falsified competitive market share, fixed broken YoY variance calculations (which previously spiked to 451% due to missing prior-year data), and implemented an apples-to-apples semester-average measure to correctly compare annual and semester data.

## 🛠️ Tech Stack
* **Data Engineering:** Python, SQL (ETL, Deduplication)
* **Data Modeling:** Kimball Star Schema, DAX
* **Visualization:** Power BI

## 📸 Dashboard Preview
*(Screenshots will be uploaded shortly)*
