from shared.response import ApiResponse
from shared.exceptions import AppException
from shared.logger import logger


def register_error_handlers(app):

    @app.errorhandler(AppException)
    def handle_app_exception(error):

        logger.error(error.message)

        return ApiResponse.error(

            error.message,

            error.status

        )

    @app.errorhandler(Exception)
    def handle_unknown(error):

        logger.exception(error)

        return ApiResponse.error(

            "Internal Server Error",

            500

        )