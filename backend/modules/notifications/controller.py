from flask import request

from modules.notifications.service import NotificationService
from shared.response import ApiResponse


class NotificationController:

    service = NotificationService()

    def send_test_email(self):

        data = request.get_json() or {}

        incident = {
            "server_id": data.get("server_id", 1),
            "severity": data.get("severity", "CRITICAL"),
            "title": data.get("title", "CloudOps AI Test Alert"),
            "metric_name": data.get("metric_name", "CPU"),
            "metric_value": data.get("metric_value", 95),
            "threshold_value": data.get("threshold_value", 80),
            "description": data.get(
                "description",
                "This is a test notification from CloudOps AI."
            )
        }

        self.service.send_incident_email(incident)

        return ApiResponse.success(
            message="Test email sent successfully"
        )