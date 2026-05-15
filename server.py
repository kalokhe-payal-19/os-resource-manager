from flask import Flask, jsonify
import psutil
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# ================= SYSTEM DATA =================
@app.route("/data")
def get_data():
    cpu = psutil.cpu_percent(interval=0.3)  # faster response
    memory = psutil.virtual_memory().percent

    return jsonify({
        "cpu": cpu,
        "memory": memory
    })

# ================= PROCESS DATA =================
@app.route("/processes")
def get_processes():
    procs = []

    # 🔥 First call (required for accurate CPU)
    for p in psutil.process_iter():
        try:
            p.cpu_percent(None)
        except:
            pass

    time.sleep(0.1)

    # 🔥 Actual data collection
    for p in psutil.process_iter(['pid', 'name', 'memory_info']):
        try:
            cpu = p.cpu_percent(None)
            mem = p.memory_info().rss / (1024 * 1024)

            procs.append({
                "pid": p.pid,
                "name": (p.info['name'] or "Unknown")[:25],
                "cpu": round(cpu, 1),
                "memory": round(mem, 1)
            })

        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    # 🔥 Increase limit (THIS WAS YOUR ISSUE)
    procs = sorted(procs, key=lambda x: x["cpu"], reverse=True)[:20]

    return jsonify(procs)

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)