import json

from shared.database import Database


class AuditRepository:

    def create(
        self,
        user_id,
        module_name,
        action,
        resource_id,
        old_value=None,
        new_value=None,
        ip_address=None
    ):
        connection = Database.get_connection()
        cursor = connection.cursor()

        sql = """
            INSERT INTO audit_logs
            (
                user_id,
                module_name,
                action,
                resource_id,
                old_value,
                new_value,
                ip_address
            )
            VALUES
            (%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.execute(
            sql,
            (
                user_id,
                module_name,
                action,
                resource_id,
                json.dumps(old_value, default=str)
                if old_value is not None
                else None,
                json.dumps(new_value, default=str)
                if new_value is not None
                else None,
                ip_address
            )
        )

        connection.commit()
        connection.close()
