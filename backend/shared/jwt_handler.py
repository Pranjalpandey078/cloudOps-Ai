import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


class JWTHandler:

    @staticmethod
    def generate(user):

        payload = {

            "user_id": user["id"],

            "username": user["username"],

            "exp": datetime.utcnow() + timedelta(
                minutes=int(os.getenv("JWT_EXPIRE_MINUTES"))
            )

        }

        return jwt.encode(

            payload,

            os.getenv("JWT_SECRET"),

            algorithm="HS256"

        )

    @staticmethod
    def verify(token):

        return jwt.decode(

            token,

            os.getenv("JWT_SECRET"),

            algorithms=["HS256"]

        )