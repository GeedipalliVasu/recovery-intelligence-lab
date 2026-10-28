import os
import glob
import json
import pandas as pd
import duckdb

DATA_DIR = "collections_30k_dataset"

def inspect_all():
    files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    print(f"Found {len(files)} CSV files in {DATA_DIR}:")
    
    summary = {}
    for f in sorted(files):
        fname = os.path.basename(f)
        if fname == "data_dictionary.csv":
            continue
        try:
            df = pd.read_csv(f, nrows=5)
            # count lines quickly
            with open(f, 'rb') as fp:
                row_count = sum(1 for _ in fp) - 1
            
            # identify potential date columns
            date_cols = [c for c in df.columns if 'at' in c or 'date' in c]
            
            summary[fname] = {
                "rows": row_count,
                "cols": list(df.columns),
                "date_cols": date_cols
            }
            print(f"- {fname}: {row_count:,} rows, cols: {list(df.columns)}")
        except Exception as e:
            print(f"Error reading {fname}: {e}")
            
    return summary

if __name__ == "__main__":
    inspect_all()
