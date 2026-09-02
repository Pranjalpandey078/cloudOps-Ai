from modules.monitoring.evidence_collector import EvidenceCollector
from modules.remediation.verification_repository import (
    RemediationVerificationRepository
)


class RemediationVerificationService:

    repository = RemediationVerificationRepository()

    def verify(
        self,
        execution,
        incident
    ):

        metric_name = (
            incident.get("metric_name") or ""
        ).upper()

        threshold = incident.get(
            "threshold_value"
        )

        if threshold is None:
            return {
                "status": "INCONCLUSIVE",
                "after_value": None,
                "message":
                    "Incident threshold is unavailable.",
                "evidence": [],
                "samples": []
            }

        samples = []
        evidence_snapshots = []

        for sample_number in range(3):

            evidence = EvidenceCollector.collect()

            current_value = self._current_metric(
                metric_name,
                evidence
            )

            if current_value is None:
                return {
                    "status": "INCONCLUSIVE",
                    "after_value": None,
                    "message":
                        "Current metric value could not be collected.",
                    "evidence": evidence_snapshots,
                    "samples": samples
                }

            current_value = float(
                current_value
            )

            samples.append(
                current_value
            )

            evidence_snapshots.append({
                "sample": sample_number + 1,
                "value": current_value,
                "evidence": evidence
            })

            # All three samples must remain below
            # the incident threshold.
            if current_value >= float(threshold):

                return {
                    "status": "FAILED",
                    "after_value": current_value,
                    "message":
                        f"{metric_name} did not remain below "
                        f"the configured threshold across "
                        f"three consecutive samples.",
                    "evidence": evidence_snapshots,
                    "samples": samples
                }

            if sample_number < 2:

                import time
                time.sleep(2)

        return {
            "status": "RECOVERED",
            "after_value": samples[-1],
            "message":
                f"{metric_name} remained below the configured "
                f"threshold for three consecutive samples.",
            "evidence": evidence_snapshots,
            "samples": samples
        }


    @staticmethod
    def _current_metric(
        metric_name,
        evidence
    ):

        mapping = {
            "CPU": "cpu_percent",
            "MEMORY": "memory_percent",
            "DISK": "disk_percent"
        }

        field = mapping.get(
            metric_name
        )

        if not field:
            return None

        return evidence.get(field)
