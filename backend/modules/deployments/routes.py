from flask import Blueprint

from modules.deployments.controller import DeploymentController
from shared.auth_middleware import login_required


deployments_bp = Blueprint(
    "deployments",
    __name__,
    url_prefix="/api/deployments"
)

controller = DeploymentController()


# Get all deployments
deployments_bp.route(
    "",
    methods=["GET"]
)(
    login_required(controller.get_all)
)


# Deployment statistics
deployments_bp.route(
    "/stats",
    methods=["GET"]
)(
    login_required(controller.stats)
)


# Get single deployment
deployments_bp.route(
    "/<int:deployment_id>",
    methods=["GET"]
)(
    login_required(controller.get_by_id)
)


# Create deployment
deployments_bp.route(
    "",
    methods=["POST"]
)(
    login_required(controller.create)
)


# Update deployment status/progress
deployments_bp.route(
    "/<int:deployment_id>/status",
    methods=["PATCH"]
)(
    login_required(controller.update_status)
)


# Update deployment logs
deployments_bp.route(
    "/<int:deployment_id>/log",
    methods=["PATCH"]
)(
    login_required(controller.update_log)
)


# Mark deployment as failed
deployments_bp.route(
    "/<int:deployment_id>/fail",
    methods=["PATCH"]
)(
    login_required(controller.mark_failed)
)


# Roll back deployment
deployments_bp.route(
    "/<int:deployment_id>/rollback",
    methods=["POST"]
)(
    login_required(controller.rollback)
)