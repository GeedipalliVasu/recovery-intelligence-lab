"""
Recovery Intelligence Lab - DuckDB Database Access Layer (Thread-Safe)
"""

import os
import threading
from typing import Optional
import duckdb

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "recovery_intelligence.duckdb")

_lock = threading.Lock()

class DuckDBProxy:
    def __init__(self, conn, lock):
        self._conn = conn
        self._lock = lock
        self._closed = False

    def execute(self, *args, **kwargs):
        return self._conn.execute(*args, **kwargs)

    def fetchone(self):
        return self._conn.fetchone()

    def fetchall(self):
        return self._conn.fetchall()

    def df(self):
        return self._conn.df()

    def close(self):
        if not self._closed:
            self._closed = True
            try:
                self._conn.close()
            finally:
                self._lock.release()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def __getattr__(self, name):
        return getattr(self._conn, name)

def get_db_connection(read_only: bool = True) -> DuckDBProxy:
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database not found at {DB_PATH}. Run scripts/pipeline.py first.")
    
    _lock.acquire()
    try:
        con = duckdb.connect(DB_PATH, read_only=read_only)
        return DuckDBProxy(con, _lock)
    except Exception:
        _lock.release()
        raise
