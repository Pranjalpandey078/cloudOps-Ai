from modules.ai.service import AIService
from modules.incidents.repository import IncidentRepository
from modules.notifications.service import NotificationService
from shared.response import ApiResponse
from core.socketio import emit_incident


class IncidentService:

    repository = IncidentRepository()
    notification_service = NotificationService()
    ai_service = AIService()

    
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

        if exists:
            return ApiResponse.success(
                message="Incident already exists",
                data=exists
            )

        incident_id = self.repository.create_incident(data)

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

        # Generate AI analysis
        analysis = self.ai_service.analyze_incident(
            incident
        )

        # Generate AI remediation
        remediation = self.ai_service.generate_remediation(
            incident
        )

        incident["analysis"] = analysis
        incident["remediation"] = remediation

        ai_result = {
            "analysis": analysis,
            "remediation": remediation
        }

        self.repository.save_ai_analysis(
            incident_id,
            ai_result
        )

        # Emit realtime socket event
        emit_incident({
            "id": incident_id,
            "title": data["title"],
            "severity": data["severity"],
            "metric": data["metric_name"]
        })

        # Send email only for CRITICAL incidents
        if data["severity"] == "CRITICAL":
            try:
                self.notification_service.send_incident_email(
                    incident
                )
            except Exception as e:
                print(f"Email notification failed: {e}")

        return ApiResponse.success(
            message="Incident created successfully",
            data={
                "incident_id": incident_id,
                "analysis": analysis,
                "remediation": remediation
            }
        )

    def latest(self):

        data = self.repository.latest_incidents()

        return ApiResponse.success(
            data=data
        )

    def resolve(self, incident_id):

        self.repository.resolve_incident(
            incident_id
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
        