from modules.dashboard.repository import DashboardRepository
from shared.response import ApiResponse


class DashboardService:

    repository = DashboardRepository()

    def summary(self):

        data = self.repository.summary()

        return ApiResponse.success(
            data=data
        )
    def charts(self):

        data = self.repository.charts()

        return ApiResponse.success(
        data=data
    )
    def recent_incidents(self):

        data = self.repository.recent_incidents()

        return ApiResponse.success(
        data=data
    )