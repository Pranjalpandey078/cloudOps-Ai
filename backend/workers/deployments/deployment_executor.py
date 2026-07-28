import time
import threading

from modules.deployments.repository import DeploymentRepository
from core.socketio import (
    emit_deployment_progress,
    emit_deployment_completed,
    emit_deployment_failed
)


class DeploymentExecutor:

    repository = DeploymentRepository()

    PIPELINE = [
        ("BUILDING", 25, "Building application..."),
        ("TESTING", 50, "Running automated tests..."),
        ("DEPLOYING", 80, "Deploying application..."),
        ("SUCCESS", 100, "Deployment completed successfully.")
    ]

    def start(self, deployment_id):
        """
        Run deployment pipeline in a background thread.
        """

        thread = threading.Thread(
            target=self._execute,
            args=(deployment_id,),
            daemon=True
        )

        thread.start()

    def _execute(self, deployment_id):

        deployment = self.repository.get_by_id(
            deployment_id
        )

        if not deployment:
            return

        logs = []

        try:

            for status, progress, message in self.PIPELINE:

                logs.append(
                    f"[{status}] {message}"
                )

                self.repository.update_log(
                    deployment_id,
                    "\n".join(logs)
                )

                self.repository.update_status(
                    deployment_id,
                    status,
                    progress
                )

                deployment = self.repository.get_by_id(
                    deployment_id
                )

                if status == "SUCCESS":

                    emit_deployment_completed(
                        deployment
                    )

                else:

                    emit_deployment_progress(
                        deployment
                    )

                # Temporary pipeline simulation
                time.sleep(2)

        except Exception as error:

            reason = str(error)

            logs.append(
                f"[FAILED] {reason}"
            )

            self.repository.update_log(
                deployment_id,
                "\n".join(logs)
            )

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