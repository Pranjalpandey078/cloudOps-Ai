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
                data["organization_id"],
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

    def correlate_incident(self, incident_id, data):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute(
            """
            UPDATE incidents
            SET
                occurrence_count = occurrence_count + 1,
                metric_value = %s,
                threshold_value = %s,
                severity = CASE
                    WHEN severity = 'CRITICAL'
                        THEN 'CRITICAL'
                    WHEN %s = 'CRITICAL'
                        THEN 'CRITICAL'
                    ELSE %s
                END,
                description = %s,
                last_detected_at = NOW()
            WHERE id = %s
            """,
            (
                data["metric_value"],
                data["threshold_value"],
                data["severity"],
                data["severity"],
                data["description"],
                incident_id
            )
        )

        connection.commit()

        cursor.execute(
            """
            SELECT *
            FROM incidents
            WHERE id = %s
            """,
            (incident_id,)
        )

        incident = cursor.fetchone()

        connection.close()

        return incident





    def get_by_id(self, incident_id):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute(
            """
            SELECT *
            FROM incidents
            WHERE id = %s
            """,
            (incident_id,)
        )

        incident = cursor.fetchone()

        connection.close()

        return incident


    def update_ai_retry_count(
        self,
        incident_id,
        retry_count
    ):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE incidents
            SET ai_retry_count = %s
            WHERE id = %s
            """,
            (
                retry_count,
                incident_id
            )
        )

        connection.commit()
        connection.close()


    def update_ai_status(
        self,
        incident_id,
        status,
        error=None
    ):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE incidents
            SET
                ai_status = %s,
                ai_error = %s
            WHERE id = %s
            """,
            (
                status,
                error,
                incident_id
            )
        )

        connection.commit()
        connection.close()


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
                i.ai_status,
                i.ai_retry_count,
                i.ai_error,
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

        # PyMySQL returns MySQL JSON columns as strings.
        # Convert ai_analysis into a native Python object
        # before returning incidents to the API layer.
        for incident in data:

            ai_analysis = incident.get(
                "ai_analysis"
            )

            if isinstance(ai_analysis, str):

                try:
                    incident["ai_analysis"] = (
                        json.loads(ai_analysis)
                    )

                except json.JSONDecodeError:

                    # Preserve API stability if legacy or
                    # malformed data exists in the column.
                    incident["ai_analysis"] = None

        return data


    def get_related_incidents(
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
                i.id,
                i.title,
                i.severity,
                i.status,
                i.metric_name,
                i.created_at
            FROM incidents i

            WHERE

                i.id <> %s

                AND

                (

                    i.server_id = (
                        SELECT server_id
                        FROM incidents
                        WHERE id=%s
                    )

                    OR

                    i.metric_name = (
                        SELECT metric_name
                        FROM incidents
                        WHERE id=%s
                    )

                    OR

                    i.organization_id = (
                        SELECT organization_id
                        FROM incidents
                        WHERE id=%s
                    )

                )

            ORDER BY
                i.created_at DESC

            LIMIT 10
            """,
            (
                incident_id,
                incident_id,
                incident_id,
                incident_id
            )
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