#!/bin/bash

# ETF Data Fetcher Docker Runner
# Usage: ./run.sh
# This script fetches both fundamental and price data for all configured ETF fund IDs

set -e

IMAGE_NAME="etf-fetcher"
CONTAINER_NAME="etf-fetcher-$(date +%s)"

echo "Building Docker image..."
docker build -t ${IMAGE_NAME} .

echo "Running ETF data fetcher for all configured fund IDs..."
docker run --rm \
    --name ${CONTAINER_NAME} \
    -v "$(pwd)/latest-data:/app/latest-data" \
    ${IMAGE_NAME}

echo "ETF data fetcher completed. Check latest-data/ for output files."
echo "  - latest-data/json/ and latest-data/csv/ for fundamental data"
echo "  - latest-data/stock-prices/ for price data"
