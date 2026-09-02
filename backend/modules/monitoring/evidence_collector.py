import socket
import time

import psutil


class EvidenceCollector:

    @staticmethod
    def collect():

        boot_time = psutil.boot_time()

        load_average = None

        try:
            load_average = list(
                psutil.getloadavg()
            )
        except (
            AttributeError,
            OSError
        ):
            pass

        return {
            "hostname": socket.gethostname(),

            "platform": {
                "system": __import__(
                    "platform"
                ).system(),

                "release": __import__(
                    "platform"
                ).release(),

                "machine": __import__(
                    "platform"
                ).machine()
            },

            "uptime_seconds": int(
                time.time() - boot_time
            ),

            "load_average": load_average,

            "cpu_percent": psutil.cpu_percent(
                interval=0.5
            ),

            "memory_percent": psutil.virtual_memory().percent,

            "disk_percent": psutil.disk_usage("/").percent,

            "top_cpu_processes":
                EvidenceCollector._top_processes(
                    "cpu_percent"
                ),

            "top_memory_processes":
                EvidenceCollector._top_processes(
                    "memory_percent"
                )
        }

    @staticmethod
    def _top_processes(
        metric_name,
        limit=5
    ):
        """
        Collect a point-in-time ranked process snapshot.

        CPU requires two samples because psutil's first
        cpu_percent() call establishes a baseline.
        """

        processes = []

        process_list = []

        for process in psutil.process_iter(
            ["pid", "name"]
        ):
            try:
                process_list.append(process)

            except (
                psutil.NoSuchProcess,
                psutil.AccessDenied
            ):
                continue

        if metric_name == "cpu_percent":

            for process in process_list:
                try:
                    process.cpu_percent(
                        interval=None
                    )
                except (
                    psutil.NoSuchProcess,
                    psutil.AccessDenied
                ):
                    continue

            time.sleep(0.25)

            for process in process_list:
                try:
                    info = process.info

                    value = process.cpu_percent(
                        interval=None
                    )

                    processes.append({
                        "pid": info.get("pid"),
                        "name": info.get("name"),
                        "cpu_percent": round(
                            float(value),
                            2
                        )
                    })

                except (
                    psutil.NoSuchProcess,
                    psutil.AccessDenied
                ):
                    continue

            processes.sort(
                key=lambda item: item["cpu_percent"],
                reverse=True
            )

            return processes[:limit]

        for process in process_list:

            try:
                info = process.info

                value = process.memory_percent()

                processes.append({
                    "pid": info.get("pid"),
                    "name": info.get("name"),
                    "memory_percent": round(
                        float(value),
                        2
                    )
                })

            except (
                psutil.NoSuchProcess,
                psutil.AccessDenied
            ):
                continue

        processes.sort(
            key=lambda item: item["memory_percent"],
            reverse=True
        )

        return processes[:limit]
