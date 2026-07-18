import os
import pymysql
from dotenv import load_dotenv

load_dotenv()


class Database:

    @staticmethod
    def connect():
        # print("HOST:", os.getenv("MYSQL_HOST"))
        # print("USER:", os.getenv("MYSQL_USER"))
        # print("PASSWORD:", os.getenv("MYSQL_PASSWORD"))
        # print("DATABASE:", os.getenv("MYSQL_DATABASE"))

        return pymysql.connect(

            host=os.getenv("MYSQL_HOST"),

            user=os.getenv("MYSQL_USER"),

            password=os.getenv("MYSQL_PASSWORD"),

            database=os.getenv("MYSQL_DATABASE"),

            port=int(os.getenv("MYSQL_PORT")),

            cursorclass=pymysql.cursors.DictCursor

        )