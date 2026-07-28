from shared.response import ApiResponse

from modules.remediation.repository import RemediationRepository
from modules.remediation.safety import RemediationSafetyValidator
from modules.remediation.executor import RemediationExecutor


class RemediationService:

    executor = RemediationExecutor()

    repository = RemediationRepository()
    validator = RemediationSafetyValidator()


    def request_execution(self, data, user_id):

        required = [
            "incident_id",
            "execution_type",
            "command"
        ]

        missing = [
            field
            for field in required
            if data.get(field) in (None, "")
        ]

        if missing:
            return ApiResponse.error(
                f"Missing required fields: {', '.join(missing)}",
                400
            )

        incident = self.repository.get_incident(
            data["incident_id"]
        )

        if not incident:
            return ApiResponse.error(
                "Incident not found",
                404
            )

        execution_type = str(
            data["execution_type"]
        ).upper().strip()

        command = str(
            data["command"]
        ).strip()

        validation = self.validator.validate(
            execution_type,
            command
        )

        status = (
            "PENDING"
            if validation["allowed"]
            else "BLOCKED"
        )

        execution_id = self.repository.create_execution(
            incident_id=incident["id"],
            server_id=incident.get("server_id"),
            user_id=user_id,
            execution_type=execution_type,
            command_text=command,
            risk_level=validation["risk_level"],
            execution_status=status
        )

        execution = self.repository.get_execution(
            execution_id
        )

        return ApiResponse.success(
            message=(
                "Remediation request created."
                if validation["allowed"]
                else "Command blocked by safety policy."
            ),
            data={
                "execution": execution,
                "validation": validation
            },
            status=201
        )


    def get_execution(self, execution_id):

        execution = self.repository.get_execution(
            execution_id
        )

        if not execution:
            return ApiResponse.error(
                "Remediation execution not found",
                404
            )

        return ApiResponse.success(
            data=execution
        )


    def incident_history(self, incident_id):

        incident = self.repository.get_incident(
            incident_id
        )

        if not incident:
            return ApiResponse.error(
                "Incident not found",
                404
            )

        executions = self.repository.list_for_incident(
            incident_id
        )

        return ApiResponse.success(
            data=executions
        )


    def approve(self, execution_id):

        execution = self.repository.get_execution(
            execution_id
        )

        if not execution:
            return ApiResponse.error(
                "Remediation execution not found",
                404
            )

        if execution["execution_status"] == "BLOCKED":
            return ApiResponse.error(
                "Blocked remediation cannot be approved",
                403
            )

        if execution["execution_status"] != "PENDING":
            return ApiResponse.error(
                "Only pending remediation can be approved",
                409
            )

        # Revalidate before approval.
        validation = self.validator.validate(
            execution["execution_type"],
            execution["command_text"]
        )

        if not validation["allowed"]:

            self.repository.update_status(
                execution_id,
                "BLOCKED"
            )

            return ApiResponse.error(
                "Command failed safety revalidation",
                403
            )

        self.repository.update_status(
            execution_id,
            "APPROVED"
        )

        execution = self.repository.get_execution(
            execution_id
        )

        return ApiResponse.success(
            message="Remediation approved successfully",
            data=execution
        )


    def reject(self, execution_id):

        execution = self.repository.get_execution(
            execution_id
        )

        if not execution:
            return ApiResponse.error(
                "Remediation execution not found",
                404
            )

        if execution["execution_status"] != "PENDING":
            return ApiResponse.error(
                "Only pending remediation can be rejected",
                409
            )

        self.repository.update_status(
            execution_id,
            "REJECTED"
        )

        execution = self.repository.get_execution(
            execution_id
        )

        return ApiResponse.success(
            message="Remediation rejected",
            data=execution
        )

    def execute(self, execution_id):

        execution = self.repository.get_by_id(
            execution_id
        )

        if not execution:
            return ApiResponse.error(
                "Remediation execution not found",
                404
            )


        if execution["execution_status"] != "APPROVED":
            return ApiResponse.error(
                "Only approved remediation can be executed",
                400
            )


        # Revalidate immediately before execution.
        validation = self.validator.validate(
            execution["execution_type"],
            execution["command_text"]
        )

        if not validation["allowed"]:
            return ApiResponse.error(
                "Command failed execution-time safety validation",
                400
            )


        # Atomic state transition:
        # APPROVED -> RUNNING
        changed = self.repository.mark_running(
            execution_id
        )

        if not changed:
            return ApiResponse.error(
                "Remediation is no longer available for execution",
                409
            )


        result = self.executor.execute(
            execution["execution_type"],
            execution["command_text"]
        )


        if not result.get("allowed"):

            self.repository.complete_execution(
                execution_id,
                "FAILED",
                None,
                "",
                result.get(
                    "reason",
                    "Execution blocked by executor policy."
                )
            )

            updated = self.repository.get_by_id(
                execution_id
            )

            return ApiResponse.error(
                result.get(
                    "reason",
                    "Execution blocked by executor policy."
                ),
                400
            )


        final_status = (
            "SUCCESS"
            if result.get("success")
            else "FAILED"
        )


        self.repository.complete_execution(
            execution_id,
            final_status,
            result.get("exit_code"),
            result.get("stdout", ""),
            result.get("stderr", "")
        )


        updated = self.repository.get_by_id(
            execution_id
        )


        return ApiResponse.success(
            message=(
                "Remediation executed successfully"
                if final_status == "SUCCESS"
                else "Remediation execution failed"
            ),
            data=updated
        )

