#!/usr/bin/env python3
"""
Morningstar ETF price data fetcher script.
This script fetches ETF price data from Morningstar API and saves it as JSON and CSV.
"""

import requests
import json
import sys
import os
import random
from datetime import datetime
from typing import Dict, List, Optional, Any
from helpers import (
    ensure_directory_exists, 
    get_script_directory, 
    save_json_data, 
    save_csv_data, 
    save_combined_csv_data,
    save_failed_fund_ids,
    get_fund_ids,
    print_processing_summary,
    get_morningstar_common_headers,
    get_morningstar_common_params,
    get_fund_config
)


def get_morningstar_price_headers(fund_id: str) -> Dict[str, str]:
    """
    Get headers specific to price data API requests.
    
    Args:
        fund_id (str): The fund ID (used for referer) 
    
    Returns:
        dict: Headers for price data API requests
    """
    headers = get_morningstar_common_headers(fund_id)
    headers['cache-control'] = 'no-cache, no-store, must-revalidate'
    headers['x-api-requestid'] = f'{random.randint(10000000, 99999999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(100000000000, 999999999999)}'
    return headers


def get_morningstar_price_params() -> Dict[str, str]:
    """
    Get query parameters specific to price data API requests.
    
    Returns:
        dict: Query parameters for price data API requests
    """
    params = get_morningstar_common_params()
    params['component'] = 'sal-etf-quote'
    params['secExchangeList'] = ''
    params['random'] = random.random()
    return params


def fetch_morningstar_price_data(fund_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch price data from Morningstar API.
    
    Args:
        fund_id (str): The Morningstar fund ID (e.g., '0P0001PVDX')
    
    Returns:
        dict: API response data with metadata
    """
    # API endpoint for price data
    url = f"https://api-global.morningstar.com/sal-service/v1/etf/quote/realTime/{fund_id}/data"
    
    # Get parameters and headers from helpers
    params = get_morningstar_price_params()
    headers = get_morningstar_price_headers(fund_id)
    
    try:
        print(f"Fetching price data from Morningstar API for fund: {fund_id}")
        print(f"URL: {url}")
        
        response = requests.get(url, headers=headers, params=params, timeout=30)
        response.raise_for_status()
        
        # Check if response is empty
        if not response.content:
            print(f"Warning: Empty response received for fund {fund_id}")
            return None
        
        # Log response details for debugging
        print(f"Response status: {response.status_code}")
        print(f"Response content type: {response.headers.get('content-type', 'unknown')}")
        print(f"Response size: {len(response.content)} bytes")
        
        # Handle non-JSON responses (like Morningstar API errors)
        content_type = response.headers.get('content-type', '').lower()
        if 'application/json' not in content_type:
            print(f"Non-JSON response received for fund {fund_id}")
            if response.status_code == 206:
                print(f"API Error: {response.text.strip()}")
                if "Can't get SecurityInfo" in response.text:
                    print(f"Fund ID {fund_id} not found in Morningstar database")
            else:
                print(f"Response content: {response.text[:500]}")
            return None
        
        # Parse JSON response
        try:
            api_data = response.json()
        except json.JSONDecodeError as e:
            print(f"JSON decode error for fund {fund_id}: {e}")
            print(f"Response content preview (first 500 chars): {response.text[:500]}")
            return None
        
        # Prepare enhanced data structure with metadata
        data = {
            'fund_id': fund_id,
            'api_url': url,
            'fetch_timestamp': datetime.now().isoformat(),
            'http_status': response.status_code,
            'response_size_bytes': len(response.content),
            'api_response': api_data
        }
        
        print(f"Successfully fetched price data for fund {fund_id}")
        
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching price data from Morningstar API: {e}")
        return None
    except Exception as e:
        print(f"Error processing Morningstar API price data: {e}")
        return None


def prepare_price_csv_row(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare a CSV row from price data.
    
    Args:
        data (dict): The price data dictionary
    
    Returns:
        dict: A dictionary representing a CSV row
    """
    # Extract the API response data
    api_response = data.get('api_response', {})
    fund_id = data.get('fund_id', '')
    
    # Get fund configuration to retrieve the fund name
    fund_config = get_fund_config()
    fund_name = fund_config.get(fund_id, '')
    
    # Prepare CSV row with relevant price information
    csv_row = {}
    
    # Add fund name as the first column
    csv_row['fund_name'] = fund_name
    csv_row['fund_id'] = fund_id
    csv_row['fetch_timestamp'] = data.get('fetch_timestamp', '')
    
    # Add price-specific data from the API response
    # The structure may vary, so we'll extract common price fields
    if isinstance(api_response, dict):
        # Extract commonly available price fields
        price_fields = [
            'price', 'priceChange', 'priceChangePercent', 'currency',
            'lastPrice', 'nav', 'navChange', 'navChangePercent',
            'marketCap', 'volume', 'lastUpdated', 'asOfDate'
        ]
        
        # Add fields if they exist in the response
        for field in price_fields:
            if field in api_response:
                csv_row[field] = api_response[field]
        
        # Add any other fields from the root level of api_response
        for key, value in api_response.items():
            if key not in price_fields and not isinstance(value, (dict, list)):
                csv_row[key] = value
    
    return csv_row


def get_price_output_paths(fund_id: str) -> Dict[str, str]:
    """
    Get the output file paths for price JSON and CSV files.
    
    Args:
        fund_id (str): The fund ID
    
    Returns:
        dict: Dictionary containing json_path and csv_path for price data
    """
    script_dir = get_script_directory()
    json_output_dir = os.path.join(script_dir, 'latest-data', 'stock-prices', 'json')
    csv_output_dir = os.path.join(script_dir, 'latest-data', 'stock-prices', 'csv')
    
    return {
        'json_path': os.path.join(json_output_dir, f"{fund_id}_price.json"),
        'csv_path': os.path.join(csv_output_dir, f"{fund_id}_price.csv"),
        'script_dir': script_dir
    }


def fetch_all_price_data() -> int:
    """
    Fetch price data for all fund IDs.
    
    Returns:
        int: Exit code (0 for success, 1 for failure)
    """
    fund_ids = get_fund_ids()
    
    print(f"Processing price data for {len(fund_ids)} fund ID(s): {', '.join(fund_ids)}")
    
    successful_fetches = 0
    failed_fetches = 0
    failed_fund_ids = []
    all_successful_data = []  # Store all successfully fetched data for combined CSV
    
    # Iterate through each fund ID
    for i, fund_id in enumerate(fund_ids, 1):
        print(f"\n--- Processing price data for fund {i}/{len(fund_ids)}: {fund_id} ---")
        
        # Validate fund_id format (basic validation)
        if not fund_id or len(fund_id) < 5:
            print(f"Invalid fund ID: {fund_id}, skipping...")
            failed_fetches += 1
            failed_fund_ids.append(fund_id)
            continue
        
        # Fetch price data from Morningstar API
        data = fetch_morningstar_price_data(fund_id)
        
        if data is None:
            print(f"Failed to fetch price data from Morningstar API for {fund_id}")
            failed_fetches += 1
            failed_fund_ids.append(fund_id)
            continue
        
        # Get output file paths using the helper function
        paths = get_price_output_paths(fund_id)
        
        # Prepare CSV data
        csv_row = prepare_price_csv_row(data)
        
        # Save data to JSON file
        saved_json = save_json_data(data, paths['json_path'])
        
        # Save data to CSV file
        saved_csv = save_csv_data(csv_row, paths['csv_path'])
        
        if saved_json and saved_csv:
            print(f"Successfully saved Morningstar price data for {fund_id} (JSON and CSV)")
            successful_fetches += 1
            all_successful_data.append(csv_row)  # Add CSV row to combined data list
        else:
            print(f"Failed to save price data for {fund_id}")
            failed_fetches += 1
            failed_fund_ids.append(fund_id)
    
    # Create combined CSV file if we have successful data
    if all_successful_data:
        script_dir = get_script_directory()
        combined_csv_file = os.path.join(script_dir, 'latest-data', 'stock-prices', 'csv', 'combined-price-data.csv')
        save_combined_csv_data(all_successful_data, combined_csv_file)
    
    # Print summary and save failed fund IDs
    print_processing_summary(successful_fetches, failed_fetches, failed_fund_ids)
    save_failed_fund_ids(failed_fund_ids, 'failed_price_fund_ids.json')
    
    return 1 if failed_fetches > 0 and successful_fetches == 0 else 0


def main():
    """
    Main function to fetch and save Morningstar ETF price data.
    """
    exit_code = fetch_all_price_data()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
