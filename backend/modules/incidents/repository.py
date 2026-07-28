import json
from pymysql.cursors import DictCursor
from shared.database import Database


class IncidentRepository:

    def recent(self):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute("""
            SELECT
                id,
                title,
                severity,
                status,
                server_id,
                created_at
            FROM incidents
            ORDER BY created_at DESC
            LIMIT 20
        """)

        data = cursor.fetchall()

        connection.close()

        return data

    def get_incident(self, incident_id):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute(
            """
            SELECT *
            FROM incidents
            WHERE id=%s
            """,
            (incident_id,)
        )

        incident = cursor.fetchone()

        connection.close()

        return incident

    def get_open_by_metric(self, server_id, metric_name):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute(
            """
            SELECT *
            FROM incidents
            WHERE server_id=%s
            AND metric_name=%s
            AND status='OPEN'
            LIMIT 1
            """,
            (server_id, metric_name)
        )

        incident = cursor.fetchone()

        connection.close()

        return incident

    def create_incident(self, data):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO incidents
            (
                organization_id,
                server_id,
                title,
                description,
                severity,
                status,
                source,
                metric_name,
                metric_value,
                threshold_value
            )
            VALUES
            (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                1,
                data["server_id"],
                data["title"],
                data["description"],
                data["severity"],
                "OPEN",
                data["source"],
                data["metric_name"],
                data["metric_value"],
                data["threshold_value"]
            )
        )

        connection.commit()

        incident_id = cursor.lastrowid

        connection.close()

        return incident_id

    def get_open_incident(self, server_id, metric_name):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute(
            """
            SELECT *
            FROM incidents
            WHERE server_id=%s
            AND metric_name=%s
            AND status='OPEN'
            LIMIT 1
            """,
            (server_id, metric_name)
        )

        incident = cursor.fetchone()

        connection.close()

        return incident

    def latest_incidents(self):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute(
            """
            SELECT
                i.id,
                i.server_id,
                s.hostname AS server_hostname,
                s.ip_address AS server_ip,
                i.title,
                i.description,
                i.severity,
                i.status,
                i.source,
                i.metric_name,
                i.metric_value,
                i.threshold_value,
                i.ai_analysis,
                i.created_at,
                i.resolved_at
            FROM incidents i

            LEFT JOIN servers s
                ON s.id = i.server_id

            ORDER BY i.created_at DESC
            LIMIT 100
            """
        )

        data = cursor.fetchall()

        connection.close()

        return data

    def resolve_incident(self, incident_id):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE incidents
            SET
                status='RESOLVED',
                resolved_at=NOW()
            WHERE id=%s
            """,
            (incident_id,)
        )

        connection.commit()

        connection.close()

    def save_ai_analysis(self, incident_id, analysis):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE incidents
            SET ai_analysis=%s
            WHERE id=%s
            """,
            (
                json.dumps(analysis),
                incident_id
            )
        )

        connection.commit()

        connection.close()