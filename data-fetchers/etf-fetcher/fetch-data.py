#!/usr/bin/env python3
"""
Morningstar ETF data fetcher script.
This script fetches ETF financial data from Morningstar API and saves it as JSON.
"""

import requests
import json
import sys
import os
from datetime import datetime


def fetch_morningstar_data(fund_id):
    """
    Fetch data from Morningstar API.
    
    Args:
        fund_id (str): The Morningstar fund ID (e.g., '0P0001PVDX')
    
    Returns:
        dict: API response data with metadata
    """
    # API endpoint from the curl command
    url = f"https://api-global.morningstar.com/sal-service/v1/etf/process/stockStyle/v2/{fund_id}/data"
    
    # Query parameters
    params = {
        'languageId': 'en-eu',
        'locale': 'en-eu',
        'clientId': 'MDC',
        'benchmarkId': 'prospectus_primary',
        'component': 'sal-mip-measures',
        'version': '4.69.0'
    }
    
    # Headers from the curl command
    headers = {
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
        'x-api-requestid': 'd3be84bb-804d-06c8-b2c8-e35f28e52f10',
        'x-sal-contenttype': 'nNsGdN3REOnPMlKDShOYjlk6VYiEVLSdpfpXAm7o2Tk='
    }
    
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
        
        # Save data to file with pretty formatting
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Data saved to: {filepath}")
        return filepath
        
    except Exception as e:
        print(f"Error saving data to file: {e}")
        return None



def main():
    """
    Main function to fetch and save Morningstar ETF data.
    """
    # Array of fund IDs to fetch data for
    fund_ids = [
        "0P0001PVDX", # Amundi S&P World Comm Svcs Scrn ETF Dist IE000ANYHV73
        "0P0001K9I4",  # Amundi MSCI Semiconductors ETF Dis LU2090063327
        "F00001EK0E",  # Amundi S&P World Industrials Scrn ETFDis IE00026BEVM6
        "0P0001PVEX",  # Amundi S&P World Materials Scrn ETF Dist IE000WP7CVZ7
        "0P0001PVEF",  # Amundi S&P World Utilities Scrn ETF Dist IE00052T92P8
        "0P0001FHMG",  # HSBC FTSE EPRA/NAREIT Developed ETF IE00B5L01S80
        "F000011FXJ",  # iShares Digital Security ETF USD Dist IE00BG0J4841
        "F0000171MM",  # iShares MSCI Wld Fi Sec Advcd ETF USDInc IE00BJ5JP097
        "0P0001IM5L",  # iShares MSCI Wld HlthCrSect AdvcdETF$Inc IE00BJ5JNZ06
        "0P0001IM5Q",  # iShares MSCI WldCnsmrStpSectAdvcdETF$Inc IE00BJ5JP329
        "0P0001IM5I",  # iShares MSCI WldInfoTechSectAdvcdETF$Inc IE00BJ5JNY98
        "0P0001IM5P",  # iShares MSCIWldCnsmrDiscSectAdvcdETF$Inc IE00BJ5JP212
    ]
    
    print(f"Processing {len(fund_ids)} fund ID(s): {', '.join(fund_ids)}")
    
    successful_fetches = 0
    failed_fetches = 0
    failed_fund_ids = []
    
    # Iterate through each fund ID
    for i, fund_id in enumerate(fund_ids, 1):
        print(f"\n--- Processing fund {i}/{len(fund_ids)}: {fund_id} ---")
        
        # Validate fund_id format (basic validation)
        if not fund_id or len(fund_id) < 5:
            print(f"Invalid fund ID: {fund_id}, skipping...")
            failed_fetches += 1
            failed_fund_ids.append(fund_id)
            continue
        
        # Fetch data from Morningstar API
        data = fetch_morningstar_data(fund_id)
        
        if data is None:
            print(f"Failed to fetch data from Morningstar API for {fund_id}")
            failed_fetches += 1
            failed_fund_ids.append(fund_id)
            continue
        
        # Determine output directory and filename
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(script_dir, 'latest-data')
        output_file = os.path.join(output_dir, f"{fund_id}.json")
        
        # Save data to file
        saved_file = save_data_to_file(data, output_file)
        
        if saved_file:
            print(f"Successfully saved Morningstar data for {fund_id}")
            successful_fetches += 1
        else:
            print(f"Failed to save data for {fund_id}")
            failed_fetches += 1
            failed_fund_ids.append(fund_id)
    
    # Summary
    print(f"\n--- Summary ---")
    print(f"Successfully processed: {successful_fetches} fund(s)")
    print(f"Failed to process: {failed_fetches} fund(s)")
    
    # Print and save failed fund IDs if any
    if failed_fund_ids:
        print(f"\nFailed fund IDs:")
        for fund_id in failed_fund_ids:
            print(f"  - {fund_id}")
        
        # Save failed fund IDs to a file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        failed_ids_file = os.path.join(script_dir, 'failed_fund_ids.json')
        
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
    else:
        print("\nAll fund IDs processed successfully!")
    
    if failed_fetches > 0 and successful_fetches == 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
