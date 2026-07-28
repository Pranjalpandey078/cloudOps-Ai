from modules.discovery.providers.linux_provider import (
    LinuxDiscoveryProvider
)
from modules.discovery.providers.docker_provider import (
    DockerDiscoveryProvider
)
from modules.discovery.providers.kubernetes_provider import (
    KubernetesDiscoveryProvider
)
from modules.discovery.providers.aws_provider import (
    AWSDiscoveryProvider
)
from modules.discovery.repository import DiscoveryRepository


class DiscoveryService:

    def __init__(self):

        self.repository = DiscoveryRepository()

        self.linux_provider = LinuxDiscoveryProvider()
        self.docker_provider = DockerDiscoveryProvider()
        self.kubernetes_provider = KubernetesDiscoveryProvider()
        self.aws_provider = AWSDiscoveryProvider()


    def discover_linux(
        self,
        organization_id=1,
        environment_id=1
    ):

        asset = self.linux_provider.discover()

        result = self.repository.upsert_server(
            asset,
            organization_id=organization_id,
            environment_id=environment_id
        )

        return {
            "provider": "LINUX",
            "discovered": 1,
            "results": [result]
        }


    def discover_docker(
        self,
        organization_id=1
    ):

        containers = self.docker_provider.discover()

        results = []

        for container in containers:

            result = (
                self.repository.upsert_docker_container(
                    container,
                    organization_id=organization_id
                )
            )

            results.append(result)

        return {
            "provider": "DOCKER",
            "discovered": len(containers),
            "results": results
        }


    def discover_kubernetes(
        self,
        organization_id=1
    ):

        discovery = (
            self.kubernetes_provider.discover()
        )

        node_results = []
        pod_results = []


        for node in discovery["nodes"]:

            result = (
                self.repository.upsert_kubernetes_node(
                    node,
                    organization_id=organization_id
                )
            )

            node_results.append(result)


        for pod in discovery["pods"]:

            result = (
                self.repository.upsert_kubernetes_pod(
                    pod,
                    organization_id=organization_id
                )
            )

            pod_results.append(result)


        return {
            "provider": "KUBERNETES",
            "cluster_name":
                discovery["cluster_name"],
            "nodes_discovered":
                len(discovery["nodes"]),
            "pods_discovered":
                len(discovery["pods"]),
            "nodes": node_results,
            "pods": pod_results
        }


    def discover_aws(
        self,
        organization_id=1,
        environment_id=1
    ):

        instances = self.aws_provider.discover()

        results = []

        for instance in instances:

            result = self.repository.upsert_aws_server(
                instance,
                organization_id=organization_id,
                environment_id=environment_id
            )

            results.append(result)

        return {
            "provider": "AWS",
            "region": self.aws_provider.region,
            "discovered": len(instances),
            "results": results
        }


    def discover_all(
        self,
        organization_id=1,
        environment_id=1
    ):

        results = {}


        # Linux discovery
        try:

            results["linux"] = self.discover_linux(
                organization_id=organization_id,
                environment_id=environment_id
            )

        except Exception as error:

            results["linux"] = {
                "provider": "LINUX",
                "success": False,
                "error": str(error)
            }


        # Docker discovery
        try:

            results["docker"] = self.discover_docker(
                organization_id=organization_id
            )

        except Exception as error:

            results["docker"] = {
                "provider": "DOCKER",
                "success": False,
                "error": str(error)
            }


        # Kubernetes discovery
        try:

            results["kubernetes"] = (
                self.discover_kubernetes(
                    organization_id=organization_id
                )
            )

        except Exception as error:

            results["kubernetes"] = {
                "provider": "KUBERNETES",
                "success": False,
                "error": str(error)
            }


        # AWS discovery
        try:

            results["aws"] = self.discover_aws(
                organization_id=organization_id,
                environment_id=environment_id
            )

        except Exception as error:

            results["aws"] = {
                "provider": "AWS",
                "success": False,
                "error": str(error)
            }


        return {
            "success": True,
            "providers": results
        }


    def get_docker_containers(self, organization_id=1):

        return self.repository.get_docker_containers(
            organization_id=organization_id
        )


    def get_kubernetes_nodes(self, organization_id=1):

        return self.repository.get_kubernetes_nodes(
            organization_id=organization_id
        )


    def get_kubernetes_pods(self, organization_id=1):

        return self.repository.get_kubernetes_pods(
            organization_id=organization_id
        )

