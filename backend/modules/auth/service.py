from shared.security import PasswordSecurity

from modules.auth.repository import AuthRepository


class AuthService:

    repository = AuthRepository()

    def register(self, data):

        data["password"] = PasswordSecurity.hash_password(

            data["password"]

        )

        self.repository.create_user(data)

        return {

            "message": "User registered successfully"

        }