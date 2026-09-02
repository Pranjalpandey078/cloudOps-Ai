from shared.response import ApiResponse

from modules.remediation.repository import RemediationRepository
from modules.remediation.safety import RemediationSafetyValidator
from modules.remediation.executor import RemediationExecutor
from modules.remediation.verification_repository import RemediationVerificationRepository
from modules.remediation.verification_service import RemediationVerificationService
from modules.incidents.repository import IncidentRepository
from modules.timeline.service import TimelineService
from modules.audit.repository import AuditRepository
from modules.correlation.repository import CorrelationRepository


class RemediationService:

    executor = RemediationExecutor()

    repository = RemediationRepository()
    validator = RemediationSafetyValidator()
    verification_repository = RemediationVerificationRepository()
    verification_service = RemediationVerificationService()
    incident_repository = IncidentRepository()
    timeline_service = TimelineService()
    audit_repository = AuditRepository()
    correlation_repository = CorrelationRepository()


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

    def get_verification(self, execution_id):

        execution = self.repository.get_by_id(
            execution_id
        )

        if not execution:
            return ApiResponse.error(
                "Remediation execution not found",
                404
            )

        verification = (
            self.verification_repository
            .get_latest_for_execution(
                execution_id
            )
        )

        if not verification:
            return ApiResponse.success(
                message="No verification has been recorded yet.",
                data=None
            )

        return ApiResponse.success(
            data=verification
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

        # Verification only follows a successful execution.
        if final_status == "SUCCESS":

            incident = self.repository.get_incident(
                execution["incident_id"]
            )

            if incident and incident.get("metric_name"):

                verification_id = (
                    self.verification_repository.create(
                        execution_id=execution_id,
                        incident_id=incident["id"],
                        server_id=incident.get("server_id"),
                        metric_name=incident["metric_name"],
                        before_value=incident.get(
                            "metric_value"
                        ),
                        threshold_value=incident.get(
                            "threshold_value"
                        )
                    )
                )

                verification = (
                    self.verification_service.verify(
                        execution,
                        incident
                    )
                )

                self.verification_repository.complete(
                    verification_id=verification_id,
                    status=verification["status"],
                    after_value=verification["after_value"],
                    evidence_data=verification["evidence"],
                    message=verification["message"]
                )

                # Resolve only after three consecutive
                # healthy samples.
                if verification["status"] == "RECOVERED":

                    incident_id = incident["id"]

                    previous_status = incident.get(
                        "status"
                    )

                    self.incident_repository.resolve_incident(
                        incident_id
                    )

                    group_id = (
                        self.correlation_repository
                        .get_group_by_incident(
                            incident_id
                        )
                    )

                    if group_id:
                        self.correlation_repository.refresh_group_status(
                            group_id
                        )

                    self.timeline_service.add_event(
                        incident_id=incident_id,
                        event_type="RECOVERY_VERIFIED",
                        title="Recovery Verified",
                        description=(
                            f"{incident['metric_name']} remained "
                            f"below the configured threshold for "
                            f"three consecutive samples."
                        )
                    )

                    self.audit_repository.create(
                        user_id=execution.get("user_id"),
                        module_name="incidents",
                        action="INCIDENT_AUTO_RESOLVED",
                        resource_id=incident_id,
                        old_value={
                            "status": previous_status
                        },
                        new_value={
                            "status": "RESOLVED",
                            "verification_id": verification_id,
                            "metric_name": incident[
                                "metric_name"
                            ],
                            "before_value": incident.get(
                                "metric_value"
                            ),
                            "after_value": verification[
                                "after_value"
                            ],
                            "threshold_value": incident.get(
                                "threshold_value"
                            )
                        },
                        ip_address=None
                    )

                    print(
                        f"[RECOVERY] Incident #{incident_id} "
                        f"automatically resolved."
                    )

                updated["verification"] = {
                    "id": verification_id,
                    "status": verification["status"],
                    "before_value": incident.get(
                        "metric_value"
                    ),
                    "after_value": verification[
                        "after_value"
                    ],
                    "threshold_value": incident.get(
                        "threshold_value"
                    ),
                    "message": verification["message"]
                }

        return ApiResponse.success(
            message=(
                "Remediation executed successfully"
                if final_status == "SUCCESS"
                else "Remediation execution failed"
            ),
            data=updated
        )

