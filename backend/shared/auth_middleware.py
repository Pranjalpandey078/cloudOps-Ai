from functools import wraps

from flask import request, g

from shared.jwt_handler import JWTHandler
from shared.database import Database


def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):

        auth = request.headers.get("Authorization")

        if not auth:
            return {"message": "Authorization header missing"}, 401

        if not auth.startswith("Bearer "):
            return {"message": "Invalid Authorization header"}, 401

        parts = auth.split(" ", 1)

        if len(parts) != 2 or not parts[1].strip():
            return {"message": "Invalid Authorization header"}, 401

        token = parts[1].strip()

        try:
            payload = JWTHandler.verify(token)

            g.user_id = payload["user_id"]
            g.username = payload["username"]

        except Exception:
            return {"message": "Invalid or expired token"}, 401

        return f(*args, **kwargs)

    return wrapper


def super_admin_required(f):
    @wraps(f)
    @login_required
    def wrapper(*args, **kwargs):

        connection = None

        try:
            connection = Database.get_connection()
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT 1
                FROM user_roles ur
                JOIN roles r ON r.id = ur.role_id
                WHERE ur.user_id = %s
                  AND r.role_name = 'SUPER_ADMIN'
                LIMIT 1
                """,
                (g.user_id,)
            )

            if not cursor.fetchone():
                return {"message": "SUPER_ADMIN access required"}, 403

            return f(*args, **kwargs)

        except Exception:
            return {"message": "Unable to verify administrator role"}, 500

        finally:
            if connection:
                connection.close()

    return wrapper
