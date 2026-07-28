from pymysql.cursors import DictCursor

from shared.database import Database


class RemediationRepository:

    def create_execution(
        self,
        incident_id,
        server_id,
        user_id,
        execution_type,
        command_text,
        risk_level,
        execution_status="PENDING"
    ):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                INSERT INTO remediation_executions
                (
                    incident_id,
                    server_id,
                    user_id,
                    execution_type,
                    command_text,
                    execution_status,
                    risk_level
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    incident_id,
                    server_id,
                    user_id,
                    execution_type,
                    command_text,
                    execution_status,
                    risk_level
                )
            )

            return cursor.lastrowid

        finally:
            connection.close()


    def get_execution(self, execution_id):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute(
                """
                SELECT
                    re.*,
                    i.title AS incident_title,
                    s.hostname AS server_hostname,
                    s.ip_address AS server_ip
                FROM remediation_executions re

                LEFT JOIN incidents i
                    ON i.id = re.incident_id

                LEFT JOIN servers s
                    ON s.id = re.server_id

                WHERE re.id=%s
                LIMIT 1
                """,
                (execution_id,)
            )

            return cursor.fetchone()

        finally:
            connection.close()


    def get_incident(self, incident_id):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute(
                """
                SELECT
                    i.*,
                    s.hostname AS server_hostname,
                    s.ip_address AS server_ip
                FROM incidents i

                LEFT JOIN servers s
                    ON s.id = i.server_id

                WHERE i.id=%s
                LIMIT 1
                """,
                (incident_id,)
            )

            return cursor.fetchone()

        finally:
            connection.close()


    def list_for_incident(self, incident_id):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute(
                """
                SELECT
                    re.*,
                    s.hostname AS server_hostname
                FROM remediation_executions re

                LEFT JOIN servers s
                    ON s.id = re.server_id

                WHERE re.incident_id=%s

                ORDER BY re.created_at DESC
                """,
                (incident_id,)
            )

            return cursor.fetchall()

        finally:
            connection.close()


    def update_status(self, execution_id, status):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            if status == "APPROVED":

                cursor.execute(
                    """
                    UPDATE remediation_executions
                    SET
                        execution_status=%s,
                        approved_at=CURRENT_TIMESTAMP
                    WHERE id=%s
                    """,
                    (
                        status,
                        execution_id
                    )
                )

            else:

                cursor.execute(
                    """
                    UPDATE remediation_executions
                    SET execution_status=%s
                    WHERE id=%s
                    """,
                    (
                        status,
                        execution_id
                    )
                )

            return cursor.rowcount

        finally:
            connection.close()




    def get_by_id(self, execution_id):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute(
                """
                SELECT
                    re.id,
                    re.incident_id,
                    re.server_id,
                    re.user_id,
                    re.execution_type,
                    re.command_text,
                    re.execution_status,
                    re.risk_level,
                    re.exit_code,
                    re.stdout,
                    re.stderr,
                    re.approved_at,
                    re.started_at,
                    re.completed_at,
                    re.created_at,
                    i.title AS incident_title,
                    s.hostname AS server_hostname,
                    s.ip_address AS server_ip
                FROM remediation_executions re

                LEFT JOIN incidents i
                    ON i.id = re.incident_id

                LEFT JOIN servers s
                    ON s.id = re.server_id

                WHERE re.id = %s
                LIMIT 1
                """,
                (execution_id,)
            )

            return cursor.fetchone()

        finally:
            connection.close()

    def mark_running(self, execution_id):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                UPDATE remediation_executions
                SET
                    execution_status='RUNNING',
                    started_at=CURRENT_TIMESTAMP
                WHERE id=%s
                  AND execution_status='APPROVED'
                """,
                (execution_id,)
            )

            return cursor.rowcount

        finally:
            connection.close()


    def complete_execution(
        self,
        execution_id,
        status,
        exit_code,
        stdout,
        stderr
    ):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                UPDATE remediation_executions
                SET
                    execution_status=%s,
                    exit_code=%s,
                    stdout=%s,
                    stderr=%s,
                    completed_at=CURRENT_TIMESTAMP
                WHERE id=%s
                  AND execution_status='RUNNING'
                """,
                (
                    status,
                    exit_code,
                    stdout,
                    stderr,
                    execution_id
                )
            )

            return cursor.rowcount

        finally:
            connection.close()
