import psutil

from modules.monitoring.repository import MonitoringRepository
from modules.monitoring.providers.aws_monitor import AWSMonitoringProvider
from modules.incidents.service import IncidentService
from core.socketio import emit_metric

from shared.response import ApiResponse
class MonitoringService:

    repository = MonitoringRepository()
    incident_service = IncidentService()

    def collect(self):

        cpu = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory().percent
        disk = psutil.disk_usage("/").percent

        local_server = (
            self.repository.get_local_discovered_server()
        )

        if not local_server:
            raise RuntimeError(
                "No LINUX-discovered server found."
            )

        metrics = {
            "server_id": local_server["id"],
            "organization_id": local_server["organization_id"],
            "cpu": cpu,
            "memory": memory,
            "disk": disk
        }

        # Save metrics to database
        self.repository.save(metrics)

        # Emit metrics to Socket.IO clients
        emit_metric({
            "server_id": metrics["server_id"],
            "cpu": metrics["cpu"],
            "memory": metrics["memory"],
            "disk": metrics["disk"]
        })

        print(
            f"CPU={cpu}% "
            f"MEM={memory}% "
            f"DISK={disk}%"
        )

        self.evaluate_thresholds(metrics)

    def collect_aws(self):

        provider = AWSMonitoringProvider()

        servers = self.repository.get_aws_servers()

        results = []

        for server in servers:

            instance_id = server[
                "external_resource_id"
            ]

            cloudwatch = (
                provider.collect_instance_metrics(
                    instance_id
                )
            )

            metrics = {
                "server_id": server["id"],
                "cpu": cloudwatch["cpu"],

                # Not available from standard EC2
                # CloudWatch metrics without the
                # CloudWatch Agent.
                "memory": None,
                "disk": None
            }

            self.repository.save(metrics)

            emit_metric({
                "server_id": server["id"],
                "cpu": metrics["cpu"],
                "memory": None,
                "disk": None
            })

            results.append({
                "server_id": server["id"],
                "hostname": server["hostname"],
                "instance_id": instance_id,
                "cpu": cloudwatch["cpu"],
                "network_in": (
                    cloudwatch["network_in"]
                ),
                "network_out": (
                    cloudwatch["network_out"]
                )
            })

        return results


    def evaluate_thresholds(self, metrics):

        checks = [
            ("CPU", metrics["cpu"]),
            ("MEMORY", metrics["memory"]),
            ("DISK", metrics["disk"])
        ]

        for metric_name, value in checks:

            rule = self.repository.get_rule(metric_name)

            if not rule:
                continue

            # Validate monitoring rule before evaluating it.
            warning_threshold = float(
                rule["warning_threshold"]
            )

            critical_threshold = float(
                rule["critical_threshold"]
            )

            if (
                warning_threshold < 0
                or critical_threshold > 100
                or warning_threshold >= critical_threshold
            ):
                print(
                    f"INVALID MONITORING RULE: {metric_name} | "
                    f"warning={warning_threshold} | "
                    f"critical={critical_threshold}"
                )
                continue

            if value is None:
                continue

            if value >= critical_threshold:

                severity = "CRITICAL"

            elif value >= warning_threshold:

                severity = "HIGH"

            else:

                self.incident_service.auto_resolve(
                    metrics["server_id"],
                    metric_name
                )

                continue

            self.incident_service.create({

                "organization_id": metrics["organization_id"],

                "server_id": metrics["server_id"],

                "title": f"{metric_name} Threshold Exceeded",

                "description": f"{metric_name} reached {value}%",

                "severity": severity,

                "source": "Monitoring Engine",

                "metric_name": metric_name,

                "metric_value": value,

                "threshold_value": (
                    critical_threshold
                    if severity == "CRITICAL"
                    else warning_threshold
                )

            })

    def latest(self):

        return self.repository.latest_metrics()
    def overview(self):

        data = self.repository.overview()

        return ApiResponse.success(
            data=data
    )