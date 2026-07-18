from shared.database import Database

class UserRepository:

    def get_profile(self, user_id):

        connection = Database.get_connection()

        cursor = connection.cursor()

        cursor.execute("""

        SELECT

        id,
        username,
        email,
        first_name,
        last_name,
        phone,
        account_status,
        created_at

        FROM users

        WHERE id=%s

        """,(user_id,))

        user = cursor.fetchone()

        connection.close()

        return user