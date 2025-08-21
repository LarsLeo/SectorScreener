#!/usr/bin/env python3
"""
Shared helper functions for ETF data fetching scripts.
"""

import json
import csv
import os
from datetime import datetime
from typing import Dict, List, Optional, Any


def ensure_directory_exists(filepath: str) -> None:
    """
    Ensure the directory for the given filepath exists.
    
    Args:
        filepath (str): The complete file path
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)


def get_script_directory() -> str:
    """
    Get the directory where the current script is located.
    
    Returns:
        str: The absolute path to the script directory
    """
    return os.path.dirname(os.path.abspath(__file__))


def save_json_data(data: Dict[str, Any], filepath: str) -> Optional[str]:
    """
    Save data to a JSON file with pretty formatting.
    
    Args:
        data (dict): The data to save
        filepath (str): The complete file path where to save the data
    
    Returns:
        str: The path to the saved file, or None if save failed
    """
    try:
        ensure_directory_exists(filepath)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"JSON data saved to: {filepath}")
        return filepath
        
    except Exception as e:
        print(f"Error saving JSON data to file: {e}")
        return None


def save_csv_data(csv_row: Dict[str, Any], filepath: str) -> Optional[str]:
    """
    Save a single CSV row to a CSV file.
    
    Args:
        csv_row (dict): The CSV row data
        filepath (str): The complete file path where to save the CSV data
    
    Returns:
        str: The path to the saved file, or None if save failed
    """
    try:
        ensure_directory_exists(filepath)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = list(csv_row.keys())
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerow(csv_row)
        
        print(f"CSV data saved to: {filepath}")
        return filepath
        
    except Exception as e:
        print(f"Error saving CSV data to file: {e}")
        return None


def save_combined_csv_data(csv_rows: List[Dict[str, Any]], filepath: str) -> Optional[str]:
    """
    Save multiple CSV rows to a single combined CSV file.
    
    Args:
        csv_rows (list): List of CSV row dictionaries
        filepath (str): The complete file path where to save the combined CSV data
    
    Returns:
        str: The path to the saved file, or None if save failed
    """
    try:
        ensure_directory_exists(filepath)
        
        if not csv_rows:
            print("No CSV data to save to combined file")
            return None
        
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = list(csv_rows[0].keys())
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(csv_rows)
        
        print(f"Combined CSV data saved to: {filepath}")
        return filepath
        
    except Exception as e:
        print(f"Error saving combined CSV data to file: {e}")
        return None


def save_failed_fund_ids(failed_fund_ids: List[str], filename: str = 'failed_fund_ids.json') -> None:
    """
    Save failed fund IDs to a JSON file.
    
    Args:
        failed_fund_ids (list): List of failed fund IDs
        filename (str): The filename for the failed IDs file
    """
    if not failed_fund_ids:
        return
    
    print(f"\nFailed fund IDs:")
    for fund_id in failed_fund_ids:
        print(f"  - {fund_id}")
    
    script_dir = get_script_directory()
    failed_ids_file = os.path.join(script_dir, filename)
    
    failed_data = {
        'timestamp': datetime.now().isoformat(),
        'total_failed': len(failed_fund_ids),
        'failed_fund_ids': failed_fund_ids
    }
    
    try:
        with open(failed_ids_file, 'w', encoding='utf-8') as f:
            json.dump(failed_data, f, indent=2, ensure_ascii=False)
        print(f"\nFailed fund IDs saved to: {failed_ids_file}")
    except Exception as e:
        print(f"Error saving failed fund IDs to file: {e}")


def get_fund_ids() -> List[str]:
    """
    Get the list of fund IDs to process. This now derives directly from the
    keys of the fund configuration mapping returned by get_fund_config() so
    that a single source of truth (ID -> Name mapping) is maintained.
    
    Returns:
        list: List of fund IDs in the order they are declared in get_fund_config()
    """
    return list(get_fund_config().keys())


def get_fund_config() -> Dict[str, str]:
    """
    Get the mapping of fund IDs to fund names.
    
    Returns:
        dict: Dictionary with fund IDs as keys and fund names as values
    """
    return {
        "0P0001PVDX": "Amundi S&P World Communication Services",
        "0P0001K9I4": "Amundi MSCI Semiconductors",
        "F00001EK0E": "Amundi S&P World Industrials",
        "0P0001PVEX": "Amundi S&P World Materials",
        "0P0001PVEF": "Amundi S&P World Utilities",
        "0P0001FHMG": "HSBC FTSE EPRA/NAREIT Developed",
        "F000011FXJ": "iShares Digital Security",
        "F0000171MM": "iShares MSCI World Financials",
        "0P0001IM5L": "iShares MSCI World Health Care",
        "0P0001IM5Q": "iShares MSCI World Consumer Staples",
        "0P0001IM5I": "iShares MSCI World Information Technology",
        "0P0001IM5P": "iShares MSCI World Consumer Discretionary",
        "0P0001IM5M": "iShares MSCI World Energy"
    }


def print_processing_summary(successful_fetches: int, failed_fetches: int, failed_fund_ids: List[str]) -> None:
    """
    Print a summary of the processing results.
    
    Args:
        successful_fetches (int): Number of successful fetches
        failed_fetches (int): Number of failed fetches
        failed_fund_ids (list): List of failed fund IDs
    """
    print(f"\n--- Summary ---")
    print(f"Successfully processed: {successful_fetches} fund(s)")
    print(f"Failed to process: {failed_fetches} fund(s)")
    
    if not failed_fund_ids:
        print("\nAll fund IDs processed successfully!")


def get_morningstar_common_headers(fund_id: str) -> Dict[str, str]:
    """
    Get common headers used for Morningstar API requests.
    
    Args:
        fund_id (str): The fund ID (used for referer)
    
    Returns:
        dict: Common headers for Morningstar API requests
    """
    return {
        'accept': '*/*',
        'accept-language': 'de-DE,de;q=0.9,en-DE;q=0.8,en;q=0.7,es-ES;q=0.6,es;q=0.5,sv-SE;q=0.4,sv;q=0.3,en-US;q=0.2',
        'apikey': 'lstzFDEOhfFNMLikKa0am9mgEKLBl49T',
        'origin': 'https://global.morningstar.com',
        'priority': 'u=1, i',
        'referer': f'https://global.morningstar.com/en-eu/investments/etfs/{fund_id}/portfolio',
        'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'x-api-realtime-e': 'eyJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.X-h4zn65XpjG8cZnL3e6hj8LMbzupQBglHZce7tzu-c4utCtXQ2IYoLxdik04usYRhNo74AS_2crdjLnBc_J0lFEdAPzb_OBE7HjwfRaYeNhfXIDw74QCrFGqQ5n7AtllL-vTGnqmI1S9WJhSwnIBe_yRxuXGGbIttizI5FItYY.bB3WkiuoS1xzw78w.iTqTFVbxKo4NQQsNNlbkF4tg4GCfgqdRdQXN8zQU3QYhbHc-XDusH1jFii3-_-AIsqpHaP7ilG9aBxzoK7KPPfK3apcoMS6fDM3QLRSZzjkBoxWK75FtrQMAN5-LecdJk97xaXEciS0QqqBqNugoSPwoiZMazHX3rr7L5jPM-ecXN2uEjbSR0wfg-57iHAku8jvThz4mtGpMRAOil9iZaL6iRQ.o6tR6kuOQBhnpcsdTQeZWw',
        'x-sal-contenttype': 'nNsGdN3REOnPMlKDShOYjlk6VYiEVLSdpfpXAm7o2Tk='
    }


def get_morningstar_common_params() -> Dict[str, str]:
    """
    Get common query parameters used for Morningstar API requests.
    
    Returns:
        dict: Common query parameters for Morningstar API requests
    """
    return {
        'languageId': 'en-eu',
        'locale': 'en-eu',
        'clientId': 'MDC',
        'benchmarkId': 'prospectus_primary',
        'component': '',  # Will be set by specific functions
        'version': '4.69.0'
    }
