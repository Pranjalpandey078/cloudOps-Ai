from pymysql.cursors import DictCursor
from shared.database import Database


class MonitoringRepository:

    def save(self, metrics):
        connection = Database.get_connection()

        try:
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
                VALUES (%s, %s, %s, %s)
                """,
                (
                    metrics["server_id"],
                    metrics["cpu"],
                    metrics["memory"],
                    metrics["disk"]
                )
            )

            connection.commit()

        finally:
            connection.close()


    def latest_metrics(self):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute(
                """
                SELECT *
                FROM metrics
                ORDER BY collected_at DESC
                LIMIT 50
                """
            )

            return cursor.fetchall()

        finally:
            connection.close()


    def get_rule(self, metric_name):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute(
                """
                SELECT *
                FROM monitoring_rules
                WHERE metric_name = %s
                AND enabled = TRUE
                LIMIT 1
                """,
                (metric_name,)
            )

            return cursor.fetchone()

        finally:
            connection.close()


    def overview(self):
        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            # Use recent metrics instead of averaging the entire history.
            cursor.execute(
                """
                SELECT
                    ROUND(AVG(cpu_usage), 2) AS cpu,
                    ROUND(AVG(memory_usage), 2) AS memory,
                    ROUND(AVG(disk_usage), 2) AS disk
                FROM (
                    SELECT
                        cpu_usage,
                        memory_usage,
                        disk_usage
                    FROM metrics
                    ORDER BY collected_at DESC
                    LIMIT 20
                ) AS recent_metrics
                """
            )

            usage = cursor.fetchone() or {}

            cursor.execute(
                """
                SELECT COUNT(*) AS total
                FROM servers
                WHERE is_deleted = FALSE
                """
            )

            total = cursor.fetchone()["total"]

            cursor.execute(
                """
                SELECT COUNT(*) AS online
                FROM servers
                WHERE status = 'RUNNING'
                AND is_deleted = FALSE
                """
            )

            online = cursor.fetchone()["online"]

            cursor.execute(
                """
                SELECT COUNT(*) AS offline
                FROM servers
                WHERE status != 'RUNNING'
                AND is_deleted = FALSE
                """
            )

            offline = cursor.fetchone()["offline"]

            return {
                "cpu": float(usage.get("cpu") or 0),
                "memory": float(usage.get("memory") or 0),
                "disk": float(usage.get("disk") or 0),
                "servers": total,
                "online": online,
                "offline": offline
            }

        finally:
            connection.close()


    def get_aws_servers(self):

        connection = Database.get_connection()

        try:

            cursor = connection.cursor(DictCursor)

            cursor.execute(
                """
                SELECT
                    id,
                    hostname,
                    external_resource_id,
                    region,
                    status
                FROM servers
                WHERE discovery_source = 'AWS'
                  AND external_resource_id IS NOT NULL
                  AND is_deleted = FALSE
                ORDER BY id
                """
            )

            return cursor.fetchall()

        finally:

            connection.close()


    def get_local_discovered_server(self):

        connection = Database.get_connection()

        try:

            cursor = connection.cursor(DictCursor)

            cursor.execute(
                """
                SELECT
                    id,
                    hostname,
                    organization_id
                FROM servers
                WHERE discovery_source = 'LINUX'
                  AND is_deleted = FALSE
                ORDER BY updated_at DESC
                LIMIT 1
                """
            )

            return cursor.fetchone()

        finally:

            connection.close()


    def get_local_server_id(self):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute(
                """
                SELECT id
                FROM servers
                WHERE discovery_source = 'LINUX'
                  AND is_deleted = FALSE
                ORDER BY updated_at DESC, id DESC
                LIMIT 1
                """
            )

            row = cursor.fetchone()

            if row:
                return row["id"]

            return None

        finally:
            connection.close()


    def get_server_context(self, server_id):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute(
                """
                SELECT
                    id,
                    organization_id,
                    hostname,
                    operating_system,
                    status
                FROM servers
                WHERE id=%s
                  AND is_deleted=FALSE
                LIMIT 1
                """,
                (server_id,)
            )

            row = cursor.fetchone()

            if not row:
                raise ValueError(
                    f"Server {server_id} is not registered."
                )

            return row

        finally:
            connection.close()
