from shared.database import Database


class AuthRepository:

    def create_user(self, data):

        connection = Database.get_connection()

        cursor = connection.cursor()

        sql = """

        INSERT INTO users(

            organization_id,

            first_name,

            last_name,

            username,

            email,

            password_hash,

            phone

        )

        VALUES(%s,%s,%s,%s,%s,%s,%s)

        """

        cursor.execute(sql, (

            1,

            data["first_name"],

            data["last_name"],

            data["username"],

            data["email"],

            data["password"],

            data["phone"]

        ))

        connection.close()