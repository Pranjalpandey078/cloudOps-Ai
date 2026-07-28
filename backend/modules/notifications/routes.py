from flask import Blueprint

from shared.auth_middleware import login_required

from modules.notifications.controller import NotificationController

class NotificationController:

    def get_notifications(self):
        ...

    def unread_notifications(self):
        ...

    def mark_as_read(self, notification_id):
        ...

    def mark_all_as_read(self):
        ...

    def send_test_email(self):
        ...
notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications"
)

controller = NotificationController()


notifications_bp.route(
    "/",
    methods=["GET"]
)(
    login_required(controller.get_notifications)
)


notifications_bp.route(
    "/unread",
    methods=["GET"]
)(
    login_required(controller.unread_notifications)
)


notifications_bp.route(
    "/mark-read/<int:notification_id>",
    methods=["PUT"]
)(
    login_required(controller.mark_as_read)
)


notifications_bp.route(
    "/mark-all-read",
    methods=["PUT"]
)(
    login_required(controller.mark_all_as_read)
)


notifications_bp.route(
    "/send-test-email",
    methods=["POST"]
)(
    login_required(controller.send_test_email)
)
class NotificationService:

    def get_notifications(self):
        ...

    def unread_notifications(self):
        ...

    def mark_as_read(self, notification_id):
        ...

    def mark_all_as_read(self):
        ...

    def send_test_email(self):
        ...