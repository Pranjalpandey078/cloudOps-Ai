from modules.monitoring.service import MonitoringService


class MonitoringController:

    service = MonitoringService()

    def latest(self):

        return self.service.latest()
    def overview(self):

        return self.service.overview()