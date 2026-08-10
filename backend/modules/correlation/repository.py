from shared.database import Database
from pymysql.cursors import DictCursor


class CorrelationRepository:

    def get_connection(self):
        return Database.get_connection()


    def find_open_group(
        self,
        organization_id,
        severity,
        root_cause
    ):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute(
            """
            SELECT *
            FROM incident_correlation_groups
            WHERE
                organization_id=%s
                AND severity=%s
                AND root_cause=%s
                AND status='OPEN'
            LIMIT 1
            """,
            (
                organization_id,
                severity,
                root_cause
            )
        )

        group = cursor.fetchone()

        connection.close()

        return group


    def create_group(
        self,
        organization_id,
        title,
        severity,
        root_cause,
        confidence_score=100
    ):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO incident_correlation_groups
            (
                organization_id,
                title,
                severity,
                root_cause,
                confidence_score,
                incident_count
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                0
            )
            """,
            (
                organization_id,
                title,
                severity,
                root_cause,
                confidence_score
            )
        )

        group_id = cursor.lastrowid

        connection.commit()
        connection.close()

        return group_id



    def find_group_by_incident(
        self,
        incident_id
    ):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        try:

            cursor.execute(
                """
                SELECT
                    g.id
                FROM incident_correlation_items i
                JOIN incident_correlation_groups g
                    ON g.id = i.group_id
                WHERE
                    i.incident_id=%s
                    AND g.status='OPEN'
                ORDER BY
                    g.updated_at DESC
                LIMIT 1
                """,
                (
                    incident_id,
                )
            )

            row = cursor.fetchone()

            return row["id"] if row else None

        finally:

            connection.close()


    def find_group(
        self,
        organization_id,
        server_id,
        metric_name,
        severity
    ):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        try:

            cursor.execute(
                """
                SELECT g.id
                FROM incident_correlation_groups g
                WHERE
                    g.status='OPEN'
                    AND g.organization_id=%s
                    AND g.root_cause=%s
                    AND g.severity=%s
                    AND TIMESTAMPDIFF(
                        MINUTE,
                        g.updated_at,
                        NOW()
                    ) <= 30
                ORDER BY
                    g.updated_at DESC
                LIMIT 1
                """,
                (
                    organization_id,
                    metric_name,
                    severity
                )
            )

            row = cursor.fetchone()

            return row["id"] if row else None

        finally:

            connection.close()


    def add_incident(
        self,
        group_id,
        incident_id
    ):

        connection = None

        try:

            print(
                f"[CORRELATION] Adding Incident "
                f"{incident_id} -> Group {group_id}"
            )

            connection = Database.get_connection()
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT COUNT(*) AS existing
                FROM incident_correlation_items
                WHERE
                    group_id=%s
                    AND incident_id=%s
                """,
                (
                    group_id,
                    incident_id
                )
            )

            row = cursor.fetchone()

            print(
                f"[CORRELATION] Existing relation: {row}"
            )

            if row["existing"]:
                connection.close()

                print(
                    f"[CORRELATION] Relation already exists: "
                    f"{group_id} -> {incident_id}"
                )

                return

            cursor.execute(
                """
                INSERT INTO incident_correlation_items
                (
                    group_id,
                    incident_id
                )
                VALUES
                (
                    %s,
                    %s
                )
                """,
                (
                    group_id,
                    incident_id
                )
            )

            print(
                f"[CORRELATION] Incident {incident_id} "
                f"inserted into Group {group_id}"
            )

            cursor.execute(
                """
                UPDATE incident_correlation_groups
                SET incident_count =
                (
                    SELECT COUNT(*)
                    FROM incident_correlation_items
                    WHERE group_id=%s
                )
                WHERE id=%s
                """,
                (
                    group_id,
                    group_id
                )
            )

            connection.commit()

            print(
                f"[CORRELATION] Group {group_id} "
                f"incident_count updated"
            )

        except Exception as error:

            if connection:
                try:
                    connection.rollback()
                except Exception:
                    pass

            print(
                f"[CORRELATION ADD ERROR] "
                f"type={type(error).__name__} "
                f"error={repr(error)}"
            )

            raise

        finally:

            if connection:
                try:
                    connection.close()
                except Exception:
                    pass


    def increase_confidence(
        self,
        group_id
    ):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE incident_correlation_groups
            SET confidence_score =
                LEAST(
                    confidence_score + 2,
                    100
                )
            WHERE id=%s
            """,
            (
                group_id,
            )
        )

        connection.commit()
        connection.close()



    def get_related_incidents(
        self,
        incident_id
    ):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute(
            """
            SELECT
                inc.id,
                inc.server_id,
                inc.title,
                inc.description,
                inc.severity,
                inc.status,
                inc.metric_name,
                inc.metric_value,
                inc.threshold_value,
                inc.ai_status,
                inc.ai_analysis,
                inc.created_at,
                inc.resolved_at,
                i.group_id
            FROM incident_correlation_items i

            JOIN incidents inc
                ON inc.id=i.incident_id

            WHERE
                i.group_id = (
                    SELECT group_id
                    FROM incident_correlation_items
                    WHERE incident_id=%s
                    LIMIT 1
                )

                AND inc.id != %s

            ORDER BY
                inc.created_at DESC

            LIMIT 20
            """,
            (
                incident_id,
                incident_id
            )
        )

        incidents = cursor.fetchall()

        connection.close()

        return incidents


    def get_dashboard_stats(self):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_groups,
                SUM(status='OPEN') AS open_groups,
                SUM(status='RESOLVED') AS resolved_groups,
                SUM(incident_count) AS total_incidents,
                ROUND(AVG(confidence_score),1) AS average_confidence
            FROM incident_correlation_groups
            """
        )

        data = cursor.fetchone()

        connection.close()

        return data



    def get_group_by_incident(
        self,
        incident_id
    ):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute(
            """
            SELECT group_id
            FROM incident_correlation_items
            WHERE incident_id=%s
            LIMIT 1
            """,
            (
                incident_id,
            )
        )

        row = cursor.fetchone()

        connection.close()

        return row["group_id"] if row else None



    def refresh_group_status(
        self,
        group_id
    ):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM incident_correlation_items i
            JOIN incidents inc
                ON inc.id=i.incident_id
            WHERE
                i.group_id=%s
                AND inc.status!='RESOLVED'
            """,
            (
                group_id,
            )
        )

        remaining = cursor.fetchone()[0]

        if remaining == 0:

            cursor.execute(
                """
                UPDATE incident_correlation_groups
                SET status='RESOLVED'
                WHERE id=%s
                """,
                (
                    group_id,
                )
            )

        connection.commit()
        connection.close()




