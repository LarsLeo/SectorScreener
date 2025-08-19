# Use Python 3.13 slim image as base
FROM python:3.13-slim

# Set working directory inside the container
WORKDIR /app

# Install requests library
RUN pip install --no-cache-dir requests

# Create the output directory for data files
RUN mkdir -p /app/latest-data

# Copy the Python script into the container
COPY fetch_fundamentals.py .

# Make the script executable
RUN chmod +x fetch_fundamentals.py

# Create a volume mount point for the output data
VOLUME ["/app/latest-data"]

# Set the default command to run the script
CMD ["python3", "fetch_fundamentals.py"]
