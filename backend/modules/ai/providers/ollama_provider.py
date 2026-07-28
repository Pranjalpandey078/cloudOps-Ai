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

Analyze this production incident.

Server ID: {incident["server_id"]}
Title: {incident["title"]}
Description: {incident["description"]}
Severity: {incident["severity"]}
Metric: {incident["metric_name"]}
Current Value: {incident["metric_value"]}
Threshold: {incident["threshold_value"]}

Provide:

1. Root Cause
2. Business Impact
3. Recommendations
4. Priority
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
