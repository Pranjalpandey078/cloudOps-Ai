import os
import pymysql
from dotenv import load_dotenv

load_dotenv()


class Database:

    @staticmethod
    def get_connection():

        config = {
            "host": os.getenv("MYSQL_HOST"),
            "user": os.getenv("MYSQL_USER"),
            "password": os.getenv("MYSQL_PASSWORD"),
            "database": os.getenv("MYSQL_DATABASE"),
            "port": int(os.getenv("MYSQL_PORT", 3306)),
            "cursorclass": pymysql.cursors.DictCursor,
            "autocommit": True
        }

        # Managed production MySQL such as Aiven requires TLS.
        if os.getenv("MYSQL_SSL", "false").lower() == "true":
            config["ssl"] = {}

        return pymysql.connect(**config)
