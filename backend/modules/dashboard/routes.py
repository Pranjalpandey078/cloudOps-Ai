from flask import Blueprint

from modules.dashboard.controller import DashboardController

dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)

controller = DashboardController()

dashboard_bp.route(
    "/summary",
    methods=["GET"]
)(
    controller.summary
)

dashboard_bp.route(
    "/charts",
    methods=["GET"]
)(
    controller.charts
)

dashboard_bp.route(
    "/recent-incidents",
    methods=["GET"]
)(
    controller.recent_incidents
)