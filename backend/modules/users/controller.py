from flask import g

from modules.users.service import UserService

class UserController:

    service = UserService()

    def profile(self):

        return self.service.profile(g.user_id)