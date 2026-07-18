class AppException(Exception):

    def __init__(self, message, status=400):

        self.message = message
        self.status = status


class NotFoundException(AppException):

    def __init__(self, message="Resource not found"):

        super().__init__(message, 404)


class ValidationException(AppException):

    def __init__(self, message):

        super().__init__(message, 400)


class UnauthorizedException(AppException):

    def __init__(self, message="Unauthorized"):

        super().__init__(message, 401)
        