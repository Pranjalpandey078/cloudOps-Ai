from flask import Blueprint

from shared.auth_middleware import login_required
from modules.remediation.controller import RemediationController


remediation_bp = Blueprint(
    "remediation",
    __name__,
    url_prefix="/api/remediation"
)

controller = RemediationController()


remediation_bp.route(
    "/request",
    methods=["POST"]
)(
    login_required(controller.request_execution)
)


remediation_bp.route(
    "/<int:execution_id>",
    methods=["GET"]
)(
    login_required(controller.get_execution)
)


remediation_bp.route(
    "/incident/<int:incident_id>",
    methods=["GET"]
)(
    login_required(controller.incident_history)
)


remediation_bp.route(
    "/<int:execution_id>/approve",
    methods=["PATCH"]
)(
    login_required(controller.approve)
)


remediation_bp.route(
    "/<int:execution_id>/reject",
    methods=["PATCH"]
)(
    login_required(controller.reject)
)

remediation_bp.route(
    "/<int:execution_id>/execute",
    methods=["POST"]
)(
    login_required(controller.execute)
)

