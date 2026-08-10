import requests

from modules.ai.providers.base_provider import AIProvider


class OllamaProvider(AIProvider):

    URL = "http://127.0.0.1:11434/api/generate"

    MODEL = "llama3.2:3b"

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
            timeout=120
        )

        response.raise_for_status()

        return response.json()["response"]

    def analyze_incident(self, incident):

        prompt = f"""
You are a Senior Cloud DevOps Engineer and Site Reliability Engineer.

Analyze the following production infrastructure incident.

INCIDENT DETAILS

Server ID: {incident["server_id"]}
Title: {incident["title"]}
Description: {incident["description"]}
Severity: {incident["severity"]}
Metric: {incident["metric_name"]}
Current Value: {incident["metric_value"]}
Threshold: {incident["threshold_value"]}

Return ONLY valid JSON.

Do not use markdown.
Do not use backticks.
Do not include text before or after the JSON.

Use exactly this structure:

{{
  "root_cause": "Most likely technical cause of the incident",
  "impact": "Likely infrastructure or business impact",
  "severity_assessment": "Assessment of the current severity",
  "recommended_actions": [
    "First recommended action",
    "Second recommended action",
    "Third recommended action"
  ],
  "prevention_steps": [
    "First prevention step",
    "Second prevention step"
  ],
  "confidence": 0.85
}}

RULES:

1. Base the analysis only on the incident information provided.
2. Do not claim certainty when the root cause cannot be proven.
3. confidence must be a number between 0.0 and 1.0.
4. recommended_actions must contain practical DevOps/SRE actions.
5. prevention_steps must contain long-term preventive measures.
6. Return valid JSON only.
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
