from pymysql.cursors import DictCursor
from shared.database import Database


class DeploymentRepository:

    def get_all(self):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute("""
                SELECT
                    d.id,
                    d.application_id,
                    a.name AS application_name,
                    d.environment,
                    d.version,
                    d.status,
                    d.progress,
                    d.started_by,
                    u.username AS started_by_username,
                    d.previous_version,
                    d.deployment_log,
                    d.failure_reason,
                    d.started_at,
                    d.completed_at,
                    d.created_at,
                    d.updated_at
                FROM deployments d
                LEFT JOIN applications a
                    ON d.application_id = a.id
                LEFT JOIN users u
                    ON d.started_by = u.id
                ORDER BY d.created_at DESC
            """)

            return cursor.fetchall()

        finally:
            connection.close()


    def get_by_id(self, deployment_id):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute("""
                SELECT
                    d.*,
                    a.name AS application_name,
                    u.username AS started_by_username
                FROM deployments d
                LEFT JOIN applications a
                    ON d.application_id = a.id
                LEFT JOIN users u
                    ON d.started_by = u.id
                WHERE d.id = %s
            """, (deployment_id,))

            return cursor.fetchone()

        finally:
            connection.close()


    def create(
        self,
        application_id,
        environment,
        version,
        started_by,
        previous_version=None
    ):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute("""
                INSERT INTO deployments (
                    application_id,
                    environment,
                    version,
                    status,
                    progress,
                    started_by,
                    previous_version,
                    started_at
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    'QUEUED',
                    0,
                    %s,
                    %s,
                    NOW()
                )
            """, (
                application_id,
                environment,
                version,
                started_by,
                previous_version
            ))

            connection.commit()

            return cursor.lastrowid

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()


    def update_status(
        self,
        deployment_id,
        status,
        progress
    ):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            if status in ("SUCCESS", "FAILED", "ROLLED_BACK"):
                cursor.execute("""
                    UPDATE deployments
                    SET
                        status = %s,
                        progress = %s,
                        completed_at = NOW()
                    WHERE id = %s
                """, (
                    status,
                    progress,
                    deployment_id
                ))

            else:
                cursor.execute("""
                    UPDATE deployments
                    SET
                        status = %s,
                        progress = %s
                    WHERE id = %s
                """, (
                    status,
                    progress,
                    deployment_id
                ))

            connection.commit()

            return cursor.rowcount

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()


    def update_log(
        self,
        deployment_id,
        deployment_log
    ):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute("""
                UPDATE deployments
                SET deployment_log = %s
                WHERE id = %s
            """, (
                deployment_log,
                deployment_id
            ))

            connection.commit()

            return cursor.rowcount

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()


    def mark_failed(
        self,
        deployment_id,
        failure_reason
    ):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute("""
                UPDATE deployments
                SET
                    status = 'FAILED',
                    failure_reason = %s,
                    completed_at = NOW()
                WHERE id = %s
            """, (
                failure_reason,
                deployment_id
            ))

            connection.commit()

            return cursor.rowcount

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()


    def get_stats(self):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute("""
                SELECT
                    COUNT(*) AS total_deployments,

                    SUM(
                        CASE
                            WHEN status = 'SUCCESS'
                            THEN 1 ELSE 0
                        END
                    ) AS successful_deployments,

                    SUM(
                        CASE
                            WHEN status = 'FAILED'
                            THEN 1 ELSE 0
                        END
                    ) AS failed_deployments,

                    SUM(
                        CASE
                            WHEN status IN (
                                'QUEUED',
                                'BUILDING',
                                'TESTING',
                                'DEPLOYING'
                            )
                            THEN 1 ELSE 0
                        END
                    ) AS active_deployments

                FROM deployments
            """)

            return cursor.fetchone()

        finally:
            connection.close()


    def get_latest_successful(
        self,
        application_id,
        environment
    ):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute("""
                SELECT *
                FROM deployments
                WHERE application_id = %s
                  AND environment = %s
                  AND status = 'SUCCESS'
                ORDER BY completed_at DESC
                LIMIT 1
            """, (
                application_id,
                environment
            ))

            return cursor.fetchone()

        finally:
            connection.close()