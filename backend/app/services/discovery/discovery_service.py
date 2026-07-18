from app.services.database.db import Database


class DiscoveryService:

    def discover(self):

        connection = Database.connect()

        cursor = connection.cursor()

        servers = [

            {

                "hostname": "prod-api-01",

                "ip": "10.0.1.20",

                "cpu": 8,

                "ram": 16,

                "disk": 200,

                "environment": 4

            },

            {

                "hostname": "prod-web-01",

                "ip": "10.0.1.21",

                "cpu": 4,

                "ram": 8,

                "disk": 100,

                "environment": 4

            }

        ]

        for server in servers:

            cursor.execute("""

SELECT id

FROM servers

WHERE hostname=%s

            """,

            (server["hostname"],))

            exists = cursor.fetchone()

            if exists:

                continue

            cursor.execute("""

INSERT INTO servers

(environment_id,

hostname,

ip_address,

operating_system,

os_version,

cpu_cores,

memory_gb,

disk_gb,

region,

instance_type)

VALUES

(%s,%s,%s,'Ubuntu','24.04',%s,%s,%s,'ap-south-1','t3.large')

            """,

            (

                server["environment"],

                server["hostname"],

                server["ip"],

                server["cpu"],

                server["ram"],

                server["disk"]

            ))

        connection.commit()

        cursor.close()

        connection.close()

        print("Discovery completed.")