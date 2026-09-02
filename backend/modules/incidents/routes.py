from flask import Blueprint

from shared.auth_middleware import login_required

from modules.incidents.controller import IncidentController


incidents_bp = Blueprint(
    "incidents",
    __name__,
    url_prefix="/api/incidents"
)

controller = IncidentController()


incidents_bp.route(
    "",
    methods=["POST"]
)(
    login_required(controller.create)
)


incidents_bp.route(
    "",
    methods=["GET"]
)(
    login_required(controller.latest)
)


incidents_bp.route(
    "/recent",
    methods=["GET"]
)(
    login_required(controller.recent)
)


incidents_bp.route(
    "/<int:incident_id>/resolve",
    methods=["PATCH"]
)(
    login_required(controller.resolve)
)


incidents_bp.route(
    "/analyze",
    methods=["POST"]
)(
    login_required(controller.analyze)
)


incidents_bp.route(
    "/<int:incident_id>/remediation",
    methods=["POST"]
)(
    login_required(controller.remediation)
)


incidents_bp.route(
    "/<int:incident_id>/related",
    methods=["GET"]
)(
    login_required(
        controller.get_related_incidents
    )
)


incidents_bp.route(
    "/<int:incident_id>/chat",
    methods=["POST"]
)(
    login_required(controller.chat)
)

incidents_bp.route(
    "/<int:incident_id>/ai/retry",
    methods=["POST"]
)(
    login_required(controller.retry_ai)
)

