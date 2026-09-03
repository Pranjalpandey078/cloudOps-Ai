from concurrent.futures import ThreadPoolExecutor
import time

from modules.ai.service import AIService
from modules.incidents.repository import IncidentRepository
from modules.timeline.service import TimelineService
from modules.monitoring.evidence_repository import EvidenceRepository


class IncidentAIWorker:

    MAX_RETRIES = 3
    RETRY_DELAY_SECONDS = 3

    executor = ThreadPoolExecutor(
        max_workers=2,
        thread_name_prefix="incident-ai"
    )

    @classmethod
    def submit(cls, incident):

        incident_copy = dict(incident)


        TimelineService().add_event(
            incident_id=incident_copy["id"],
            event_type="AI_QUEUED",
            title="AI Analysis Queued",
            description=(
                "Incident queued for asynchronous "
                "AI analysis."
            )
        )
        cls.executor.submit(
            cls._process,
            incident_copy
        )

        print(
            f"AI analysis queued for Incident "
            f"#{incident_copy['id']}"
        )


    @classmethod
    def reprocess(cls, incident):

        incident_copy = dict(incident)
        incident_id = incident_copy["id"]

        repository = IncidentRepository()

        repository.update_ai_retry_count(
            incident_id,
            0
        )

        repository.update_ai_status(
            incident_id,
            "PENDING"
        )

        TimelineService().add_event(
            incident_id=incident_id,
            event_type="AI_RETRY",
            title="AI Analysis Retried",
            description=(
                "Manual AI reprocessing requested."
            )
        )


        cls.executor.submit(
            cls._process,
            incident_copy
        )

        print(
            f"AI reprocessing queued for Incident "
            f"#{incident_id}"
        )


    @staticmethod
    def _process(incident):

        incident_id = incident["id"]

        ai_service = AIService()
        repository = IncidentRepository()
        evidence_repository = EvidenceRepository()

        evidence = evidence_repository.get_for_incident(
            incident_id
        )

        incident = dict(incident)
        incident["evidence"] = evidence

        print(
            f"Loaded {len(evidence)} evidence record(s) "
            f"for Incident #{incident_id}"
        )

        repository.update_ai_status(
            incident_id,
            "PROCESSING"
        )

        TimelineService().add_event(
            incident_id=incident_id,
            event_type="AI_PROCESSING",
            title="AI Analysis Started",
            description=(
                "AI worker started processing "
                "the incident."
            )
        )

        for attempt in range(
            1,
            IncidentAIWorker.MAX_RETRIES + 1
        ):

            try:

                print(
                    f"AI attempt {attempt}/"
                    f"{IncidentAIWorker.MAX_RETRIES} "
                    f"for Incident #{incident_id}"
                )

                analysis_result = (
                    ai_service.analyze_incident(
                        incident
                    )
                )

                print(
                    f"AI remediation started for Incident #{incident_id}"
                )
                remediation_result = (
                    ai_service.generate_remediation(
                        incident
                    )
                )
                print(
                    f"AI remediation completed for Incident #{incident_id}"
                )

                analysis = (
                    analysis_result.get("analysis")
                    if isinstance(
                        analysis_result,
                        dict
                    )
                    else analysis_result
                )

                remediation = (
                    remediation_result.get(
                        "remediation"
                    )
                    if isinstance(
                        remediation_result,
                        dict
                    )
                    else remediation_result
                )

                repository.save_ai_analysis(
                    incident_id,
                    {
                        "analysis": analysis,
                        "remediation": remediation
                    }
                )

                repository.update_ai_retry_count(
                    incident_id,
                    attempt - 1
                )

                repository.update_ai_status(
                    incident_id,
                    "COMPLETED"
                )

                TimelineService().add_event(
                    incident_id=incident_id,
                    event_type="AI_COMPLETED",
                    title="AI Analysis Completed",
                    description=(
                        "Root cause analysis and "
                        "remediation were generated "
                        "successfully."
                    )
                )

                print(
                    f"AI analysis completed for "
                    f"Incident #{incident_id} "
                    f"on attempt {attempt}"
                )

                return

            except Exception as error:

                retry_count = attempt

                repository.update_ai_retry_count(
                    incident_id,
                    retry_count
                )

                print(
                    f"AI attempt {attempt} failed "
                    f"for Incident #{incident_id}: "
                    f"{error}"
                )

                if (
                    attempt
                    < IncidentAIWorker.MAX_RETRIES
                ):

                    print(
                        f"Retrying Incident "
                        f"#{incident_id} in "
                        f"{IncidentAIWorker.RETRY_DELAY_SECONDS} "
                        f"seconds..."
                    )

                    time.sleep(
                        IncidentAIWorker
                        .RETRY_DELAY_SECONDS
                    )

                    continue

                repository.update_ai_status(
                    incident_id,
                    "FAILED",
                    str(error)
                )

                TimelineService().add_event(
                    incident_id=incident_id,
                    event_type="AI_FAILED",
                    title="AI Analysis Failed",
                    description=(
                        "AI processing failed after "
                        f"{attempt} attempts: {error}"
                    )
                )

                print(
                    f"AI processing permanently failed "
                    f"for Incident #{incident_id} "
                    f"after {attempt} attempts"
                )

                return

