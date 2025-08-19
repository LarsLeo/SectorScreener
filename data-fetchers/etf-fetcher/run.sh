#!/bin/bash

# ETF Data Fetcher Docker Runner
# Usage: ./run.sh <fund_id>
# Example: ./run.sh 0P0001PVDX

set -e

IMAGE_NAME="etf-fetcher"
CONTAINER_NAME="etf-fetcher-$(date +%s)"

echo "Building Docker image..."
docker build -t ${IMAGE_NAME} .

echo "Running data fetcher for"
docker run --rm \
    --name ${CONTAINER_NAME} \
    -v "$(pwd)/latest-data:/app/latest-data" \
    ${IMAGE_NAME}

echo "Data fetcher completed. Check latest-data/ for output files."
