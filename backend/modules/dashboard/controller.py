from modules.dashboard.service import DashboardService


class DashboardController:

    service = DashboardService()

    def summary(self):

        return self.service.summary()
    def charts(self):

        return self.service.charts()
    def recent_incidents(self):

        return self.service.recent_incidents()