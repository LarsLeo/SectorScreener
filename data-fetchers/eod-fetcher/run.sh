#!/usr/bin/env bash
docker build -t fundamentals-fetcher . && docker run -v $(pwd)/latest-data:/app/latest-data fundamentals-fetcher