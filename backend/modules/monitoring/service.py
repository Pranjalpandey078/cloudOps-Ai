import os
import socket
import time

import psutil

from modules.monitoring.repository import MonitoringRepository
from modules.incidents.service import IncidentService
from core.socketio import emit_metric
from shared.response import ApiResponse


class MonitoringService:

    repository = MonitoringRepository()
    incident_service = IncidentService()

    def collect(self):

        server_id = self.repository.get_local_server_id()

        if not server_id:
            raise RuntimeError(
                "No local LINUX server is registered in inventory."
            )

        cpu = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory().percent
        disk = psutil.disk_usage("/").percent

        metrics = {
            "server_id": server_id,
            "cpu": cpu,
            "memory": memory,
            "disk": disk,
            "hostname": socket.gethostname(),
            "uptime_seconds": self._uptime_seconds()
        }

        return self.ingest_internal(metrics)

    def ingest(
        self,
        data,
        agent_key
    ):

        expected_key = os.getenv(
            "MONITORING_AGENT_KEY",
            ""
        )

        if not expected_key:
            return ApiResponse.error(
                "Monitoring agent authentication is not configured.",
                503
            )

        if not agent_key or agent_key != expected_key:
            return ApiResponse.error(
                "Invalid monitoring agent credentials.",
                401
            )

        required = [
            "server_id",
            "cpu",
            "memory",
            "disk"
        ]

        missing = [
            field
            for field in required
            if field not in data
        ]

        if missing:
            return ApiResponse.error(
                "Missing monitoring fields: "
                + ", ".join(missing),
                400
            )

        try:
            metrics = {
                "server_id": int(data["server_id"]),
                "cpu": float(data["cpu"]),
                "memory": float(data["memory"]),
                "disk": float(data["disk"]),
                "hostname": data.get("hostname"),
                "uptime_seconds": data.get("uptime_seconds")
            }

        except (
            TypeError,
            ValueError
        ):

            return ApiResponse.error(
                "Monitoring values must be numeric.",
                400
            )

        for field in (
            "cpu",
            "memory",
            "disk"
        ):

            value = metrics[field]

            if not 0 <= value <= 100:
                return ApiResponse.error(
                    f"{field} must be between 0 and 100.",
                    400
                )

        try:
            self.repository.get_server_context(
                metrics["server_id"]
            )
        except ValueError as error:
            return ApiResponse.error(
                str(error),
                404
            )

        self.ingest_internal(metrics)

        return ApiResponse.success(
            message="Monitoring telemetry accepted.",
            data={
                "server_id": metrics["server_id"],
                "cpu": metrics["cpu"],
                "memory": metrics["memory"],
                "disk": metrics["disk"],
                "hostname": metrics["hostname"]
            }
        )

    def ingest_internal(self, metrics):

        self.repository.save(metrics)

        emit_metric({
            "server_id": metrics["server_id"],
            "cpu": metrics["cpu"],
            "memory": metrics["memory"],
            "disk": metrics["disk"]
        })

        print(
            f"[MONITORING] "
            f"server={metrics['server_id']} "
            f"CPU={metrics['cpu']}% "
            f"MEM={metrics['memory']}% "
            f"DISK={metrics['disk']}%"
        )

        self.evaluate_thresholds(metrics)

        return metrics

    def evaluate_thresholds(self, metrics):

        checks = [
            ("CPU", metrics["cpu"]),
            ("MEMORY", metrics["memory"]),
            ("DISK", metrics["disk"])
        ]

        server_id = metrics["server_id"]

        server_context = self.repository.get_server_context(
            server_id
        )

        organization_id = server_context[
            "organization_id"
        ]

        for metric_name, value in checks:

            rule = self.repository.get_rule(
                metric_name
            )

            if not rule:
                continue

            if value >= rule["critical_threshold"]:

                severity = "CRITICAL"
                breached_threshold = float(
                    rule["critical_threshold"]
                )

            elif value >= rule["warning_threshold"]:

                severity = "HIGH"
                breached_threshold = float(
                    rule["warning_threshold"]
                )

            else:

                self.incident_service.auto_resolve(
                    server_id,
                    metric_name
                )

                continue

            from modules.monitoring.evidence_collector import EvidenceCollector

            evidence = EvidenceCollector.collect()

            evidence_snapshot = {
                "trigger_metric": metric_name,
                "trigger_value": value,
                "threshold": breached_threshold,
                "system": evidence
            }

            self.incident_service.create(
                {
                    "organization_id": organization_id,
                    "server_id": server_id,
                    "title":
                        f"{metric_name} Threshold Exceeded",
                    "description":
                        f"{metric_name} reached {value}%",
                    "severity": severity,
                    "source": "Monitoring Agent",
                    "metric_name": metric_name,
                    "metric_value": value,
                    "threshold_value":
                        breached_threshold
                },
                evidence=evidence_snapshot
            )

            print(
                f"[EVIDENCE] Snapshot collected "
                f"for {metric_name}"
            )

    def latest(self):
        return self.repository.latest_metrics()

    def overview(self):

        data = self.repository.overview()

        return ApiResponse.success(
            data=data
        )

    @staticmethod
    def _uptime_seconds():

        try:
            return int(
                time.time() -
                psutil.boot_time()
            )
        except Exception:
            return None
