import json
import subprocess


class KubernetesDiscoveryProvider:

    TIMEOUT_SECONDS = 15


    def _run_json(self, command):

        result = subprocess.run(
            command,
            shell=False,
            capture_output=True,
            text=True,
            timeout=self.TIMEOUT_SECONDS,
            check=False
        )

        if result.returncode != 0:
            raise RuntimeError(
                result.stderr.strip()
                or "Kubernetes discovery command failed."
            )

        return json.loads(result.stdout)


    def get_cluster_name(self):

        result = subprocess.run(
            [
                "kubectl",
                "config",
                "current-context"
            ],
            shell=False,
            capture_output=True,
            text=True,
            timeout=self.TIMEOUT_SECONDS,
            check=False
        )

        if result.returncode != 0:
            raise RuntimeError(
                result.stderr.strip()
                or "Unable to determine Kubernetes context."
            )

        return result.stdout.strip()


    def discover_nodes(self):

        cluster_name = self.get_cluster_name()

        data = self._run_json(
            [
                "kubectl",
                "get",
                "nodes",
                "-o",
                "json"
            ]
        )

        nodes = []

        for item in data.get("items", []):

            metadata = item.get("metadata", {})
            status_data = item.get("status", {})

            node_info = status_data.get(
                "nodeInfo",
                {}
            )

            addresses = status_data.get(
                "addresses",
                []
            )

            internal_ip = None

            for address in addresses:

                if (
                    address.get("type")
                    == "InternalIP"
                ):
                    internal_ip = address.get(
                        "address"
                    )
                    break


            conditions = status_data.get(
                "conditions",
                []
            )

            node_status = "UNKNOWN"

            for condition in conditions:

                if (
                    condition.get("type") == "Ready"
                ):

                    node_status = (
                        "READY"
                        if condition.get("status")
                        == "True"
                        else "NOT_READY"
                    )

                    break


            labels = metadata.get(
                "labels",
                {}
            )

            role = "worker"

            if (
                "node-role.kubernetes.io/control-plane"
                in labels
            ):
                role = "control-plane"

            elif (
                "node-role.kubernetes.io/master"
                in labels
            ):
                role = "master"


            nodes.append(
                {
                    "provider": "KUBERNETES",
                    "cluster_name": cluster_name,
                    "node_uid": metadata.get("uid"),
                    "node_name": metadata.get("name"),
                    "status": node_status,
                    "role": role,
                    "internal_ip": internal_ip,
                    "kubernetes_version":
                        node_info.get(
                            "kubeletVersion"
                        ),
                    "operating_system":
                        node_info.get(
                            "osImage"
                        ),
                    "kernel_version":
                        node_info.get(
                            "kernelVersion"
                        ),
                    "container_runtime":
                        node_info.get(
                            "containerRuntimeVersion"
                        )
                }
            )

        return nodes


    def discover_pods(self):

        cluster_name = self.get_cluster_name()

        data = self._run_json(
            [
                "kubectl",
                "get",
                "pods",
                "-A",
                "-o",
                "json"
            ]
        )

        pods = []

        for item in data.get("items", []):

            metadata = item.get(
                "metadata",
                {}
            )

            spec = item.get(
                "spec",
                {}
            )

            status_data = item.get(
                "status",
                {}
            )

            restart_count = sum(
                container.get(
                    "restartCount",
                    0
                )
                for container
                in status_data.get(
                    "containerStatuses",
                    []
                )
            )

            pods.append(
                {
                    "provider": "KUBERNETES",
                    "cluster_name": cluster_name,
                    "pod_uid": metadata.get("uid"),
                    "pod_name": metadata.get("name"),
                    "namespace":
                        metadata.get(
                            "namespace",
                            "default"
                        ),
                    "node_name":
                        spec.get("nodeName"),
                    "pod_ip":
                        status_data.get(
                            "podIP"
                        ),
                    "status":
                        status_data.get(
                            "phase",
                            "Unknown"
                        ),
                    "restart_count":
                        restart_count
                }
            )

        return pods


    def discover(self):

        return {
            "provider": "KUBERNETES",
            "cluster_name":
                self.get_cluster_name(),
            "nodes":
                self.discover_nodes(),
            "pods":
                self.discover_pods()
        }
