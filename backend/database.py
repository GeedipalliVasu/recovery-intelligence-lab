"""
Recovery Intelligence Lab - DuckDB Database Access Layer
"""

import os
import duckdb
from typing import Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "recovery_intelligence.duckdb")

def get_db_connection(read_only: bool = True) -> duckdb.DuckDBPyConnection:
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database not found at {DB_PATH}. Run scripts/pipeline.py first.")
    return duckdb.connect(DB_PATH, read_only=read_only)
