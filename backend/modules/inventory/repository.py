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

        id,

        hostname,

        ip_address,

        operating_system,

        cpu_cores,

        memory_gb,

        disk_gb,

        status,

        region,

        cloud_provider

        FROM servers

        WHERE is_deleted=FALSE

        ORDER BY hostname

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

        """,(server_id,))

        data = cursor.fetchone()

        connection.close()

        return data