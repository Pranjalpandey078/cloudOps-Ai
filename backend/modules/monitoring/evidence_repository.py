import json

from pymysql.cursors import DictCursor

from shared.database import Database


class EvidenceRepository:

    def create(
        self,
        incident_id,
        server_id,
        evidence_type,
        evidence_data
    ):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                INSERT INTO incident_evidence
                (
                    incident_id,
                    server_id,
                    evidence_type,
                    evidence_data
                )
                VALUES (%s, %s, %s, %s)
                """,
                (
                    incident_id,
                    server_id,
                    evidence_type,
                    json.dumps(
                        evidence_data,
                        default=str
                    )
                )
            )

            connection.commit()

            return cursor.lastrowid

        finally:
            connection.close()

    def get_for_incident(self, incident_id):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor(
                DictCursor
            )

            cursor.execute(
                """
                SELECT
                    id,
                    incident_id,
                    server_id,
                    evidence_type,
                    evidence_data,
                    created_at
                FROM incident_evidence
                WHERE incident_id=%s
                ORDER BY created_at ASC, id ASC
                """,
                (incident_id,)
            )

            rows = cursor.fetchall()

            for row in rows:

                if isinstance(
                    row["evidence_data"],
                    str
                ):

                    try:
                        row["evidence_data"] = json.loads(
                            row["evidence_data"]
                        )
                    except json.JSONDecodeError:
                        pass

            return rows

        finally:
            connection.close()
