"""
Recovery Intelligence Lab (RIL)
Unified One-Command Application Launcher
"""

import os
import sys
import webbrowser
import threading
import time

def main():
    root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root)
    sys.path.insert(0, root)

    print("=" * 65)
    print("  RECOVERY INTELLIGENCE LAB (RIL) - FORENSIC COLLECTIONS PLATFORM")
    print("=" * 65)

    # 1. Verify DuckDB analytical database exists
    db_file = os.path.join(root, "data", "recovery_intelligence.duckdb")
    if not os.path.exists(db_file):
        print("[*] DuckDB analytical database not found.")
        print("[*] Running forensic pipeline to ingest and scrub raw dataset...")
        from scripts import pipeline
        pipeline.run_pipeline()
        print("[+] Pipeline complete. Golden analytical database initialized.")
    else:
        print("[+] Verified DuckDB golden analytical database is ready.")

    # 2. Verify frontend dist exists
    dist_index = os.path.join(root, "frontend", "dist", "index.html")
    if not os.path.exists(dist_index):
        print("[!] Frontend dist build not found. Building with Vite...")
        import subprocess
        subprocess.run(["npm.cmd", "--prefix", "frontend", "run", "build"], check=True)
        print("[+] Frontend build complete.")
    else:
        print("[+] Verified React frontend production bundle is ready.")

    # 3. Launch browser in a background thread once server starts
    def open_browser():
        time.sleep(1.8)
        url = "http://127.0.0.1:8000/"
        print("\n" + "*" * 65)
        print(f"  [+] Opening Executive Dashboard in your browser: {url}")
        print("  [+] Interactive Swagger API Docs: http://127.0.0.1:8000/docs")
        print("  [+] Press CTRL+C in this terminal to stop the server.")
        print("*" * 65 + "\n")
        try:
            webbrowser.open(url)
        except Exception:
            pass

    threading.Thread(target=open_browser, daemon=True).start()

    # 4. Start FastAPI uvicorn server
    import uvicorn
    from backend.main import app
    print("[*] Starting FastAPI server on http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

if __name__ == "__main__":
    main()
