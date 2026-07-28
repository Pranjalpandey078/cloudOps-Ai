import json
import subprocess


class DockerDiscoveryProvider:

    TIMEOUT_SECONDS = 10

    def discover(self):

        result = subprocess.run(
            [
                "docker",
                "ps",
                "--format",
                "{{json .}}"
            ],
            capture_output=True,
            text=True,
            timeout=self.TIMEOUT_SECONDS,
            check=False
        )

        if result.returncode != 0:
            raise RuntimeError(
                result.stderr.strip()
                or "Docker discovery failed."
            )

        containers = []

        for line in result.stdout.splitlines():

            if not line.strip():
                continue

            summary = json.loads(line)

            container_id = summary.get("ID")

            inspect_result = subprocess.run(
                [
                    "docker",
                    "inspect",
                    container_id
                ],
                capture_output=True,
                text=True,
                timeout=self.TIMEOUT_SECONDS,
                check=False
            )

            if inspect_result.returncode != 0:
                continue

            inspect_data = json.loads(
                inspect_result.stdout
            )[0]

            networks = (
                inspect_data
                .get("NetworkSettings", {})
                .get("Networks", {})
            )

            network_name = None
            ip_address = None

            if networks:

                network_name = next(
                    iter(networks)
                )

                ip_address = (
                    networks[network_name]
                    .get("IPAddress")
                )

            container_name = (
                inspect_data
                .get("Name", "")
                .lstrip("/")
            )

            image_name = (
                inspect_data
                .get("Config", {})
                .get("Image")
            )

            status = (
                inspect_data
                .get("State", {})
                .get("Status")
            )

            containers.append({
                "provider": "DOCKER",
                "container_id": inspect_data.get(
                    "Id"
                ),
                "container_name": container_name,
                "image_name": image_name,
                "status": status,
                "ip_address": ip_address,
                "ports": summary.get("Ports"),
                "docker_network": network_name
            })

        return containers
