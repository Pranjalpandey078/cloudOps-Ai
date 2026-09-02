import json

from pymysql.cursors import DictCursor

from shared.database import Database


class RemediationVerificationRepository:

    def create(
        self,
        execution_id,
        incident_id,
        server_id,
        metric_name,
        before_value,
        threshold_value
    ):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                INSERT INTO remediation_verifications
                (
                    execution_id,
                    incident_id,
                    server_id,
                    metric_name,
                    before_value,
                    threshold_value
                )
                VALUES (%s,%s,%s,%s,%s,%s)
                """,
                (
                    execution_id,
                    incident_id,
                    server_id,
                    metric_name,
                    before_value,
                    threshold_value
                )
            )

            connection.commit()

            return cursor.lastrowid

        finally:
            connection.close()

    def complete(
        self,
        verification_id,
        status,
        after_value,
        evidence_data,
        message
    ):

        connection = Database.get_connection()

        try:

            cursor = connection.cursor()

            cursor.execute(
                """
                UPDATE remediation_verifications
                SET
                    verification_status=%s,
                    after_value=%s,
                    evidence_data=%s,
                    verification_message=%s,
                    completed_at=CURRENT_TIMESTAMP
                WHERE id=%s
                """,
                (
                    status,
                    after_value,
                    json.dumps(
                        evidence_data,
                        default=str
                    ),
                    message,
                    verification_id
                )
            )

            connection.commit()

            return cursor.rowcount

        finally:
            connection.close()

    def get(self, verification_id):

        connection = Database.get_connection()

        try:

            cursor = connection.cursor(
                DictCursor
            )

            cursor.execute(
                """
                SELECT *
                FROM remediation_verifications
                WHERE id=%s
                LIMIT 1
                """,
                (verification_id,)
            )

            row = cursor.fetchone()

            if row and isinstance(
                row.get("evidence_data"),
                str
            ):

                try:
                    row["evidence_data"] = json.loads(
                        row["evidence_data"]
                    )
                except json.JSONDecodeError:
                    pass

            return row

        finally:
            connection.close()

    def get_latest_for_execution(self, execution_id):

        connection = Database.get_connection()

        try:

            cursor = connection.cursor(
                DictCursor
            )

            cursor.execute(
                """
                SELECT
                    id,
                    execution_id,
                    incident_id,
                    server_id,
                    verification_status,
                    metric_name,
                    before_value,
                    after_value,
                    threshold_value,
                    evidence_data,
                    verification_message,
                    created_at,
                    completed_at
                FROM remediation_verifications
                WHERE execution_id=%s
                ORDER BY id DESC
                LIMIT 1
                """,
                (execution_id,)
            )

            row = cursor.fetchone()

            if row and isinstance(
                row.get("evidence_data"),
                str
            ):
                try:
                    row["evidence_data"] = json.loads(
                        row["evidence_data"]
                    )
                except json.JSONDecodeError:
                    pass

            return row

        finally:
            connection.close()
