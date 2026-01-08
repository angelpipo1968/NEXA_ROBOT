# agent_core/logger.py
import datetime
import os

LOG_FILE = "logs/audit.log"

os.makedirs("logs", exist_ok=True)

def log_action(message: str):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")
