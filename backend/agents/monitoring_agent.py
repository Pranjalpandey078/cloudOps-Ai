import os
import socket
import time

import psutil
import requests
from dotenv import load_dotenv


load_dotenv()


API_URL = os.getenv(
    "CLOUDOPS_MONITORING_URL",
    "http://127.0.0.1:5001/api/monitoring/ingest"
)

AGENT_KEY = os.getenv(
    "MONITORING_AGENT_KEY",
    ""
)

SERVER_ID = os.getenv(
    "CLOUDOPS_SERVER_ID"
)


INTERVAL_SECONDS = int(
    os.getenv(
        "CLOUDOPS_AGENT_INTERVAL",
        "10"
    )
)


def collect():

    return {
        "server_id": int(SERVER_ID),
        "hostname": socket.gethostname(),
        "cpu": psutil.cpu_percent(interval=1),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage("/").percent,
        "uptime_seconds": int(
            time.time() -
            psutil.boot_time()
        )
    }


def send(metrics):

    response = requests.post(
        API_URL,
        json=metrics,
        headers={
            "X-Monitoring-Agent-Key": AGENT_KEY
        },
        timeout=10
    )

    response.raise_for_status()

    return response.json()


def main():

    if not AGENT_KEY:
        raise RuntimeError(
            "MONITORING_AGENT_KEY is not configured."
        )

    if not SERVER_ID:
        raise RuntimeError(
            "CLOUDOPS_SERVER_ID is not configured."
        )

    print(
        "CloudOps Monitoring Agent started"
    )

    print(
        f"Server ID: {SERVER_ID}"
    )

    print(
        f"API: {API_URL}"
    )

    while True:

        try:

            metrics = collect()

            result = send(metrics)

            print(
                "[AGENT] "
                f"CPU={metrics['cpu']:.1f}% "
                f"MEM={metrics['memory']:.1f}% "
                f"DISK={metrics['disk']:.1f}% "
                f"status={result.get('success')}"
            )

        except Exception as error:

            print(
                "[AGENT] telemetry failed:",
                error
            )

        time.sleep(
            INTERVAL_SECONDS
        )


if __name__ == "__main__":
    main()
