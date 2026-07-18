import psutil

from modules.monitoring.repository import MonitoringRepository


class MonitoringService:

    repository = MonitoringRepository()

    def collect(self):

        cpu = psutil.cpu_percent(interval=1)

        memory = psutil.virtual_memory().percent

        disk = psutil.disk_usage("/").percent

        self.repository.save_metric({

            "server_id": 1,

            "cpu": cpu,

            "memory": memory,

            "disk": disk

        })

        print(

            f"CPU={cpu}% "

            f"MEM={memory}% "

            f"DISK={disk}%"

        )


    def latest(self):

        return self.repository.latest_metrics()