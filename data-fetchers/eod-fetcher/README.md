# EOD Historical Data (EODHD) Fetcher

**⚠️ Secondary Data Source - Requires Paid API Key**

This module serves as an alternative data source for fetching fundamental financial data using the EODHD API. It is the **secondary option** after the primary Morningstar-based ETF fetcher and requires a paid API subscription.

## Important Notes

- **Primary Fetcher**: Use the `etf-fetcher` module for free data access via Morningstar API
- **API Cost**: EODHD API requires a paid subscription after the demo/trial period
- **Demo Mode**: Currently configured with demo API token for testing purposes only
- **Limited Use**: Primarily for data validation and backup data collection

## Files

- `fetch_fundamentals.py` - Main script for fetching fundamental data from EODHD API
- `Dockerfile` - Docker container configuration
- `run.sh` - Convenience script to build and run the Docker container
- `latest-data/` - Output directory for JSON files

## Current Configuration

The fetcher is currently configured to process:
- **VTI.US** - Vanguard Total Stock Market ETF

This can be modified in the `tickers` list within the `main()` function of `fetch_fundamentals.py`.

## API Requirements

### Demo Mode (Current)
- Uses demo API token: `demo`
- Limited functionality and data access
- Suitable for testing and development only

### Production Mode (Requires Subscription)
1. **Sign up** for EODHD API at [eodhd.com](https://eodhd.com)
2. **Purchase a subscription plan** (pricing varies by data access level)
3. **Get your API token** from the dashboard
4. **Replace** the demo token in the code:
   ```python
   url = f'https://eodhd.com/api/fundamentals/{ticker}?api_token=YOUR_API_TOKEN&fmt=json'
   ```

## Usage

### Docker (Recommended)

1. **Build and run using the convenience script:**
   ```bash
   ./run.sh
   ```

2. **Manual Docker commands:**
   ```bash
   # Build the image
   docker build -t fundamentals-fetcher .
   
   # Run the fetcher
   docker run -v "$(pwd)/latest-data:/app/latest-data" fundamentals-fetcher
   ```

### Local Python (Alternative)

1. **Install dependencies:**
   ```bash
   pip install requests
   ```

2. **Run the script:**
   ```bash
   python fetch_fundamentals.py
   ```

## How It Works

1. **Ticker Processing**: Iterates through the predefined list of tickers
2. **Duplicate Prevention**: Checks if data for today already exists before fetching
3. **API Request**: Makes HTTP requests to EODHD fundamental data endpoint
4. **Data Storage**: Saves raw JSON responses with timestamped filenames
5. **Error Handling**: Manages network errors, API failures, and JSON parsing issues

## Output

### File Naming Convention
Files are saved with the pattern: `{ticker}_fundamentals_{YYYYMMDD}.json`

Example: `VTI_US_fundamentals_20250820.json`

### Sample Output Structure
```json
{
  "General": {
    "Code": "VTI",
    "Type": "ETF",
    "Name": "Vanguard Total Stock Market ETF",
    "Exchange": "NASDAQ",
    "CurrencyCode": "USD",
    "Country": "USA"
  },
  "Technicals": {
    "Beta": 1.0,
    "52WeekHigh": 275.50,
    "52WeekLow": 195.25
  },
  "ETF_Data": {
    "Nav": 268.45,
    "ExpenseRatio": 0.03,
    "Dividend_Yield": 1.25
  }
}
```

## Supported Data Types

The EODHD API provides comprehensive fundamental data including:
- **General Information**: Name, exchange, currency, country
- **Technical Indicators**: Beta, 52-week high/low, moving averages
- **ETF-Specific Data**: NAV, expense ratio, dividend yield
- **Holdings**: Top holdings and sector allocations
- **Financial Metrics**: P/E ratios, dividend history

## Adding New Tickers

To process additional tickers, modify the `tickers` list in `fetch_fundamentals.py`:

```python
def main():
    # List of tickers to fetch data for
    tickers = [
        "VTI.US",     # Vanguard Total Stock Market ETF
        "SPY.US",     # SPDR S&P 500 ETF
        "QQQ.US"      # Invesco QQQ Trust
    ]
```

## Ticker Format

Use the EODHD ticker format: `{SYMBOL}.{EXCHANGE}`
- US stocks/ETFs: `VTI.US`, `SPY.US`
- Other exchanges: `ASML.AS` (Amsterdam), `SAP.DE` (Frankfurt)

## Error Handling

- **Network Errors**: Logged with detailed error messages
- **API Errors**: HTTP status codes and responses captured
- **JSON Parsing**: Malformed response handling
- **File Operations**: Directory creation and file write error management
- **Duplicate Prevention**: Automatic skip if today's data already exists

## When to Use This Fetcher

1. **Data Validation**: Cross-reference data from Morningstar with EODHD
2. **Extended Coverage**: Access tickers not available in Morningstar
3. **Backup Data Source**: Fallback when primary source is unavailable
4. **Specialized Metrics**: Access EODHD-specific financial indicators

## Cost Considerations

- **Free Tier**: Very limited (demo mode only)
- **Paid Plans**: Start from $19.99/month for basic access
- **Enterprise**: Custom pricing for high-volume usage
- **Alternative**: Stick with the free Morningstar-based `etf-fetcher` for most use cases

## Integration with Main Project

This fetcher can complement the main ETF analysis workflow by:
1. Providing validation data for Morningstar results
2. Filling gaps in ticker coverage
3. Adding additional fundamental metrics
4. Supporting broader market analysis beyond sector ETFs
