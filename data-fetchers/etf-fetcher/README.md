# ETF Data Fetcher

This module fetches ETF fundamental and price data from Morningstar API and saves it in both JSON and CSV formats.

## Files

- `main.py` - Main orchestrator script that coordinates data fetching workflows
- `fetch_fundamental_data.py` - Fetches ETF fundamental data (P/E ratios, asset allocations, etc.)
- `fetch_price_data.py` - Fetches historical and current price data
- `helpers.py` - Shared utility functions for data processing and file operations
- `requirements.txt` - Python dependencies
- `Dockerfile` - Docker container configuration
- `run.sh` - Convenient script to build and run the Docker container
- `latest-data/` - Output directory for JSON and CSV files

## Usage

### Docker (Recommended)

1. **Build and run using the convenience script:**
   ```bash
   ./run.sh
   ```

2. **Manual Docker commands:**
   ```bash
   # Build the image
   docker build -t etf-fetcher .
   
   # Run the fetcher
   docker run --rm -v "$(pwd)/latest-data:/app/latest-data" etf-fetcher
   ```

### Local Python (Alternative)

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the orchestrator:**
   ```bash
   python main.py
   ```

## How It Works

The data fetcher uses a predefined list of fund IDs (configured in `helpers.py`) and automatically processes all of them:

1. **Fund ID Configuration**: The list of ETFs to process is defined in the `get_fund_ids()` function
2. **Fundamental Data**: Fetches key metrics like P/E ratios, expense ratios, asset allocations
3. **Price Data**: Retrieves historical price information and current valuations
4. **Data Processing**: Converts raw API responses into both JSON (raw data) and CSV (analysis-ready) formats
5. **Data Aggregation**: Combines individual ETF data into sector-wide datasets

## Current Fund List

The fetcher processes these ETFs (configured in `helpers.py`):

- **0P0001PVDX** - Amundi S&P World Comm Svcs Scrn ETF Dist
- **0P0001K9I4** - Amundi MSCI Semiconductors ETF Dis  
- **F00001EK0E** - Amundi S&P World Industrials Scrn ETF Dis
- **0P0001PVEX** - Amundi S&P World Materials Scrn ETF Dist
- **0P0001PVEF** - Amundi S&P World Utilities Scrn ETF Dist
- **0P0001FHMG** - HSBC FTSE EPRA/NAREIT Developed ETF
- **F000011FXJ** - iShares Digital Security ETF USD Dist
- **F0000171MM** - iShares MSCI Wld Fi Sec Advcd ETF USD Inc
- **0P0001IM5L** - iShares MSCI Wld HlthCr Sect Advcd ETF $ Inc
- **0P0001IM5Q** - iShares MSCI Wld CnsmrStp Sect Advcd ETF $ Inc
- **0P0001IM5I** - iShares MSCI Wld InfoTech Sect Advcd ETF $ Inc
- **0P0001IM5P** - iShares MSCI Wld CnsmrDisc Sect Advcd ETF $ Inc

## Output Structure

The script creates the following directory structure in `latest-data/`:

```
latest-data/
├── json/                    # Raw API responses
│   ├── 0P0001PVDX.json     # Individual fund data
│   └── ...
├── csv/                     # Processed fundamental data
│   ├── 0P0001PVDX.csv      # Individual fund metrics
│   ├── combined-sector-data.csv  # Aggregated data
│   └── ...
└── stock-prices/           # Price data
    ├── json/               # Raw price responses
    └── csv/                # Processed price data
        ├── 0P0001PVDX_price.csv
        ├── combined-price-data.csv
        └── ...
```

## Sample Output

### Fundamental Data JSON
```json
{
  "fund_id": "0P0001PVDX",
  "api_url": "https://api-global.morningstar.com/sal-service/v1/etf/...",
  "fetch_timestamp": "2025-08-19T09:30:00.123456",
  "http_status": 200,
  "response_size_bytes": 1024,
  "api_response": {
    // Raw Morningstar API response data
  }
}
```

### CSV Output
The CSV files contain processed metrics suitable for analysis:
- P/E ratios, dividend yields, expense ratios
- Asset allocation percentages
- Historical performance data
- Risk metrics and correlations

## Finding Fund IDs

Fund IDs can be found in Morningstar ETF URLs:
- URL: `https://global.morningstar.com/en-eu/investments/etfs/0P0001PVDX/portfolio`
- Fund ID: `0P0001PVDX`

To add new ETFs, update the `get_fund_ids()` function in `helpers.py`.

## Error Handling

- Network errors and API failures are logged with detailed information
- Failed requests are tracked and reported in the summary
- Individual fund failures don't stop processing of other funds
- The orchestrator provides a comprehensive execution summary
