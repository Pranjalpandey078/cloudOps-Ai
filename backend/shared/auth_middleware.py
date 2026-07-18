from functools import wraps
from flask import request, g
from shared.jwt_handler import JWTHandler

def login_required(f):

    @wraps(f)
    def wrapper(*args, **kwargs):

        auth = request.headers.get("Authorization")

        if not auth:
            return {"message": "Authorization header missing"}, 401

        if not auth.startswith("Bearer "):
            return {"message": "Invalid Authorization header"}, 401

        token = auth.split(" ")[1]

        try:
            payload = JWTHandler.verify(token)

            g.user_id = payload["user_id"]
            g.username = payload["username"]

        except Exception:
            return {"message": "Invalid or expired token"}, 401

        return f(*args, **kwargs)

    return wrapper