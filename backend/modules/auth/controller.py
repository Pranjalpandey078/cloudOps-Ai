from flask import request

from modules.auth.service import AuthService


class AuthController:

    service = AuthService()

    def register(self):

        data = request.get_json()

        return self.service.register(data)
    def login(self):

        data = request.get_json()

        return self.service.login(data)