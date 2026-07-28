from shared.database import Database


class InventoryRepository:

    def create_server(self, data):

        connection = Database.get_connection()
        cursor = connection.cursor()

        sql = """
        INSERT INTO servers
        (
            organization_id,
            environment_id,
            hostname,
            ip_address,
            operating_system,
            os_version,
            cpu_cores,
            memory_gb,
            disk_gb,
            cloud_provider,
            region,
            availability_zone,
            instance_type
        )
        VALUES
        (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.execute(sql, (
            1,
            data["environment_id"],
            data["hostname"],
            data["ip_address"],
            data["operating_system"],
            data["os_version"],
            data["cpu_cores"],
            data["memory_gb"],
            data["disk_gb"],
            data["cloud_provider"],
            data["region"],
            data["availability_zone"],
            data["instance_type"]
        ))

        connection.commit()

        server_id = cursor.lastrowid

        connection.close()

        return server_id

    def get_all_servers(self):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                s.id,
                s.hostname,
                s.ip_address,
                s.operating_system,
                s.cpu_cores,
                s.memory_gb,
                s.disk_gb,
                s.status,
                s.region,
                s.cloud_provider,
                s.discovery_source,
                s.external_resource_id,
                s.availability_zone,
                s.instance_type,

                e.environment_name AS environment,

                lm.cpu_usage,
                lm.memory_usage,
                lm.disk_usage,
                lm.collected_at

            FROM servers s

            LEFT JOIN environments e
                ON e.id = s.environment_id

            LEFT JOIN metrics lm
                ON lm.id = (
                    SELECT m.id
                    FROM metrics m
                    WHERE m.server_id = s.id
                    ORDER BY m.collected_at DESC, m.id DESC
                    LIMIT 1
                )

            WHERE s.is_deleted = FALSE

            ORDER BY s.hostname
        """)

        data = cursor.fetchall()

        connection.close()

        return data

    def get_server(self, server_id):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT *
            FROM servers
            WHERE id=%s
            AND is_deleted=FALSE
        """, (server_id,))

        data = cursor.fetchone()

        connection.close()

        return data

    def update_server(self, server_id, data):

        connection = Database.get_connection()
        cursor = connection.cursor()

        sql = """
        UPDATE servers
        SET
            environment_id=%s,
            hostname=%s,
            ip_address=%s,
            operating_system=%s,
            os_version=%s,
            cpu_cores=%s,
            memory_gb=%s,
            disk_gb=%s,
            cloud_provider=%s,
            region=%s,
            availability_zone=%s,
            instance_type=%s
        WHERE id=%s
        AND is_deleted=FALSE
        """

        cursor.execute(sql, (
            data["environment_id"],
            data["hostname"],
            data["ip_address"],
            data["operating_system"],
            data["os_version"],
            data["cpu_cores"],
            data["memory_gb"],
            data["disk_gb"],
            data["cloud_provider"],
            data["region"],
            data["availability_zone"],
            data["instance_type"],
            server_id
        ))

        connection.commit()

        affected = cursor.rowcount

        connection.close()

        return affected

    def delete_server(self, server_id):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE servers
            SET is_deleted=TRUE
            WHERE id=%s
        """, (server_id,))

        connection.commit()

        affected = cursor.rowcount

        connection.close()

        return affected

    def hostname_exists(self, hostname):

        connection = Database.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id
            FROM servers
            WHERE hostname=%s
            AND is_deleted=FALSE
        """, (hostname,))

        server = cursor.fetchone()

        connection.close()

        return server