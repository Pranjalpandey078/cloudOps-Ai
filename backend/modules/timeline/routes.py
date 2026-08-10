from flask import Blueprint

from shared.auth_middleware import login_required

from modules.timeline.controller import TimelineController


timeline_bp = Blueprint(
    "timeline",
    __name__,
    url_prefix="/api/incidents"
)

controller = TimelineController()

timeline_bp.route(
    "/<int:incident_id>/timeline",
    methods=["GET"]
)(
    login_required(
        controller.get_timeline
    )
)
