import json

from modules.ai.factory import AIProviderFactory


class AIService:


    def chat(self, question):

        prompt = f"""
You are CloudOps AI, a Senior Cloud DevOps Engineer and Site Reliability Engineer.

Answer the user's question using only the information explicitly provided
in the user's question.

STRICT GROUNDING RULES:

1. Do not invent servers, applications, services, databases, containers,
   Kubernetes resources, cloud architecture, monitoring products, logs,
   incidents, vulnerabilities, outages, configuration changes, or historical
   events that were not provided.

2. Do not assume the user uses a specific monitoring platform, operating
   system, cloud provider, orchestration platform, database, or application.

3. If important information is missing, clearly say that the information is
   not available and explain what evidence would be useful.

4. Clearly distinguish confirmed facts from possibilities or hypotheses.

5. Never present a hypothesis as a confirmed root cause.

6. Prefer safe, read-only diagnostic checks before remediation.

7. Do not claim that any remediation has already been performed.

8. When giving commands, label the platform when necessary and prefer
   read-only diagnostic commands.

9. Keep recommendations practical and directly related to the question.

10. Do not present a platform-specific command as a universal command.
    When the operating system is unknown, either:
    a. provide platform-labeled examples, or
    b. describe the diagnostic action without pretending one command works
       everywhere.

11. Commands must actually perform the diagnostic action described.
    Do not use commands such as "ps -ef | grep cpu" as a generic way to
    identify CPU-intensive processes.

12. For Linux CPU investigation, acceptable examples include:
    "top"
    "ps aux --sort=-%cpu"

13. For macOS CPU investigation, acceptable examples include:
    "top -l 1 -o cpu"

14. Do not add shell pipes, redirection, chaining operators, or destructive
    commands unless they are explicitly required and clearly safe.


10. Do not mention a specific product or technology unless:
    a. the user explicitly mentioned it, or
    b. it is necessary as a clearly labeled example.

11. Do not fabricate metrics, percentages, hostnames, service names,
    error messages, or system state.

USER QUESTION:

{question}

Provide a concise, evidence-grounded DevOps answer.
"""

        return self.provider.generate(prompt)

    def __init__(self):
        self.provider = AIProviderFactory.get_provider()

    @staticmethod
    def _fallback_incident_analysis(incident):
        """
        Deterministic fallback used when the local LLM returns malformed,
        unsafe, or contract-breaking incident analysis.

        The fallback is intentionally evidence-grounded and never invents
        an underlying root cause.
        """
        severity = str(incident.get("severity", "UNKNOWN")).strip()
        metric_name = str(
            incident.get("metric_name", "metric")
        ).strip()

        return {
            "analysis": {
                "root_cause": (
                    "Root cause cannot be determined from "
                    "the available incident evidence."
                ),
                "impact": (
                    f"The {metric_name} condition triggered the incident "
                    "threshold. Specific service impact is not confirmed "
                    "by the available evidence."
                ),
                "severity": severity,
                "severity_assessment": (
                    f"The incident severity is {severity}. The supplied "
                    f"{metric_name} condition triggered the incident; "
                    "no additional evidence supports changing that severity."
                ),
                "condition_confidence": 1.0,
                "root_cause_confidence": 0.0,
                "recommended_actions": [
                    f"Verify the current {metric_name} condition on the affected server.",
                    f"Collect diagnostic evidence related to the {metric_name} condition.",
                    "Identify the responsible resource or process before applying remediation."
                ],
                "prevention_steps": [
                    f"Maintain monitoring of {metric_name} against its configured threshold.",
                    "Review alert thresholds using observed operating patterns.",
                    "Document and automate an evidence-based response for recurring threshold breaches."
                ]
            }
        }

    def analyze_incident(self, incident):
        try:
            raw_analysis = self.provider.analyze_incident(
                incident
            )

            if isinstance(raw_analysis, dict):
                analysis = raw_analysis
            else:
                analysis = json.loads(
                    raw_analysis.strip()
                )

            required_fields = {
                "root_cause",
                "impact",
                "severity",
                "severity_assessment",
                "condition_confidence",
                "root_cause_confidence",
                "recommended_actions",
                "prevention_steps"
            }

            missing_fields = (
                required_fields - set(analysis.keys())
            )

            if missing_fields:
                raise ValueError(
                    "AI analysis missing required fields: "
                    + ", ".join(sorted(missing_fields))
                )

            if analysis["severity"] != incident["severity"]:
                raise ValueError(
                    "AI analysis severity does not match "
                    "incident severity"
                )

            if not isinstance(
                analysis["recommended_actions"],
                list
            ):
                raise ValueError(
                    "recommended_actions must be a list"
                )

            if not isinstance(
                analysis["prevention_steps"],
                list
            ):
                raise ValueError(
                    "prevention_steps must be a list"
                )

            for field_name in (
                "condition_confidence",
                "root_cause_confidence"
            ):
                value = analysis[field_name]

                if (
                    not isinstance(value, (int, float))
                    or isinstance(value, bool)
                    or not 0.0 <= value <= 1.0
                ):
                    raise ValueError(
                        f"{field_name} must be between 0.0 and 1.0"
                    )

            expected_unknown_root_cause = (
                "Root cause cannot be determined from "
                "the available incident evidence."
            )

            root_cause = str(
                analysis["root_cause"]
            ).strip()

            if root_cause != expected_unknown_root_cause:
                raise ValueError(
                    "AI analysis contains an unsupported "
                    "root cause claim"
                )

            if (
                root_cause == expected_unknown_root_cause
                and analysis["root_cause_confidence"] > 0.20
            ):
                raise ValueError(
                    "AI analysis root cause confidence is too high "
                    "when root cause is undetermined"
                )

            forbidden_claims = (
                "data corruption",
                "data loss",
                "inadequate cooling",
                "cooling system",
                "memory leak",
                "underutilization",
                "server underutilization",
                "system crash",
                "system crashes",
                "database failure",
                "network failure"
            )

            text_to_validate = " ".join([
                str(analysis["impact"]),
                str(analysis["severity_assessment"]),
                " ".join(
                    str(item)
                    for item in analysis["recommended_actions"]
                ),
                " ".join(
                    str(item)
                    for item in analysis["prevention_steps"]
                )
            ]).lower()

            for forbidden_claim in forbidden_claims:
                if forbidden_claim in text_to_validate:
                    raise ValueError(
                        "AI analysis contains unsupported "
                        f"claim: {forbidden_claim}"
                    )

            return {
                "analysis": analysis
            }

        except Exception as error:
            print(
                "AI analysis validation/provider failure; "
                f"using deterministic fallback: {error}"
            )

            return self._fallback_incident_analysis(
                incident
            )

    @staticmethod
    def _fallback_remediation(incident):
        """
        Safe deterministic diagnostic fallback used when the local LLM
        returns an invalid or unsafe remediation response.
        """
        return {
            "remediation": """Linux Commands
uptime
df -h

Docker Commands
docker ps
docker stats --no-stream

Kubernetes Commands
kubectl get pods
kubectl get nodes

AWS Actions
aws ec2 describe-instances
aws cloudwatch describe-alarms"""
        }

    def generate_remediation(self, incident):
        try:
            remediation = self.provider.remediation(
                incident
            )

            if not isinstance(remediation, str):
                raise ValueError(
                    "AI remediation must be a string"
                )

            required_sections = (
                "Linux Commands",
                "Docker Commands",
                "Kubernetes Commands",
                "AWS Actions"
            )

            for section in required_sections:
                if section not in remediation:
                    raise ValueError(
                        f"AI remediation missing required section: {section}"
                    )

            malformed_commands = (
                "kubectl getpods",
                "kubectl getnodes",
                "kubectl getservices",
                "docker ps--",
                "docker stats--",
                "aws ec2describe",
                "aws cloudwatchdescribe"
            )

            normalized_remediation = remediation.lower()

            for malformed_command in malformed_commands:
                if malformed_command in normalized_remediation:
                    raise ValueError(
                        "AI remediation contains a malformed command: "
                        f"{malformed_command}"
                    )

            forbidden_patterns = (
                "rm ",
                "kill ",
                "pkill ",
                "reboot",
                "shutdown",
                "systemctl stop",
                "systemctl disable",
                "docker stop",
                "docker rm",
                "docker restart",
                "kubectl delete",
                "kubectl scale",
                "kubectl patch",
                "kubectl apply",
                "aws terminate",
                "aws delete",
                "aws stop",
                "aws modify",
                "aws update",
                "aws put",
                "&&",
                "||",
                ";",
                ">",
                ">>",
                "|"
            )

            for forbidden_pattern in forbidden_patterns:
                if forbidden_pattern in normalized_remediation:
                    raise ValueError(
                        "AI remediation contains a forbidden operation "
                        f"or shell operator: {forbidden_pattern}"
                    )

            return {
                "remediation": remediation
            }

        except Exception as error:
            print(
                "AI remediation provider/validation failure; "
                f"using deterministic fallback: {error}"
            )

            return self._fallback_remediation(
                incident
            )

    def chat_with_incident(self, incident, question):

        prompt = f"""
You are a Senior Cloud DevOps Engineer.

Incident Details

Title:
{incident['title']}

Description:
{incident['description']}

Severity:
{incident['severity']}

Metric:
{incident['metric_name']}

Current Value:
{incident['metric_value']}

Threshold:
{incident['threshold_value']}

Question:
{question}

Answer like an experienced Site Reliability Engineer.
"""

        return self.provider.generate(prompt)