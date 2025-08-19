# ETF Data Fetcher

This module fetches ETF financial data from Morningstar API and saves it as JSON.

## Files

- `fetch-data.py` - Main Python script that fetches Morningstar API data
- `requirements.txt` - Python dependencies
- `Dockerfile` - Docker container configuration
- `run.sh` - Convenient script to build and run the Docker container
- `latest-data/` - Output directory for JSON files

## Usage

### Docker (Recommended)

1. **Build and run using the convenience script:**
   ```bash
   ./run.sh <fund_id>
   ```
   
   Example:
   ```bash
   ./run.sh 0P0001PVDX
   ```

2. **Manual Docker commands:**
   ```bash
   # Build the image
   docker build -t etf-fetcher .
   
   # Run the fetcher
   docker run --rm -v "$(pwd)/latest-data:/app/latest-data" etf-fetcher 0P0001PVDX
   ```

### Local Python (Alternative)

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the script:**
   ```bash
   python fetch-data.py 0P0001PVDX
   ```

## Output

The script creates a JSON file named `<fund_id>.json` in the `latest-data/` directory containing:

```json
{
  "fund_id": "0P0001PVDX",
  "api_url": "https://api-global.morningstar.com/sal-service/v1/etf/process/stockStyle/v2/0P0001PVDX/data",
  "fetch_timestamp": "2025-08-19T09:30:00.123456",
  "http_status": 200,
  "response_size_bytes": 1024,
  "api_response": {
    // Raw API response data
  }
}
```

## Supported Fund IDs

The fetcher works with any Morningstar fund ID. You can find the fund ID in the URL of the Morningstar ETF page:
- URL: `https://global.morningstar.com/en-eu/investments/etfs/0P0001PVDX/portfolio`
- Fund ID: `0P0001PVDX`

## Error Handling

- Network errors and API errors are logged to stdout
- The script continues processing other fund IDs if one fails (when processing multiple IDs)
- The script exits with code 1 on failure
