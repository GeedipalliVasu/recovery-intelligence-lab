import subprocess
import time
import urllib.request
import concurrent.futures

def test_endpoints():
    proc = subprocess.Popen(
        ["python", "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(2.5) # Wait for server startup
    
    urls = [
        "http://127.0.0.1:8000/",
        "http://127.0.0.1:8000/api/kpi/summary",
        "http://127.0.0.1:8000/api/metrics/stress-test",
        "http://127.0.0.1:8000/api/performance/drivers",
        "http://127.0.0.1:8000/api/data-quality/ledger",
        "http://127.0.0.1:8000/api/strategy/sandbox?priority_rule=HIGH_BALANCE_EARLY_DPD&contact_capacity=10000"
    ]
    
    def fetch(url):
        t0 = time.time()
        try:
            req = urllib.request.urlopen(url, timeout=5)
            data = req.read()
            dt = time.time() - t0
            return (url, req.status, len(data), dt, None)
        except Exception as e:
            return (url, 0, 0, time.time() - t0, str(e))

    print("Firing concurrent requests...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(fetch, urls * 2))

    for url, status, size, dt, err in results:
        if err:
            print(f"FAILED: {url} -> {err} ({dt:.3f}s)")
        else:
            print(f"SUCCESS: {url} -> {status} ({size:,} bytes in {dt:.3f}s)")
            
    proc.terminate()
    proc.wait()
    print("All endpoints tested successfully!")

if __name__ == "__main__":
    test_endpoints()
