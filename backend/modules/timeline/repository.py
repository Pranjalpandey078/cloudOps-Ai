from pymysql.cursors import DictCursor

from shared.database import Database


class TimelineRepository:

    def create_event(
        self,
        incident_id,
        event_type,
        title,
        description=None
    ):

        connection = Database.get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO incident_timeline
            (
                incident_id,
                event_type,
                title,
                description
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                incident_id,
                event_type,
                title,
                description
            )
        )

        connection.commit()

        connection.close()


    def get_incident_timeline(
        self,
        incident_id
    ):

        connection = Database.get_connection()

        cursor = connection.cursor(
            DictCursor
        )

        cursor.execute(
            """
            SELECT
                id,
                incident_id,
                event_type,
                title,
                description,
                created_at
            FROM incident_timeline
            WHERE incident_id=%s
            ORDER BY
                created_at ASC,
                id ASC
            """,
            (
                incident_id,
            )
        )

        events = cursor.fetchall()

        connection.close()

        return events
