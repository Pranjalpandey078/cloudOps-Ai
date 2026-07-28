import re
import shlex


class RemediationSafetyValidator:

    # Phase 1 is deliberately restrictive.
    # Only diagnostic/read-only command families are accepted.

    ALLOWED_COMMANDS = {
        "LINUX": {
            "uptime",
            "free",
            "df",
            "ps",
            "top",
            "vmstat",
            "iostat",
            "uname",
            "whoami"
        },

        "DOCKER": {
            "docker"
        },

        "KUBERNETES": {
            "kubectl"
        },

        "AWS": {
            "aws"
        }
    }


    # Shell syntax capable of chaining, redirecting or substituting
    # additional commands is not accepted.
    SHELL_METACHARACTERS = [
        ";",
        "&&",
        "||",
        "|",
        ">",
        "<",
        "`",
        "$(",
        "\n",
        "\r"
    ]


    # Explicitly dangerous utilities/actions.
    BLOCKED_PATTERNS = [
        r"\brm\b",
        r"\bshutdown\b",
        r"\breboot\b",
        r"\bpoweroff\b",
        r"\bhalt\b",
        r"\bmkfs\b",
        r"\bdd\b",
        r"\bchmod\b",
        r"\bchown\b",
        r"\bkill\b",
        r"\bkillall\b",
        r"\bpkill\b",
        r"\bsystemctl\s+(stop|disable|restart)\b",
        r"\bservice\s+\S+\s+(stop|restart)\b",

        r"\bdocker\s+(rm|rmi|kill|stop|restart|prune|exec)\b",

        r"\bkubectl\s+(delete|apply|create|replace|patch|edit|exec|scale|rollout)\b",

        r"\baws\s+.*\b(delete|terminate|stop|reboot|modify|put|create|update)\b"
    ]


    DOCKER_READ_ONLY = {
        "ps",
        "images",
        "inspect",
        "logs",
        "stats",
        "version",
        "info"
    }


    KUBECTL_READ_ONLY = {
        "get",
        "describe",
        "logs",
        "top",
        "version",
        "cluster-info",
        "api-resources",
        "api-versions"
    }


    AWS_READ_PREFIXES = (
        "describe-",
        "get-",
        "list-"
    )


    def validate(self, execution_type, command):

        execution_type = str(execution_type or "").upper().strip()
        command = str(command or "").strip()

        if execution_type not in self.ALLOWED_COMMANDS:
            return self._blocked(
                "Unsupported execution type."
            )

        if not command:
            return self._blocked(
                "Command cannot be empty."
            )

        if len(command) > 1000:
            return self._blocked(
                "Command exceeds maximum allowed length."
            )

        for token in self.SHELL_METACHARACTERS:

            if token in command:
                return self._blocked(
                    f"Shell operator '{token}' is not permitted."
                )

        lowered = command.lower()

        for pattern in self.BLOCKED_PATTERNS:

            if re.search(
                pattern,
                lowered,
                flags=re.IGNORECASE
            ):
                return self._blocked(
                    "Command contains a blocked operation."
                )

        try:
            parts = shlex.split(command)

        except ValueError:
            return self._blocked(
                "Command syntax is invalid."
            )

        if not parts:
            return self._blocked(
                "Command cannot be empty."
            )

        executable = parts[0].lower()

        if executable not in self.ALLOWED_COMMANDS[execution_type]:
            return self._blocked(
                f"'{executable}' is not allowed for {execution_type} remediation."
            )

        if execution_type == "DOCKER":
            return self._validate_docker(parts)

        if execution_type == "KUBERNETES":
            return self._validate_kubernetes(parts)

        if execution_type == "AWS":
            return self._validate_aws(parts)

        return self._allowed(
            risk_level="LOW",
            reason="Read-only Linux diagnostic command."
        )


    def _validate_docker(self, parts):

        if len(parts) < 2:
            return self._blocked(
                "Docker subcommand is required."
            )

        subcommand = parts[1].lower()

        if subcommand not in self.DOCKER_READ_ONLY:
            return self._blocked(
                f"Docker '{subcommand}' is not allowed."
            )

        return self._allowed(
            risk_level="LOW",
            reason="Read-only Docker diagnostic command."
        )


    def _validate_kubernetes(self, parts):

        if len(parts) < 2:
            return self._blocked(
                "kubectl subcommand is required."
            )

        subcommand = parts[1].lower()

        if subcommand not in self.KUBECTL_READ_ONLY:
            return self._blocked(
                f"kubectl '{subcommand}' is not allowed."
            )

        return self._allowed(
            risk_level="LOW",
            reason="Read-only Kubernetes diagnostic command."
        )


    def _validate_aws(self, parts):

        if len(parts) < 3:
            return self._blocked(
                "AWS service and operation are required."
            )

        operation = parts[2].lower()

        if not operation.startswith(
            self.AWS_READ_PREFIXES
        ):
            return self._blocked(
                f"AWS operation '{operation}' is not read-only."
            )

        return self._allowed(
            risk_level="LOW",
            reason="Read-only AWS CLI operation."
        )


    def _allowed(self, risk_level, reason):

        return {
            "allowed": True,
            "risk_level": risk_level,
            "status": "PENDING",
            "reason": reason
        }


    def _blocked(self, reason):

        return {
            "allowed": False,
            "risk_level": "CRITICAL",
            "status": "BLOCKED",
            "reason": reason
        }
