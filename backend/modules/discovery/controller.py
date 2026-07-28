from modules.discovery.service import DiscoveryService
from shared.response import ApiResponse


class DiscoveryController:

    service = DiscoveryService()


    def discover_aws(self):

        result = self.service.discover_aws(
            organization_id=1,
            environment_id=1
        )

        return ApiResponse.success(
            message="AWS discovery completed successfully",
            data=result
        )


    def discover_all(self):

        try:

            result = self.service.discover_all(
                organization_id=1,
                environment_id=1
            )

            return ApiResponse.success(
                message="Infrastructure discovery completed successfully",
                data=result
            )

        except Exception as error:

            return ApiResponse.error(
                message=f"Discovery failed: {str(error)}",
                status=500
            )


    def discover_linux(self):

        try:

            result = self.service.discover_linux(
                organization_id=1,
                environment_id=1
            )

            return ApiResponse.success(
                message="Linux discovery completed successfully",
                data=result
            )

        except Exception as error:

            return ApiResponse.error(
                message=f"Linux discovery failed: {str(error)}",
                status=500
            )


    def discover_docker(self):

        try:

            result = self.service.discover_docker(
                organization_id=1
            )

            return ApiResponse.success(
                message="Docker discovery completed successfully",
                data=result
            )

        except Exception as error:

            return ApiResponse.error(
                message=f"Docker discovery failed: {str(error)}",
                status=500
            )


    def discover_kubernetes(self):

        try:

            result = self.service.discover_kubernetes(
                organization_id=1
            )

            return ApiResponse.success(
                message="Kubernetes discovery completed successfully",
                data=result
            )

        except Exception as error:

            return ApiResponse.error(
                message=f"Kubernetes discovery failed: {str(error)}",
                status=500
            )


    def get_docker_containers(self):

        try:

            data = self.service.get_docker_containers(
                organization_id=1
            )

            return ApiResponse.success(
                message="Docker containers fetched successfully",
                data=data
            )

        except Exception as error:

            return ApiResponse.error(
                message=f"Failed to fetch Docker containers: {str(error)}",
                status=500
            )


    def get_kubernetes_nodes(self):

        try:

            data = self.service.get_kubernetes_nodes(
                organization_id=1
            )

            return ApiResponse.success(
                message="Kubernetes nodes fetched successfully",
                data=data
            )

        except Exception as error:

            return ApiResponse.error(
                message=f"Failed to fetch Kubernetes nodes: {str(error)}",
                status=500
            )


    def get_kubernetes_pods(self):

        try:

            data = self.service.get_kubernetes_pods(
                organization_id=1
            )

            return ApiResponse.success(
                message="Kubernetes pods fetched successfully",
                data=data
            )

        except Exception as error:

            return ApiResponse.error(
                message=f"Failed to fetch Kubernetes pods: {str(error)}",
                status=500
            )

