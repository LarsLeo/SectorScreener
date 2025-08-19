# Use Python 3.11 slim image as base
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY main.py .
COPY helpers.py .
COPY fetch_fundamental_data.py .
COPY fetch_price_data.py .

# Create output directory
RUN mkdir -p latest-data

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Default command - can be overridden when running the container
# Usage: docker run etf-fetcher
ENTRYPOINT ["python", "main.py"]
