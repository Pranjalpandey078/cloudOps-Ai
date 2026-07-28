from shared.database import Database


class DiscoveryRepository:

    def find_server_by_hostname(self, hostname):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT *
                FROM servers
                WHERE hostname = %s
                  AND is_deleted = FALSE
                LIMIT 1
                """,
                (hostname,)
            )

            return cursor.fetchone()

        finally:
            connection.close()


    def upsert_server(
        self,
        asset,
        organization_id=1,
        environment_id=1
    ):

        existing = self.find_server_by_hostname(
            asset["hostname"]
        )

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            if existing:

                cursor.execute(
                    """
                    UPDATE servers
                    SET
                        ip_address = %s,
                        operating_system = %s,
                        os_version = %s,
                        cpu_cores = %s,
                        memory_gb = %s,
                        disk_gb = %s,
                        cloud_provider = %s,
                        region = %s,
                        availability_zone = %s,
                        instance_type = %s,
                        status = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                      AND is_deleted = FALSE
                    """,
                    (
                        asset["ip_address"],
                        asset["operating_system"],
                        asset["os_version"],
                        asset["cpu_cores"],
                        asset["memory_gb"],
                        asset["disk_gb"],
                        asset["cloud_provider"],
                        asset["region"],
                        asset["availability_zone"],
                        asset["instance_type"],
                        asset["status"],
                        existing["id"]
                    )
                )

                return {
                    "action": "UPDATED",
                    "server_id": existing["id"],
                    "hostname": asset["hostname"]
                }

            cursor.execute(
                """
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
                    instance_type,
                    status
                )
                VALUES
                (
                    %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s
                )
                """,
                (
                    organization_id,
                    environment_id,
                    asset["hostname"],
                    asset["ip_address"],
                    asset["operating_system"],
                    asset["os_version"],
                    asset["cpu_cores"],
                    asset["memory_gb"],
                    asset["disk_gb"],
                    asset["cloud_provider"],
                    asset["region"],
                    asset["availability_zone"],
                    asset["instance_type"],
                    asset["status"]
                )
            )

            return {
                "action": "CREATED",
                "server_id": cursor.lastrowid,
                "hostname": asset["hostname"]
            }

        finally:
            connection.close()

    def find_docker_container(self, container_id):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT *
                FROM docker_containers
                WHERE container_id = %s
                  AND is_deleted = FALSE
                LIMIT 1
                """,
                (container_id,)
            )

            return cursor.fetchone()

        finally:
            connection.close()


    def upsert_docker_container(
        self,
        container,
        organization_id=1
    ):

        existing = self.find_docker_container(
            container["container_id"]
        )

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            if existing:

                cursor.execute(
                    """
                    UPDATE docker_containers
                    SET
                        container_name = %s,
                        image_name = %s,
                        status = %s,
                        ip_address = %s,
                        ports = %s,
                        docker_network = %s,
                        is_deleted = FALSE,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    """,
                    (
                        container["container_name"],
                        container["image_name"],
                        container["status"],
                        container["ip_address"],
                        container["ports"],
                        container["docker_network"],
                        existing["id"]
                    )
                )

                return {
                    "action": "UPDATED",
                    "docker_container_id": existing["id"],
                    "container_id": container["container_id"],
                    "container_name": container["container_name"]
                }

            cursor.execute(
                """
                INSERT INTO docker_containers
                (
                    organization_id,
                    container_id,
                    container_name,
                    image_name,
                    status,
                    ip_address,
                    ports,
                    docker_network
                )
                VALUES
                (%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    organization_id,
                    container["container_id"],
                    container["container_name"],
                    container["image_name"],
                    container["status"],
                    container["ip_address"],
                    container["ports"],
                    container["docker_network"]
                )
            )

            return {
                "action": "CREATED",
                "docker_container_id": cursor.lastrowid,
                "container_id": container["container_id"],
                "container_name": container["container_name"]
            }

        finally:
            connection.close()



    def find_kubernetes_node_by_uid(self, node_uid):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT *
                FROM kubernetes_nodes
                WHERE node_uid = %s
                  AND is_deleted = FALSE
                LIMIT 1
                """,
                (node_uid,)
            )

            return cursor.fetchone()

        finally:
            connection.close()


    def upsert_kubernetes_node(
        self,
        node,
        organization_id=1
    ):

        existing = self.find_kubernetes_node_by_uid(
            node["node_uid"]
        )

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            if existing:

                cursor.execute(
                    """
                    UPDATE kubernetes_nodes
                    SET
                        organization_id = %s,
                        cluster_name = %s,
                        node_name = %s,
                        status = %s,
                        role = %s,
                        internal_ip = %s,
                        kubernetes_version = %s,
                        operating_system = %s,
                        kernel_version = %s,
                        container_runtime = %s,
                        is_deleted = FALSE,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    """,
                    (
                        organization_id,
                        node["cluster_name"],
                        node["node_name"],
                        node["status"],
                        node["role"],
                        node["internal_ip"],
                        node["kubernetes_version"],
                        node["operating_system"],
                        node["kernel_version"],
                        node["container_runtime"],
                        existing["id"]
                    )
                )

                return {
                    "action": "UPDATED",
                    "kubernetes_node_id": existing["id"],
                    "node_uid": node["node_uid"],
                    "node_name": node["node_name"]
                }

            cursor.execute(
                """
                INSERT INTO kubernetes_nodes
                (
                    organization_id,
                    cluster_name,
                    node_uid,
                    node_name,
                    status,
                    role,
                    internal_ip,
                    kubernetes_version,
                    operating_system,
                    kernel_version,
                    container_runtime
                )
                VALUES
                (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    organization_id,
                    node["cluster_name"],
                    node["node_uid"],
                    node["node_name"],
                    node["status"],
                    node["role"],
                    node["internal_ip"],
                    node["kubernetes_version"],
                    node["operating_system"],
                    node["kernel_version"],
                    node["container_runtime"]
                )
            )

            return {
                "action": "CREATED",
                "kubernetes_node_id": cursor.lastrowid,
                "node_uid": node["node_uid"],
                "node_name": node["node_name"]
            }

        finally:
            connection.close()


    def find_kubernetes_pod_by_uid(self, pod_uid):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT *
                FROM kubernetes_pods
                WHERE pod_uid = %s
                  AND is_deleted = FALSE
                LIMIT 1
                """,
                (pod_uid,)
            )

            return cursor.fetchone()

        finally:
            connection.close()


    def upsert_kubernetes_pod(
        self,
        pod,
        organization_id=1
    ):

        existing = self.find_kubernetes_pod_by_uid(
            pod["pod_uid"]
        )

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            if existing:

                cursor.execute(
                    """
                    UPDATE kubernetes_pods
                    SET
                        organization_id = %s,
                        cluster_name = %s,
                        pod_name = %s,
                        namespace = %s,
                        node_name = %s,
                        pod_ip = %s,
                        status = %s,
                        restart_count = %s,
                        is_deleted = FALSE,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    """,
                    (
                        organization_id,
                        pod["cluster_name"],
                        pod["pod_name"],
                        pod["namespace"],
                        pod["node_name"],
                        pod["pod_ip"],
                        pod["status"],
                        pod["restart_count"],
                        existing["id"]
                    )
                )

                return {
                    "action": "UPDATED",
                    "kubernetes_pod_id": existing["id"],
                    "pod_uid": pod["pod_uid"],
                    "pod_name": pod["pod_name"]
                }

            cursor.execute(
                """
                INSERT INTO kubernetes_pods
                (
                    organization_id,
                    cluster_name,
                    pod_uid,
                    pod_name,
                    namespace,
                    node_name,
                    pod_ip,
                    status,
                    restart_count
                )
                VALUES
                (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    organization_id,
                    pod["cluster_name"],
                    pod["pod_uid"],
                    pod["pod_name"],
                    pod["namespace"],
                    pod["node_name"],
                    pod["pod_ip"],
                    pod["status"],
                    pod["restart_count"]
                )
            )

            return {
                "action": "CREATED",
                "kubernetes_pod_id": cursor.lastrowid,
                "pod_uid": pod["pod_uid"],
                "pod_name": pod["pod_name"]
            }

        finally:
            connection.close()


    def get_docker_containers(self, organization_id=1):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT
                    id,
                    container_id,
                    container_name,
                    image_name,
                    status,
                    ip_address,
                    ports,
                    docker_network,
                    discovered_at,
                    updated_at
                FROM docker_containers
                WHERE organization_id = %s
                  AND is_deleted = FALSE
                ORDER BY container_name
                """,
                (organization_id,)
            )

            return cursor.fetchall()

        finally:
            connection.close()


    def get_kubernetes_nodes(self, organization_id=1):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT
                    id,
                    cluster_name,
                    node_uid,
                    node_name,
                    status,
                    role,
                    internal_ip,
                    kubernetes_version,
                    operating_system,
                    kernel_version,
                    container_runtime,
                    discovered_at,
                    updated_at
                FROM kubernetes_nodes
                WHERE organization_id = %s
                  AND is_deleted = FALSE
                ORDER BY cluster_name, node_name
                """,
                (organization_id,)
            )

            return cursor.fetchall()

        finally:
            connection.close()


    def get_kubernetes_pods(self, organization_id=1):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT
                    id,
                    cluster_name,
                    pod_uid,
                    pod_name,
                    namespace,
                    node_name,
                    pod_ip,
                    status,
                    restart_count,
                    discovered_at,
                    updated_at
                FROM kubernetes_pods
                WHERE organization_id = %s
                  AND is_deleted = FALSE
                ORDER BY cluster_name, namespace, pod_name
                """,
                (organization_id,)
            )

            return cursor.fetchall()

        finally:
            connection.close()



    def find_server_by_external_resource_id(
        self,
        external_resource_id,
        cloud_provider=None
    ):

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            if cloud_provider:

                cursor.execute(
                    """
                    SELECT *
                    FROM servers
                    WHERE external_resource_id = %s
                      AND cloud_provider = %s
                      AND is_deleted = FALSE
                    LIMIT 1
                    """,
                    (
                        external_resource_id,
                        cloud_provider
                    )
                )

            else:

                cursor.execute(
                    """
                    SELECT *
                    FROM servers
                    WHERE external_resource_id = %s
                      AND is_deleted = FALSE
                    LIMIT 1
                    """,
                    (external_resource_id,)
                )

            return cursor.fetchone()

        finally:
            connection.close()


    def upsert_aws_server(
        self,
        asset,
        organization_id=1,
        environment_id=1
    ):

        instance_id = asset.get(
            "external_resource_id"
        ) or asset.get("instance_id")

        if not instance_id:
            raise ValueError(
                "AWS instance ID is required."
            )

        existing = (
            self.find_server_by_external_resource_id(
                instance_id,
                cloud_provider="AWS"
            )
        )

        connection = Database.get_connection()

        try:
            cursor = connection.cursor()

            if existing:

                cursor.execute(
                    """
                    UPDATE servers
                    SET
                        organization_id = %s,
                        environment_id = %s,
                        hostname = %s,
                        ip_address = %s,
                        operating_system = %s,
                        os_version = %s,
                        cpu_cores = %s,
                        memory_gb = %s,
                        disk_gb = %s,
                        cloud_provider = 'AWS',
                        discovery_source = 'AWS',
                        region = %s,
                        availability_zone = %s,
                        instance_type = %s,
                        status = %s,
                        is_deleted = FALSE,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    """,
                    (
                        organization_id,
                        environment_id,
                        asset["hostname"],
                        asset["ip_address"],
                        asset["operating_system"],
                        asset["os_version"],
                        asset["cpu_cores"],
                        asset["memory_gb"],
                        asset["disk_gb"],
                        asset["region"],
                        asset["availability_zone"],
                        asset["instance_type"],
                        asset["status"],
                        existing["id"]
                    )
                )

                return {
                    "action": "UPDATED",
                    "server_id": existing["id"],
                    "instance_id": instance_id,
                    "hostname": asset["hostname"]
                }

            cursor.execute(
                """
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
                    discovery_source,
                    external_resource_id,
                    region,
                    availability_zone,
                    instance_type,
                    status
                )
                VALUES
                (
                    %s,%s,%s,%s,
                    %s,%s,%s,%s,
                    %s,'AWS','AWS',%s,
                    %s,%s,%s,%s
                )
                """,
                (
                    organization_id,
                    environment_id,
                    asset["hostname"],
                    asset["ip_address"],
                    asset["operating_system"],
                    asset["os_version"],
                    asset["cpu_cores"],
                    asset["memory_gb"],
                    asset["disk_gb"],
                    instance_id,
                    asset["region"],
                    asset["availability_zone"],
                    asset["instance_type"],
                    asset["status"]
                )
            )

            return {
                "action": "CREATED",
                "server_id": cursor.lastrowid,
                "instance_id": instance_id,
                "hostname": asset["hostname"]
            }

        finally:
            connection.close()
