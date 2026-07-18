from shared.security import PasswordSecurity


from shared.jwt_handler import JWTHandler
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
    def login(self, data):

        user = self.repository.find_by_username(

            data["username"]

        )

        if not user:

            return {

                "message": "Invalid username or password"

            },401

        if not PasswordSecurity.verify(

            data["password"],

            user["password_hash"]

        ):

            return {

                "message":"Invalid username or password"

            },401

        token = JWTHandler.generate(user)

        return {

            "message":"Login successful",

            "token":token,

            "username":user["username"]

        }