#!/usr/bin/env python3
"""
Data fetcher script for fundamental data from EODHD API.
This script fetches fundamental data for specified tickers using the EODHD API.
"""

import requests
import json
import sys
import os
from datetime import datetime


def generate_filename(ticker):
    """
    Generate a standardized filename for a ticker's fundamental data.
    
    Args:
        ticker (str): The ticker symbol (e.g., 'VTI.US')
    
    Returns:
        str: The generated filename
    """
    timestamp = datetime.now().strftime("%Y%m%d")
    # Clean ticker for filename (replace dots with underscores)
    clean_ticker = ticker.replace('.', '_')
    filename = f"{clean_ticker}_fundamentals_{timestamp}.json"
    return filename


def save_data_to_file(data, filepath):
    """
    Save the fetched data to a JSON file.
    
    Args:
        data (dict): The data to save
        filepath (str): The complete file path where to save the data
    
    Returns:
        str: The path to the saved file, or None if save failed
    """
    try:
        # Ensure output directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Save data to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Data saved to: {filepath}")
        return filepath
        
    except Exception as e:
        print(f"Error saving data to file: {e}")
        print(f"Error saving data to file: {e}")
        return None


def fetch_ticker_fundamentals(ticker):
    """
    Fetch fundamental data for a specific ticker from EODHD API.
    
    Args:
        ticker (str): The ticker symbol (e.g., 'VTI.US')
    
    Returns:
        dict: JSON response from the API
    """
    url = f'https://eodhd.com/api/fundamentals/{ticker}?api_token=demo&fmt=json'
    
    try:
        print(f"Fetching {ticker} fundamental data from EODHD API...")
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        data = response.json()
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response for {ticker}: {e}")
        return None


def main():
    """
    Main function to execute the data fetching and saving.
    """
    # List of tickers to fetch data for
    tickers = ["VTI.US"]
    output_dir = "latest-data"
    
    print(f"Processing {len(tickers)} ticker(s): {', '.join(tickers)}")
    
    for ticker in tickers:
        print(f"\n--- Processing {ticker} ---")
        
        # Generate filename and filepath for this ticker
        filename = generate_filename(ticker)
        filepath = os.path.join(output_dir, filename)

        # Check if data for today already exists for this ticker
        data_exists = os.path.exists(filepath)
        
        if data_exists:
            print(f"Data for {ticker} today already exists at: {filepath}")
            print("Skipping data fetch to avoid duplicate downloads.")
            continue
        
        print(f"No data found for {ticker} today. Fetching new data...")
        data = fetch_ticker_fundamentals(ticker)
        
        if data:
            print(f"Successfully fetched {ticker} fundamental data")
            
            # Save data to JSON file
            saved_file = save_data_to_file(data, filepath)
            
            if saved_file:
                print(f"Data successfully saved to {saved_file}")
            else:
                print(f"Failed to save data for {ticker}")
        else:
            print(f"Failed to fetch data for {ticker}")
    
    print("\nData fetching process completed.")


if __name__ == "__main__":
    main()
