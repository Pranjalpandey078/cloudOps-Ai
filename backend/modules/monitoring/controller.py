from flask import request

from modules.monitoring.service import MonitoringService


class MonitoringController:

    service = MonitoringService()

    def latest(self):
        return self.service.latest()

    def overview(self):
        return self.service.overview()

    def ingest(self):
        data = request.get_json(silent=True) or {}

        return self.service.ingest(
            data,
            request.headers.get("X-Monitoring-Agent-Key")
        )
