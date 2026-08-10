from flask import Blueprint

from .service import CorrelationService


correlation_bp = Blueprint(
    "correlation",
    __name__
)


service = CorrelationService()


@correlation_bp.get(
    "/incidents/<int:incident_id>/related"
)
def related_incidents(incident_id):

    return service.related_incidents(
        incident_id
    )


@correlation_bp.get(
    "/groups/stats"
)
def dashboard_stats():

    return service.dashboard_stats()


@correlation_bp.get(
    "/groups"
)
def groups():

    return service.list_groups()
