from flask import request, g

from modules.deployments.service import DeploymentService


class DeploymentController:

    service = DeploymentService()

    def get_all(self):
        return self.service.get_all()

    def get_by_id(self, deployment_id):
        return self.service.get_by_id(
            deployment_id
        )

    def create(self):
        data = request.get_json(silent=True) or {}

        return self.service.create(
            data=data,
            user_id=g.user_id
        )

    def update_status(self, deployment_id):
        data = request.get_json(silent=True) or {}

        status = data.get("status")
        progress = data.get("progress")

        if not status:
            return {
                "success": False,
                "message": "status is required"
            }, 400

        if progress is None:
            return {
                "success": False,
                "message": "progress is required"
            }, 400

        return self.service.update_status(
            deployment_id=deployment_id,
            status=status,
            progress=progress
        )

    def update_log(self, deployment_id):
        data = request.get_json(silent=True) or {}

        return self.service.update_log(
            deployment_id=deployment_id,
            log=data.get("log")
        )

    def mark_failed(self, deployment_id):
        data = request.get_json(silent=True) or {}

        return self.service.mark_failed(
            deployment_id=deployment_id,
            reason=data.get("reason")
        )

    def rollback(self, deployment_id):
        return self.service.rollback(
            deployment_id=deployment_id,
            user_id=g.user_id
        )

    def stats(self):
        return self.service.stats()