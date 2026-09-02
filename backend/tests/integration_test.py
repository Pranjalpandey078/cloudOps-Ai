import json
import sys
import requests


BASE_URL = "http://127.0.0.1:5001"
USERNAME = "sarvagya"
PASSWORD = "root"
INCIDENT_ID = 152


def check(condition, message):
    if condition:
        print(f"PASS: {message}")
    else:
        print(f"FAIL: {message}")
        sys.exit(1)


print("=" * 60)
print("SMARTOPS INTEGRATION TEST")
print("=" * 60)


# ---------------------------------------------------------
# 1. BACKEND HEALTH
# ---------------------------------------------------------

print("\n[1] Backend health")

response = requests.get(
    f"{BASE_URL}/",
    timeout=10
)

check(
    response.status_code == 200,
    "Backend is reachable"
)

health = response.json()

check(
    health.get("application") == "CloudOps AI",
    "Application name is CloudOps AI"
)

check(
    health.get("status") == "running",
    "Backend status is running"
)


# ---------------------------------------------------------
# 2. LOGIN
# ---------------------------------------------------------

print("\n[2] Authentication")

response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={
        "username": USERNAME,
        "password": PASSWORD
    },
    timeout=10
)

check(
    response.status_code == 200,
    "Login endpoint returned HTTP 200"
)

login_data = response.json()

check(
    login_data.get("token") is not None,
    "JWT token received"
)

token = login_data["token"]

headers = {
    "Authorization": f"Bearer {token}"
}


# ---------------------------------------------------------
# 3. INCIDENT REMEDIATION
# ---------------------------------------------------------

print(f"\n[3] Incident #{INCIDENT_ID} remediation")

response = requests.post(
    f"{BASE_URL}/api/incidents/{INCIDENT_ID}/remediation",
    headers=headers,
    timeout=180
)

check(
    response.status_code == 200,
    "Remediation endpoint returned HTTP 200"
)

data = response.json()

check(
    data.get("success") is True,
    "Remediation API returned success=true"
)

remediation_data = data.get("data", {})

check(
    remediation_data.get("incident_id") == INCIDENT_ID,
    "Correct incident ID returned"
)

remediation = remediation_data.get("remediation", "")

check(
    isinstance(remediation, str) and remediation.strip(),
    "Remediation text was generated"
)

print("\nGenerated remediation:")
print("-" * 40)
print(remediation)
print("-" * 40)


# ---------------------------------------------------------
# 4. REQUIRED SECTIONS
# ---------------------------------------------------------

print("\n[4] Remediation structure")

required_sections = [
    "Linux Commands",
    "Docker Commands",
    "Kubernetes Commands",
    "AWS Actions"
]

for section in required_sections:
    check(
        section in remediation,
        f"Required section exists: {section}"
    )


# ---------------------------------------------------------
# 5. COMMAND FORMAT SECURITY
# ---------------------------------------------------------

print("\n[5] Command security validation")

forbidden_patterns = [
    "kubectl getpods",
    "kubectl getnodes",
    "kubectl getservices",
    "docker ps--",
    "docker stats--",
    "aws ec2describe",
    "aws cloudwatchdescribe"
]

for pattern in forbidden_patterns:
    check(
        pattern not in remediation.lower(),
        f"Malformed command rejected: {pattern}"
    )


# ---------------------------------------------------------
# 6. DESTRUCTIVE COMMAND SECURITY
# ---------------------------------------------------------

print("\n[6] Destructive command validation")

dangerous_commands = [
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
    "aws put"
]

normalized = remediation.lower()

for command in dangerous_commands:
    check(
        command not in normalized,
        f"Destructive command absent: {command.strip()}"
    )


# ---------------------------------------------------------
# 7. SHELL OPERATORS
# ---------------------------------------------------------

print("\n[7] Shell operator validation")

dangerous_operators = [
    "&&",
    "||",
    ";",
    ">",
    ">>",
    "|"
]

for operator in dangerous_operators:
    check(
        operator not in remediation,
        f"Shell operator absent: {operator}"
    )


# ---------------------------------------------------------
# FINAL
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("SMARTOPS INTEGRATION TEST: PASS")
print("=" * 60)
