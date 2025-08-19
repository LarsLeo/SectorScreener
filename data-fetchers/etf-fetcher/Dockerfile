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
COPY fetch-data.py .

# Create output directory
RUN mkdir -p latest-data

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Default command - can be overridden when running the container
# Usage: docker run etf-fetcher <fund_id>
ENTRYPOINT ["python", "fetch-data.py"]

# Default argument if none provided
CMD ["0P0001PVDX"]
