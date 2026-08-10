from modules.ai.service import AIService
from modules.incidents.repository import IncidentRepository
from modules.notifications.service import NotificationService
from shared.response import ApiResponse
from core.socketio import emit_incident
from workers.ai.incident_ai_worker import IncidentAIWorker
from modules.timeline.service import TimelineService
from modules.correlation.repository import CorrelationRepository


class IncidentService:

    repository = IncidentRepository()
    notification_service = NotificationService()
    ai_service = AIService()
    correlation_repository = CorrelationRepository()

    
    def recent(self):

        data = self.repository.recent()

        return ApiResponse.success(
        data=data
    )
    def chat(self, incident_id, question):

        incident = self.repository.get_incident(
            incident_id
        )

        if not incident:
            return ApiResponse.error(
                "Incident not found",
                404
            )

        answer = self.ai_service.chat_with_incident(
            incident,
            question
        )

        if isinstance(answer, dict):
            analysis = answer.get("analysis")
            remediation = answer.get("remediation")
            content = answer.get("answer") if "answer" in answer else answer
        else:
            analysis = None
            remediation = None
            content = answer

        return ApiResponse.success(
            message="Chat completed successfully",
            data={
                "incident_id": incident_id,
                "response": content,
                "analysis": analysis,
                "remediation": remediation
            }
        )

    def analyze(self, incident):

        if not incident:
            return ApiResponse.error(
                "Incident data is required",
                400
            )

        try:
            analysis_result = self.ai_service.analyze_incident(
                incident
            )

            remediation_result = self.ai_service.generate_remediation(
                incident
            )

            analysis = (
                analysis_result.get("analysis")
                if isinstance(analysis_result, dict)
                else analysis_result
            )

            remediation = (
                remediation_result.get("remediation")
                if isinstance(remediation_result, dict)
                else remediation_result
            )

            incident_id = incident.get("id")

            if incident_id:
                self.repository.save_ai_analysis(
                    incident_id,
                    {
                        "analysis": analysis,
                        "remediation": remediation
                    }
                )

            return ApiResponse.success(
                message="AI incident analysis completed",
                data={
                    "analysis": analysis,
                    "remediation": remediation
                }
            )

        except Exception as error:

            print(
                f"AI incident analysis failed: {error}"
            )

            return ApiResponse.error(
                "AI incident analysis failed",
                500
            )


    def create(self, data):

        exists = self.repository.get_open_incident(
            data["server_id"],
            data["metric_name"]
        )

        # =========================================================
        # EXISTING OPEN INCIDENT
        # =========================================================

        if exists:

            previous_severity = exists["severity"]

            incident = self.repository.correlate_incident(
                exists["id"],
                data
            )

            print(
                f"Correlated Incident #{incident['id']} | "
                f"{data['metric_name']}={data['metric_value']} | "
                f"Occurrences={incident['occurrence_count']} | "
                f"Severity={incident['severity']}"
            )

            # Send realtime update
            emit_incident({
                "id": incident["id"],
                "server_id": incident["server_id"],
                "title": incident["title"],
                "severity": incident["severity"],
                "metric": incident["metric_name"],
                "metric_value": float(incident["metric_value"]),
                "occurrence_count": incident["occurrence_count"],
                "correlated": True
            })

            # Notify only when severity escalates to CRITICAL
            if (
                previous_severity != "CRITICAL"
                and incident["severity"] == "CRITICAL"
            ):
                try:
                    self.notification_service.send_incident_email(
                        incident
                    )
                except Exception as error:
                    print(
                        f"Escalation email failed: {error}"
                    )

            # -----------------------------------------------------
            # Check whether this incident already belongs to a group
            # -----------------------------------------------------

            group_id = (
                self.correlation_repository.find_group_by_incident(
                    incident["id"]
                )
            )

            if group_id:

                print(
                    f"[CORRELATION] Existing Incident "
                    f"{incident['id']} already belongs to "
                    f"Group {group_id}"
                )

            else:

                # Find a suitable existing group
                group_id = (
                    self.correlation_repository.find_group(
                        data["organization_id"],
                        data["server_id"],
                        data["metric_name"],
                        incident["severity"]
                    )
                )

                # Create a group only when none exists
                if not group_id:

                    group_id = (
                        self.correlation_repository.create_group(
                            data["organization_id"],
                            data["title"],
                            incident["severity"],
                            data["metric_name"],
                            90
                        )
                    )

                    print(
                        f"[CORRELATION] Created Group: {group_id}"
                    )

                self.correlation_repository.add_incident(
                    group_id,
                    incident["id"]
                )

            self.correlation_repository.increase_confidence(
                group_id
            )

            return ApiResponse.success(
                message="Incident correlated successfully",
                data=incident
            )

        # =========================================================
        # NEW INCIDENT
        # =========================================================

        incident_id = self.repository.create_incident(data)

        confidence_score = 100

        if data["severity"] == "HIGH":
            confidence_score = 90

        elif data["severity"] == "MEDIUM":
            confidence_score = 80

        elif data["severity"] == "LOW":
            confidence_score = 70

        # Find an existing compatible group
        group_id = (
            self.correlation_repository.find_group(
                data["organization_id"],
                data["server_id"],
                data["metric_name"],
                data["severity"]
            )
        )

        # Create a group if none exists
        if not group_id:

            group_id = (
                self.correlation_repository.create_group(
                    data["organization_id"],
                    data["title"],
                    data["severity"],
                    data["metric_name"],
                    confidence_score
                )
            )

            print(
                f"[CORRELATION] Created Group: {group_id}"
            )

        # Attach this incident exactly once
        self.correlation_repository.add_incident(
            group_id,
            incident_id
        )

        self.correlation_repository.increase_confidence(
            group_id
        )

        incident = {
            "id": incident_id,
            "server_id": data["server_id"],
            "title": data["title"],
            "description": data["description"],
            "severity": data["severity"],
            "metric_name": data["metric_name"],
            "metric_value": data["metric_value"],
            "threshold_value": data["threshold_value"]
        }

        # Queue AI processing
        IncidentAIWorker.submit(incident)

        # Timeline event
        TimelineService().add_event(
            incident_id=incident_id,
            event_type="INCIDENT_CREATED",
            title="Incident Created",
            description=(
                "Incident automatically created "
                "by the monitoring engine."
            )
        )

        # Realtime socket event
        emit_incident({
            "id": incident_id,
            "title": data["title"],
            "severity": data["severity"],
            "metric": data["metric_name"]
        })

        # Email only for CRITICAL incidents
        if data["severity"] == "CRITICAL":
            try:
                self.notification_service.send_incident_email(
                    incident
                )
            except Exception as error:
                print(
                    f"Email notification failed: {error}"
                )

        return ApiResponse.success(
            message="Incident created successfully",
            data={
                "incident_id": incident_id,
                "ai_status": "PENDING"
            }
        )


    def get_related_incidents(
        self,
        incident_id
    ):

        incidents = (
            self.repository.get_related_incidents(
                incident_id
            )
        )

        return ApiResponse.success(
            data=incidents
        )



    def retry_ai(self, incident_id):

        incident = self.repository.get_by_id(
            incident_id
        )

        if not incident:

            return ApiResponse.error(
                "Incident not found",
                404
            )

        if incident["ai_status"] == "PROCESSING":

            return ApiResponse.error(
                "AI analysis is already processing",
                409
            )

        if incident["ai_status"] == "PENDING":

            return ApiResponse.error(
                "AI analysis is already pending",
                409
            )

        IncidentAIWorker.reprocess(
            incident
        )

        return ApiResponse.success(
            message="AI reprocessing queued successfully",
            data={
                "incident_id": incident_id,
                "ai_status": "PENDING"
            },
            status=202
        )


    def latest(self):

        data = self.repository.latest_incidents()

        return ApiResponse.success(
            data=data
        )

    def resolve(self, incident_id):

        group_id = self.correlation_repository.get_group_by_incident(
            incident_id
        )

        self.repository.resolve_incident(
            incident_id
        )

        if group_id:

            self.correlation_repository.refresh_group_status(
                group_id
            )

        return ApiResponse.success(
            message="Incident resolved successfully"
        )

    def auto_resolve(self, server_id, metric_name):

        incident = self.repository.get_open_by_metric(
            server_id,
            metric_name
        )

        if not incident:
            return

        self.repository.resolve_incident(
            incident["id"]
        )

        print(
            f"Resolved Incident #{incident['id']}"
        )
        
