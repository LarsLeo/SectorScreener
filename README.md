# SectorScreener

A comprehensive ETF data analysis platform for screening GICS sectors and identifying investment opportunities based on valuation metrics.

## Overview

SectorScreener is a data-driven investment analysis tool that fetches ETF fundamental and price data from external APIs, processes it into structured formats, and provides detailed valuation analysis through automated data workflows. The project helps investors identify undervalued sectors by analyzing key financial metrics across various ETFs.

## Project Purpose

- **ETF Data Collection**: Automatically fetch fundamental and price data for sector ETFs from multiple sources
- **Data Processing**: Transform raw API data into structured CSV and JSON formats for analysis
- **Valuation Analysis**: Perform comprehensive sector screening using key financial metrics
- **Investment Insights**: Identify potentially undervalued sectors for investment opportunities

## Technical Architecture

### Data Sources
- **Morningstar API**: Primary source for ETF fundamental data and pricing information
- **EODHD API**: Secondary source for fundamental data and market information

### Data Fetchers

#### 1. ETF Fetcher (`data-fetchers/etf-fetcher/`)
The main data collection component that interfaces with Morningstar API:

- **`main.py`**: Orchestrator script that coordinates data fetching workflows
- **`fetch_fundamental_data.py`**: Fetches ETF fundamental metrics (P/E ratios, asset allocations, etc.)
- **`fetch_price_data.py`**: Retrieves historical and current price data
- **`helpers.py`**: Utility functions for data processing, file operations, and API interactions

**Key Features:**
- Automated data fetching with error handling and retry logic
- Configurable fund ID lists for targeted ETF screening
- Dual output formats (JSON for raw data, CSV for analysis)
- Combined data aggregation for cross-sector comparison

#### 2. EOD Fetcher (`data-fetchers/eod-fetcher/`)
Alternative data source for fundamental analysis:

- **`fetch_fundamentals.py`**: Fetches fundamental data from EODHD API
- Complementary data source for validation and additional metrics

### Data Storage Structure

```
latest-data/
├── json/           # Raw API responses
├── csv/            # Processed data for analysis
└── stock-prices/   # Historical price data
    ├── json/
    └── csv/
```

### Containerization
Both data fetchers are containerized with Docker for:
- Consistent execution environments
- Easy deployment and scaling
- Isolated dependencies
- Automated scheduling capabilities

## Data Workflow

1. **Data Fetching**: Scripts automatically query external APIs for ETF data
2. **Data Processing**: Raw JSON responses are transformed into structured CSV files
3. **Data Aggregation**: Individual ETF data is combined into sector-wide datasets
4. **Analysis Ready**: Processed data feeds into Excel-based valuation models

## Analysis & Visualization

### ETFValuation.xlsx
A comprehensive Excel workbook containing:
- **Detailed Financial Analysis**: P/E ratios, dividend yields, expense ratios
- **Sector Comparisons**: Cross-sector valuation metrics
- **Historical Trends**: Time-series analysis of key indicators
- **Investment Scoring**: Quantitative ranking of investment opportunities
- **Risk Assessment**: Volatility and correlation analysis

## Key Features

- **Automated Data Pipeline**: Scheduled data fetching and processing
- **Multi-Source Validation**: Cross-reference data from multiple APIs
- **Flexible Output Formats**: Both machine-readable (CSV/JSON) and human-readable (Excel)
- **Error Handling**: Robust error handling with failed request tracking
- **Scalable Architecture**: Easy to add new ETFs or data sources

## Dependencies

### Python Libraries
- `requests`: HTTP API interactions
- `beautifulsoup4`: HTML parsing for web scraping
- `pandas`: Data manipulation and analysis (implied from CSV operations)
- `json`: Data serialization
- `datetime`: Timestamp management

### External APIs
- Morningstar API (primary)
- EODHD API (secondary)

## Getting Started

1. **Clone the repository**
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Configure API credentials** in the respective fetcher directories
4. **Run data fetchers**: Execute `main.py` in the etf-fetcher directory
5. **Analyze results**: Open `ETFValuation.xlsx` for comprehensive analysis

## Project Structure

```
SectorScreener/
├── README.md
├── ETFValuation.xlsx              # Main analysis workbook
├── data-fetchers/
│   ├── etf-fetcher/              # Primary data fetcher
│   │   ├── main.py               # Orchestrator
│   │   ├── fetch_fundamental_data.py
│   │   ├── fetch_price_data.py
│   │   ├── helpers.py            # Utility functions
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── latest-data/          # Fetched data storage
│   └── eod-fetcher/              # Alternative data source
│       ├── fetch_fundamentals.py
│       ├── Dockerfile
│       └── latest-data/
└── .github/
    └── copilot-instructions.md   # AI assistant configuration
```

## Investment Methodology

The project implements a systematic approach to sector analysis:

1. **Data Collection**: Comprehensive ETF data across GICS sectors
2. **Metric Calculation**: Key valuation ratios and financial indicators
3. **Comparative Analysis**: Cross-sector and historical comparisons
4. **Risk Adjustment**: Volatility and correlation considerations
5. **Investment Scoring**: Quantitative ranking system for opportunities

This data-driven approach helps identify potentially undervalued sectors while maintaining awareness of associated risks and market conditions.