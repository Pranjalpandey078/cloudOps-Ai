from pymysql.cursors import DictCursor
from shared.database import Database


class DashboardRepository:

    def summary(self):

        connection = Database.get_connection()
        cursor = connection.cursor(DictCursor)

        cursor.execute("""
            SELECT COUNT(*) AS total_servers
            FROM servers
            WHERE is_deleted = FALSE
        """)
        total_servers = cursor.fetchone()["total_servers"]

        cursor.execute("""
            SELECT COUNT(*) AS healthy_servers
            FROM servers
            WHERE status='RUNNING'
            AND is_deleted = FALSE
        """)
        healthy_servers = cursor.fetchone()["healthy_servers"]

        cursor.execute("""
            SELECT COUNT(*) AS open_incidents
            FROM incidents
            WHERE status='OPEN'
        """)
        open_incidents = cursor.fetchone()["open_incidents"]

        cursor.execute("""
            SELECT COUNT(*) AS critical_incidents
            FROM incidents
            WHERE severity='CRITICAL'
            AND status='OPEN'
        """)
        critical_incidents = cursor.fetchone()["critical_incidents"]

        cursor.execute("""
            SELECT COUNT(*) AS total_metrics
            FROM metrics
        """)
        total_metrics = cursor.fetchone()["total_metrics"]

        cursor.execute("""
            SELECT
                AVG(cpu_usage) AS cpu_avg,
                AVG(memory_usage) AS memory_avg,
                AVG(disk_usage) AS disk_avg
            FROM (
                SELECT
                    cpu_usage,
                    memory_usage,
                    disk_usage
                FROM metrics
                ORDER BY collected_at DESC
                LIMIT 20
            ) latest_metrics
        """)

        averages = cursor.fetchone()

        connection.close()

        return {
            "total_servers": total_servers,
            "healthy_servers": healthy_servers,
            "open_incidents": open_incidents,
            "critical_incidents": critical_incidents,
            "total_metrics": total_metrics,
            "cpu_avg": round(float(averages["cpu_avg"] or 0), 1),
            "memory_avg": round(float(averages["memory_avg"] or 0), 1),
            "disk_avg": round(float(averages["disk_avg"] or 0), 1)
        }

    def charts(self):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor(DictCursor)

            cursor.execute("""
                SELECT
                    m.server_id,
                    s.hostname,
                    s.cloud_provider,
                    s.discovery_source,
                    m.cpu_usage,
                    m.memory_usage,
                    m.disk_usage,
                    m.collected_at
                FROM metrics m
                JOIN servers s
                    ON s.id = m.server_id
                WHERE s.is_deleted = FALSE
                ORDER BY m.collected_at DESC
                LIMIT 100
            """)

            rows = cursor.fetchall()

        finally:
            connection.close()

        servers = {}

        for row in reversed(rows):

            server_id = row["server_id"]

            if server_id not in servers:

                servers[server_id] = {
                    "server_id": server_id,
                    "hostname": row["hostname"],
                    "cloud_provider": row["cloud_provider"],
                    "discovery_source": row["discovery_source"],
                    "cpu": [],
                    "memory": [],
                    "disk": []
                }

            timestamp = row["collected_at"]

            if row["cpu_usage"] is not None:
                servers[server_id]["cpu"].append({
                    "value": float(row["cpu_usage"]),
                    "time": timestamp
                })

            if row["memory_usage"] is not None:
                servers[server_id]["memory"].append({
                    "value": float(row["memory_usage"]),
                    "time": timestamp
                })

            if row["disk_usage"] is not None:
                servers[server_id]["disk"].append({
                    "value": float(row["disk_usage"]),
                    "time": timestamp
                })

        return {
            "servers": list(servers.values())
        }

    def recent_incidents(self):

        connection = Database.get_connection()

        cursor = connection.cursor(DictCursor)

        cursor.execute("""
            SELECT
                id,
                server_id,
                title,
                severity,
                status,
                created_at
            FROM incidents
            ORDER BY created_at DESC
            LIMIT 10
        """)

        data = cursor.fetchall()

        connection.close()

        return data