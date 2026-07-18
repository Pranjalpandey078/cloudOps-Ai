from flask import Blueprint

from shared.auth_middleware import login_required

from modules.monitoring.controller import MonitoringController

monitoring_bp = Blueprint(

    "monitoring",

    __name__,

    url_prefix="/api/monitoring"

)

controller = MonitoringController()

monitoring_bp.route(

    "/latest",

    methods=["GET"]

)(login_required(controller.latest))