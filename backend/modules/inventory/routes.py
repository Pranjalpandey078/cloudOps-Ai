from flask import Blueprint

from modules.inventory.controller import InventoryController

from shared.auth_middleware import login_required

inventory_bp = Blueprint(

    "inventory",

    __name__,

    url_prefix="/api/servers"

)

controller = InventoryController()


inventory_bp.route(

    "",

    methods=["POST"]

)(login_required(controller.create))


inventory_bp.route(

    "",

    methods=["GET"]

)(login_required(controller.get_all))


inventory_bp.route(

    "/<int:server_id>",

    methods=["GET"]

)(login_required(controller.get_one))