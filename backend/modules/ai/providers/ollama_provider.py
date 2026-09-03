import json

import requests

from modules.ai.providers.base_provider import AIProvider


class OllamaProvider(AIProvider):

    URL = (
        __import__("os").getenv(
            "OLLAMA_BASE_URL",
            "http://127.0.0.1:11434"
        ).rstrip("/")
        + "/api/generate"
    )

    MODEL = __import__("os").getenv("OLLAMA_MODEL", "llama3.2:3b")
    TIMEOUT = int(__import__("os").getenv("OLLAMA_TIMEOUT", "120"))

    def generate(self, prompt):

        # Ollama runs locally. Do not route localhost traffic
        # through system/environment HTTP proxies.
        session = requests.Session()
        session.trust_env = False

        response = session.post(
            self.URL,
            json={
                "model": self.MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=self.TIMEOUT
        )

        response.raise_for_status()

        return response.json()["response"]

    def analyze_incident(self, incident):

        evidence_json = json.dumps(
            incident.get("evidence", []),
            default=str,
            indent=2
        )


        prompt = f"""
You are a Senior Cloud DevOps Engineer and Site Reliability Engineer.

Your job is to analyze ONE infrastructure incident using ONLY the
evidence explicitly provided below.

IMPORTANT:
Do not invent logs, processes, applications, services, deployments,
network problems, database problems, memory leaks, or configuration
changes that are not present in the evidence.

INCIDENT EVIDENCE

Server ID:
{incident["server_id"]}

Title:
{incident["title"]}

Description:
{incident["description"]}

Severity:
{incident["severity"]}

Metric:
{incident["metric_name"]}

Current Value:
{incident["metric_value"]}

Threshold:
{incident["threshold_value"]}

COLLECTED DIAGNOSTIC EVIDENCE

The following evidence was collected by CloudOps AI for this incident:

{evidence_json}

IMPORTANT:
- The incident metric value and threshold are authoritative for the
  threshold-breach condition.
- Collected diagnostic evidence is a point-in-time snapshot and may have
  been captured shortly after the triggering metric was observed.
- Do not use a later metric snapshot to deny that the original threshold
  breach occurred.
- Use the collected evidence to support or reject possible root causes.
- Do not invent processes, applications, logs, services, databases,
  deployments, or infrastructure that are not present in the evidence.

ROOT CAUSE RULES

1. The metric violation itself is confirmed evidence.
2. A deeper technical root cause is NOT confirmed unless the incident
   evidence explicitly supports it.
3. If the deeper root cause cannot be determined from the evidence,
   say exactly:

   "Root cause cannot be determined from the available incident evidence."

4. The root_cause field must contain ONLY a confirmed root cause
   supported directly by the supplied evidence.
5. If the evidence does not directly prove an underlying root cause,
   the root_cause field MUST be exactly:
   "Root cause cannot be determined from the available incident evidence."
6. Never place a hypothesis in the root_cause field.
7. If root_cause uses the required unknown-root-cause statement, then
   root_cause_confidence MUST be <= 0.20.
8. Confidence must reflect the available evidence, not how confident
   the model sounds.
9. When no diagnostic evidence is provided, treat the underlying
   root cause as unconfirmed and use the exact required root-cause
   statement above.
10. A threshold violation alone should normally have high confidence
   for the threshold condition and low confidence for an underlying
   root cause.
11. The severity_assessment MUST mention the actual supplied incident
    severity exactly and MUST NOT mention any other severity.
12. Every recommended_actions item MUST be specific to the supplied
    incident evidence. Never use generic placeholder or template wording.
13. Every prevention_steps item MUST be specific and actionable for the
    supplied incident. Never use generic placeholder wording.
14. Do not invent causes, measurements, historical events, infrastructure
    components, or failures that are not present in the evidence.


SEVERITY RULES

The supplied incident severity is authoritative.

You MUST preserve the supplied severity exactly.

Never downgrade or upgrade the incident severity.

The "severity_assessment" field must explain why the supplied severity
is appropriate using the available metric and threshold evidence.

The "severity" field in the JSON output MUST exactly match the supplied
incident severity.

Do NOT describe the supplied severity as moderate, low, medium,
less severe, or inappropriate.

Do not replace the supplied severity with your own severity judgment.


IMPACT RULES

Describe only the likely operational impact that follows from the
observed metric condition.

Use words such as:
"may", "could", or "potentially" when the impact is not directly
confirmed by the evidence.


RECOMMENDED ACTION RULES

Recommended actions must be practical and safe.

Prioritize:
1. Verify the condition.
2. Collect diagnostic evidence.
3. Identify the underlying resource or process.
4. Apply remediation only after evidence confirms the cause.

Do not claim that remediation has already happened.


PREVENTION RULES

Provide realistic long-term prevention measures related to the
observed metric condition.

Do not invent a specific application architecture.


OUTPUT RULES

Return ONLY valid JSON.

Before returning JSON, verify:

- severity exactly matches the supplied incident severity.
- severity_assessment names only that supplied severity.
- root_cause is evidence-supported or exactly the required unknown statement.
- if root_cause is unknown, root_cause_confidence is <= 0.20.
- confidence values are numbers from 0 to 1.
- recommended_actions are concrete and incident-specific.
- prevention_steps are concrete and incident-specific.
- no placeholder or template recommendation text is present.

Do not use markdown.
Do not use backticks.
Do not include text before or after the JSON.

Use exactly this structure:

{{
  "root_cause": "Confirmed root cause only if supported by evidence, otherwise state that the root cause cannot be determined from the available incident evidence.",
  "impact": "Evidence-based likely operational impact.",
  "severity": "{incident["severity"]}",
  "severity_assessment": "Explain why the supplied incident severity is supported by the supplied metric and threshold evidence.",
  "condition_confidence": 1.0,
  "root_cause_confidence": 0.0,
  "recommended_actions": [
    "Inspect the specific metric, process, or resource implicated by the supplied incident evidence.",
    "Collect diagnostic evidence needed to identify the underlying cause.",
    "Apply a safe remediation only after the evidence confirms the cause."
  ],

  "prevention_steps": [
    "Add a preventive control directly related to the observed incident condition.",
    "Improve monitoring or threshold configuration based on the observed condition.",
    "Document and automate an appropriate preventive response supported by the evidence."
  ]
}}

CONFIDENCE GUIDANCE

condition_confidence:

0.90 - 1.00:
The incident condition is directly proven by the supplied metric and threshold.

0.70 - 0.89:
The incident condition is strongly supported by the supplied evidence.

0.40 - 0.69:
The incident condition is reasonably supported but some evidence is missing.

0.00 - 0.39:
Very little evidence is available to confirm the incident condition.


root_cause_confidence:

0.90 - 1.00:
The underlying root cause is directly proven by the supplied evidence.

0.70 - 0.89:
The underlying root cause is strongly supported but not directly proven.

0.40 - 0.69:
A possible root cause is supported by some evidence but remains uncertain.

0.00 - 0.39:
The underlying root cause cannot be determined from the supplied evidence.

IMPORTANT:

A metric threshold violation can produce high condition_confidence
without producing high root_cause_confidence.

For example, if CPU is 29.10 and the threshold is 25.00,
the CPU threshold violation is confirmed, but the underlying
cause is not necessarily known.

Remember:
A metric threshold violation does NOT by itself prove the underlying
root cause.

Return JSON only.
"""

        return self.generate(prompt)

    def remediation(self, incident):

        prompt = f"""
You are a Senior Cloud DevOps Engineer and Site Reliability Engineer.

Generate SAFE READ-ONLY diagnostic commands for this incident.

Incident:
Title: {incident["title"]}
Severity: {incident["severity"]}
Metric: {incident["metric_name"]}
Current Value: {incident["metric_value"]}

STRICT RULES:

1. Never generate destructive or state-changing commands.
2. Never use rm, kill, pkill, reboot, shutdown, systemctl stop,
   systemctl disable, docker stop, docker rm, docker restart,
   kubectl delete, kubectl scale, kubectl patch, kubectl apply,
   AWS terminate, delete, stop, modify, update or put operations.
3. Do not use shell operators such as &&, ||, ;, >, >> or pipes.
4. Do not include explanations inside command sections.
5. Put exactly one command on each line.
6. Commands must be diagnostic/read-only.
7. If no safe command exists for a section, write NONE.

Return EXACTLY this format:

Linux Commands
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
aws cloudwatch describe-alarms

Do not add numbering, markdown, backticks, descriptions or additional sections.
"""

        return self.generate(prompt)
