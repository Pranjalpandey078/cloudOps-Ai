from flask import Blueprint

from modules.auth.controller import AuthController

auth_bp = Blueprint(

    "auth",

    __name__,

    url_prefix="/api/auth"

)

controller = AuthController()

auth_bp.route(

    "/register",

    methods=["POST"]

)(controller.register)