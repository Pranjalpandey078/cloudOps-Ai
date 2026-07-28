import os
from datetime import datetime, timedelta, timezone

import jwt


class JWTHandler:

    @staticmethod
    def _secret():

        secret = os.getenv("JWT_SECRET")

        if not secret:
            raise RuntimeError(
                "JWT_SECRET is not configured"
            )

        return secret


    @staticmethod
    def generate(user):

        expire_minutes = int(
            os.getenv("JWT_EXPIRE_MINUTES", "60")
        )

        payload = {
            "user_id": user["id"],
            "username": user["username"],
            "exp": datetime.now(timezone.utc)
                   + timedelta(minutes=expire_minutes),
            "iat": datetime.now(timezone.utc)
        }

        return jwt.encode(
            payload,
            JWTHandler._secret(),
            algorithm="HS256"
        )


    @staticmethod
    def verify(token):

        return jwt.decode(
            token,
            JWTHandler._secret(),
            algorithms=["HS256"]
        )
