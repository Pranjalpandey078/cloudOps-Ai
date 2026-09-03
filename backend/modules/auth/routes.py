from flask import Blueprint

from modules.auth.controller import AuthController
from shared.auth_middleware import super_admin_required

auth_bp = Blueprint(

    "auth",

    __name__,

    url_prefix="/api/auth"

)

controller = AuthController()

auth_bp.route(

    "/register",

    methods=["POST"]

)(super_admin_required(controller.register))
auth_bp.route(

    "/login",

    methods=["POST"]

)(controller.login)