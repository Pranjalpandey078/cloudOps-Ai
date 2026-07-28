from flask import Blueprint

from modules.ai.controller import AIController

ai_bp = Blueprint(
    "ai",
    __name__,
    url_prefix="/api/ai"
)

controller = AIController()

ai_bp.route(
    "/chat",
    methods=["POST"]
)(
    controller.chat
)