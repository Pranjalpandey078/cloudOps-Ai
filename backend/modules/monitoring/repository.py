from shared.database import Database


class MonitoringRepository:

    def save_metric(self, data):

        connection = Database.get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO metrics
            (
                server_id,
                cpu_usage,
                memory_usage,
                disk_usage
            )
            VALUES(%s,%s,%s,%s)
            """,
            (
                data["server_id"],
                data["cpu"],
                data["memory"],
                data["disk"]
            )
        )

        connection.commit()

        connection.close()


    def latest_metrics(self):

        connection = Database.get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT *

            FROM metrics

            ORDER BY collected_at DESC

            LIMIT 50
            """
        )

        data = cursor.fetchall()

        connection.close()

        return data