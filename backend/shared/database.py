import os
import pymysql
from dotenv import load_dotenv

load_dotenv()


class Database:

    @staticmethod
    def get_connection():

        return pymysql.connect(

            host=os.getenv("MYSQL_HOST"),

            user=os.getenv("MYSQL_USER"),

            password=os.getenv("MYSQL_PASSWORD"),

            database=os.getenv("MYSQL_DATABASE"),

            port=int(os.getenv("MYSQL_PORT")),

            cursorclass=pymysql.cursors.DictCursor,

            autocommit=True

        )