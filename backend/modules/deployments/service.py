from modules.deployments.repository import DeploymentRepository
from shared.response import ApiResponse

from core.socketio import (
    emit_deployment_created,
    emit_deployment_progress,
    emit_deployment_completed,
    emit_deployment_failed,
    emit_deployment_rollback
)

from workers.deployments.deployment_executor import DeploymentExecutor


class DeploymentService:

    repository = DeploymentRepository()
    executor = DeploymentExecutor()

    ALLOWED_ENVIRONMENTS = {
        "development",
        "staging",
        "production"
    }

    ACTIVE_STATUSES = {
        "QUEUED",
        "BUILDING",
        "TESTING",
        "DEPLOYING"
    }

    def get_all(self):

        deployments = self.repository.get_all()

        return ApiResponse.success(
            data=deployments
        )

    def get_by_id(self, deployment_id):

        deployment = self.repository.get_by_id(
            deployment_id
        )

        if not deployment:
            return ApiResponse.error(
                message="Deployment not found",
                status_code=404
            )

        return ApiResponse.success(
            data=deployment
        )

    def create(self, data, user_id):

        application_id = data.get("application_id")
        environment = data.get("environment")
        version = data.get("version")

        if not application_id:
            return ApiResponse.error(
                message="application_id is required",
                status_code=400
            )

        if not environment:
            return ApiResponse.error(
                message="environment is required",
                status_code=400
            )

        if not version:
            return ApiResponse.error(
                message="version is required",
                status_code=400
            )

        environment = environment.lower().strip()
        version = version.strip()

        if environment not in self.ALLOWED_ENVIRONMENTS:
            return ApiResponse.error(
                message=(
                    "Environment must be development, "
                    "staging or production"
                ),
                status_code=400
            )

        # Find latest successful deployment
        # so previous_version can be stored automatically.
        latest = self.repository.get_latest_successful(
            application_id,
            environment
        )

        previous_version = (
            latest["version"]
            if latest
            else None
        )

        # Create deployment in QUEUED state.
        deployment_id = self.repository.create(
            application_id=application_id,
            environment=environment,
            version=version,
            started_by=user_id,
            previous_version=previous_version
        )

        deployment = self.repository.get_by_id(
            deployment_id
        )

        # Notify connected Socket.IO clients.
        emit_deployment_created(
            deployment
        )

        # Start deployment execution in background.
        self.executor.start(
            deployment_id
        )

        return ApiResponse.success(
            data=deployment,
            message="Deployment started successfully"
        )

    def update_status(
        self,
        deployment_id,
        status,
        progress
    ):

        deployment = self.repository.get_by_id(
            deployment_id
        )

        if not deployment:
            return ApiResponse.error(
                message="Deployment not found",
                status_code=404
            )

        allowed_statuses = {
            "QUEUED",
            "BUILDING",
            "TESTING",
            "DEPLOYING",
            "SUCCESS",
            "FAILED",
            "ROLLED_BACK"
        }

        status = status.upper()

        if status not in allowed_statuses:
            return ApiResponse.error(
                message="Invalid deployment status",
                status_code=400
            )

        try:
            progress = int(progress)

        except (TypeError, ValueError):
            return ApiResponse.error(
                message="Progress must be a number",
                status_code=400
            )

        if progress < 0 or progress > 100:
            return ApiResponse.error(
                message="Progress must be between 0 and 100",
                status_code=400
            )

        if status == "SUCCESS":
            progress = 100

        self.repository.update_status(
            deployment_id,
            status,
            progress
        )

        deployment = self.repository.get_by_id(
            deployment_id
        )

        # Emit appropriate real-time event.
        if status == "SUCCESS":

            emit_deployment_completed(
                deployment
            )

        elif status == "FAILED":

            emit_deployment_failed(
                deployment
            )

        else:

            emit_deployment_progress(
                deployment
            )

        return ApiResponse.success(
            data=deployment,
            message="Deployment status updated"
        )

    def update_log(
        self,
        deployment_id,
        log
    ):

        deployment = self.repository.get_by_id(
            deployment_id
        )

        if not deployment:
            return ApiResponse.error(
                message="Deployment not found",
                status_code=404
            )

        if not log:
            return ApiResponse.error(
                message="Deployment log is required",
                status_code=400
            )

        self.repository.update_log(
            deployment_id,
            log
        )

        return ApiResponse.success(
            message="Deployment log updated"
        )

    def mark_failed(
        self,
        deployment_id,
        reason
    ):

        deployment = self.repository.get_by_id(
            deployment_id
        )

        if not deployment:
            return ApiResponse.error(
                message="Deployment not found",
                status_code=404
            )

        if not reason:
            reason = "Deployment failed"

        self.repository.mark_failed(
            deployment_id,
            reason
        )

        deployment = self.repository.get_by_id(
            deployment_id
        )

        emit_deployment_failed(
            deployment
        )

        return ApiResponse.success(
            data=deployment,
            message="Deployment marked as failed"
        )

    def rollback(
        self,
        deployment_id,
        user_id
    ):

        deployment = self.repository.get_by_id(
            deployment_id
        )

        if not deployment:
            return ApiResponse.error(
                message="Deployment not found",
                status_code=404
            )

        previous_version = deployment.get(
            "previous_version"
        )

        if not previous_version:
            return ApiResponse.error(
                message="No previous version available for rollback",
                status_code=400
            )

        rollback_id = self.repository.create(
            application_id=deployment["application_id"],
            environment=deployment["environment"],
            version=previous_version,
            started_by=user_id,
            previous_version=deployment["version"]
        )

        rollback_deployment = (
            self.repository.get_by_id(
                rollback_id
            )
        )

        emit_deployment_rollback(
            rollback_deployment
        )

        return ApiResponse.success(
            data=rollback_deployment,
            message="Rollback deployment created"
        )

    def stats(self):

        stats = self.repository.get_stats()

        total = (
            stats["total_deployments"] or 0
        )

        successful = (
            stats["successful_deployments"] or 0
        )

        failed = (
            stats["failed_deployments"] or 0
        )

        active = (
            stats["active_deployments"] or 0
        )

        success_rate = 0

        if total > 0:
            success_rate = round(
                (successful / total) * 100,
                2
            )

        return ApiResponse.success(
            data={
                "total_deployments": total,
                "successful_deployments": successful,
                "failed_deployments": failed,
                "active_deployments": active,
                "success_rate": success_rate
            }
        )