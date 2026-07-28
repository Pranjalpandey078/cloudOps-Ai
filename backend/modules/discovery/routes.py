from flask import Blueprint

from modules.discovery.controller import DiscoveryController
from shared.auth_middleware import login_required


discovery_bp = Blueprint(
    "discovery",
    __name__,
    url_prefix="/api/discovery"
)


controller = DiscoveryController()


discovery_bp.route(
    "/run",
    methods=["POST"]
)(
    login_required(
        controller.discover_all
    )
)


discovery_bp.route(
    "/linux",
    methods=["POST"]
)(
    login_required(
        controller.discover_linux
    )
)


discovery_bp.route(
    "/docker",
    methods=["POST"]
)(
    login_required(
        controller.discover_docker
    )
)


discovery_bp.route(
    "/kubernetes",
    methods=["POST"]
)(
    login_required(
        controller.discover_kubernetes
    )
)


discovery_bp.route(
    "/docker/containers",
    methods=["GET"]
)(
    login_required(
        controller.get_docker_containers
    )
)


discovery_bp.route(
    "/kubernetes/nodes",
    methods=["GET"]
)(
    login_required(
        controller.get_kubernetes_nodes
    )
)


discovery_bp.route(
    "/kubernetes/pods",
    methods=["GET"]
)(
    login_required(
        controller.get_kubernetes_pods
    )
)

discovery_bp.route(
    "/aws",
    methods=["POST"]
)(login_required(controller.discover_aws))

