#!/usr/bin/env python3
"""
Morningstar ETF fundamental data fetcher script.
This script fetches ETF fundamental data from Morningstar API and saves it as JSON and CSV.
"""

import requests
import json
import sys
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from helpers import (
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


def get_morningstar_fundamental_headers(fund_id: str) -> Dict[str, str]:
    """
    Get headers specific to fundamental data API requests.
    
    Args:
        fund_id (str): The fund ID (used for referer)
    
    Returns:
        dict: Headers for fundamental data API requests
    """
    headers = get_morningstar_common_headers(fund_id)
    headers['x-api-requestid'] = 'd3be84bb-804d-06c8-b2c8-e35f28e52f10'
    return headers


def get_morningstar_fundamental_params() -> Dict[str, str]:
    """
    Get query parameters specific to fundamental data API requests.
    
    Returns:
        dict: Query parameters for fundamental data API requests
    """
    params = get_morningstar_common_params()
    params['component'] = 'sal-mip-measures'
    return params


def prepare_csv_row_from_fund_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare a CSV row from fund data.
    
    Args:
        data (dict): The fund data dictionary
    
    Returns:
        dict: A dictionary representing a CSV row
    """
    # Extract the API response data
    api_response = data.get('api_response', {})
    fund_data = api_response.get('fund', {})
    fund_id = data.get('fund_id', '')
    
    # Get fund configuration to retrieve the fund name
    fund_config = get_fund_config()
    fund_name = fund_config.get(fund_id, '')
    
    # Prepare CSV row with custom column order
    csv_row = {}
    
    # Add fund name as the first column
    csv_row['fund_name'] = fund_name
    csv_row['fund_id'] = fund_id
    
    # Add remaining fund fields (excluding the ones already added and secId)
    for key, value in fund_data.items():
        if key not in ['name', 'secId']:
            csv_row[key] = value
    
    return csv_row


def get_fundamental_output_paths(fund_id: str) -> Dict[str, str]:
    """
    Get the output file paths for fundamental JSON and CSV files.
    
    Args:
        fund_id (str): The fund ID
    
    Returns:
        dict: Dictionary containing json_path and csv_path for fundamental data
    """
    script_dir = get_script_directory()
    json_output_dir = os.path.join(script_dir, 'latest-data', 'json')
    csv_output_dir = os.path.join(script_dir, 'latest-data', 'csv')
    
    return {
        'json_path': os.path.join(json_output_dir, f"{fund_id}.json"),
        'csv_path': os.path.join(csv_output_dir, f"{fund_id}.csv"),
        'script_dir': script_dir
    }


def fetch_morningstar_data(fund_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch data from Morningstar API.
    
    Args:
        fund_id (str): The Morningstar fund ID (e.g., '0P0001PVDX')
    
    Returns:
        dict: API response data with metadata
    """
    # API endpoint from the curl command
    url = f"https://api-global.morningstar.com/sal-service/v1/etf/process/stockStyle/v2/{fund_id}/data"
    
    # Get parameters and headers from helpers
    params = get_morningstar_fundamental_params()
    headers = get_morningstar_fundamental_headers(fund_id)
    
    try:
        print(f"Fetching data from Morningstar API for fund: {fund_id}")
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
        
        print(f"Successfully fetched data for fund {fund_id}")
        
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from Morningstar API: {e}")
        return None
    except Exception as e:
        print(f"Error processing Morningstar API data: {e}")
        return None


def fetch_all_fundamental_data() -> int:
    """
    Fetch fundamental data for all fund IDs.
    
    Returns:
        int: Exit code (0 for success, 1 for failure)
    """
    fund_ids = get_fund_ids()
    
    print(f"Processing fundamental data for {len(fund_ids)} fund ID(s): {', '.join(fund_ids)}")
    
    successful_fetches = 0
    failed_fetches = 0
    failed_fund_ids = []
    all_successful_data = []  # Store all successfully fetched data for combined CSV
    
    # Iterate through each fund ID
    for i, fund_id in enumerate(fund_ids, 1):
        print(f"\n--- Processing fundamental data for fund {i}/{len(fund_ids)}: {fund_id} ---")
        
        # Validate fund_id format (basic validation)
        if not fund_id or len(fund_id) < 5:
            print(f"Invalid fund ID: {fund_id}, skipping...")
            failed_fetches += 1
            failed_fund_ids.append(fund_id)
            continue
        
        # Fetch data from Morningstar API
        data = fetch_morningstar_data(fund_id)
        
        if data is None:
            print(f"Failed to fetch fundamental data from Morningstar API for {fund_id}")
            failed_fetches += 1
            failed_fund_ids.append(fund_id)
            continue
        
        # Get output file paths using the helper function
        paths = get_fundamental_output_paths(fund_id)
        
        # Save data to JSON file
        saved_json = save_json_data(data, paths['json_path'])
        
        # Save data to CSV file - prepare CSV data first
        csv_data = prepare_csv_row_from_fund_data(data)
        saved_csv = save_csv_data(csv_data, paths['csv_path'])
        
        if saved_json and saved_csv:
            print(f"Successfully saved Morningstar fundamental data for {fund_id} (JSON and CSV)")
            successful_fetches += 1
            all_successful_data.append(data)  # Add to combined data list
        else:
            print(f"Failed to save fundamental data for {fund_id}")
            failed_fetches += 1
            failed_fund_ids.append(fund_id)
    
    # Create combined CSV file if we have successful data
    if all_successful_data:
        script_dir = get_script_directory()
        combined_csv_file = os.path.join(script_dir, 'latest-data', 'csv', 'combined-sector-data.csv')
        # Prepare combined CSV data using the helper function
        combined_csv_data = [prepare_csv_row_from_fund_data(data) for data in all_successful_data]
        save_combined_csv_data(combined_csv_data, combined_csv_file)
    
    # Print summary and save failed fund IDs
    print_processing_summary(successful_fetches, failed_fetches, failed_fund_ids)
    save_failed_fund_ids(failed_fund_ids, 'failed_fundamental_fund_ids.json')
    
    return 1 if failed_fetches > 0 and successful_fetches == 0 else 0


def main():
    """
    Main function to fetch and save Morningstar ETF fundamental data.
    """
    exit_code = fetch_all_fundamental_data()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
