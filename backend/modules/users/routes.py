from flask import Blueprint

from modules.users.controller import UserController

from shared.auth_middleware import login_required

users_bp = Blueprint(

    "users",

    __name__,

    url_prefix="/api/users"

)

controller = UserController()

users_bp.route(

    "/profile",

    methods=["GET"]

)(login_required(controller.profile))