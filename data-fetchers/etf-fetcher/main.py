#!/usr/bin/env python3
"""
Morningstar ETF data fetcher orchestrator.
This script coordinates the fetching of both fundamental and price data.
"""

import subprocess
import sys
import os
from helpers import get_script_directory


def run_script(script_name: str, description: str) -> bool:
    """
    Run a Python script and handle its execution.
    
    Args:
        script_name (str): Name of the script to run
        description (str): Description of what the script does
    
    Returns:
        bool: True if successful, False otherwise
    """
    script_dir = get_script_directory()
    script_path = os.path.join(script_dir, script_name)
    
    if not os.path.exists(script_path):
        print(f"Error: {script_name} not found at {script_path}")
        return False
    
    print(f"\n{'='*60}")
    print(f"Starting {description}...")
    print(f"{'='*60}")
    
    try:
        # Run the script and capture output
        result = subprocess.run(
            [sys.executable, script_path],
            cwd=script_dir,
            capture_output=False,  # Let output go to console in real-time
            text=True
        )
        
        if result.returncode == 0:
            print(f"\n✓ {description} completed successfully")
            return True
        else:
            print(f"\n✗ {description} failed with exit code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"\n✗ Error running {script_name}: {str(e)}")
        return False


def main():
    """
    Main orchestrator function that coordinates data fetching.
    """
    print("Morningstar ETF Data Fetcher Orchestrator")
    print("=" * 50)
    
    # Track success/failure of each step
    steps = [
        ("fetch_fundamental_data.py", "fundamental data fetching"),
        ("fetch_price_data.py", "price data fetching")
    ]
    
    results = {}
    
    for script_name, description in steps:
        success = run_script(script_name, description)
        results[script_name] = success
    
    # Print final summary
    print(f"\n{'='*60}")
    print("EXECUTION SUMMARY")
    print(f"{'='*60}")
    
    all_successful = True
    for script_name, description in steps:
        status = "✓ SUCCESS" if results[script_name] else "✗ FAILED"
        print(f"{description.capitalize()}: {status}")
        if not results[script_name]:
            all_successful = False
    
    print(f"{'='*60}")
    
    if all_successful:
        print("🎉 All data fetching operations completed successfully!")
        sys.exit(0)
    else:
        print("⚠️  Some operations failed. Check the logs above for details.")
        sys.exit(1)


if __name__ == "__main__":
    main()
