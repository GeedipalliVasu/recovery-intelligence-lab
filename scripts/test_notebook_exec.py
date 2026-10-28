import nbformat
import os
import duckdb
import pandas as pd
import numpy as np
from scipy import stats

def execute_nb():
    path = os.path.join("notebooks", "recovery_intelligence_investigation.ipynb")
    nb = nbformat.read(path, as_version=4)
    print(f"Executing {len(nb.cells)} cells from {path}...")
    
    # Run the python code directly to verify
    locs = {}
    for i, cell in enumerate(nb.cells):
        if cell.cell_type == 'code':
            # Note: inside root dir, DB_PATH is data/recovery_intelligence.duckdb
            code = cell.source.replace("os.path.join(\"..\", \"data\"", "os.path.join(\"data\"")
            exec(code, globals(), locs)
            print(f"Cell {i+1} executed successfully.")
            
    print("ALL NOTEBOOK CELLS EXECUTED SUCCESSFULLY!")

if __name__ == "__main__":
    execute_nb()

