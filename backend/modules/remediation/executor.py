import subprocess
import shlex


class RemediationExecutor:

    # Exact execution allowlists.
    # Only explicitly approved read-only commands can reach subprocess.

    ALLOWED_EXECUTIONS = {
        "LINUX": {
            "uptime",
            "df -h",
            "free -m",
            "ps aux"
        },

        "DOCKER": {
            "docker ps",
            "docker stats --no-stream"
        },

        "KUBERNETES": {
            "kubectl get pods",
            "kubectl get nodes"
        }
    }

    TIMEOUT_SECONDS = 10


    def execute(self, execution_type, command):

        execution_type = str(
            execution_type or ""
        ).upper().strip()

        command = str(
            command or ""
        ).strip()


        # Only execution types present in the exact allowlist are enabled.
        if execution_type not in self.ALLOWED_EXECUTIONS:

            return {
                "allowed": False,
                "reason":
                    f"{execution_type} execution is disabled."
            }


        allowed_commands = self.ALLOWED_EXECUTIONS[
            execution_type
        ]


        # Exact-match execution policy.
        if command not in allowed_commands:

            return {
                "allowed": False,
                "reason":
                    f"Command is not in the {execution_type} execution allowlist."
            }


        try:

            args = shlex.split(command)

            result = subprocess.run(
                args,
                shell=False,
                capture_output=True,
                text=True,
                timeout=self.TIMEOUT_SECONDS,
                check=False
            )

            return {
                "allowed": True,
                "success": result.returncode == 0,
                "exit_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr
            }


        except subprocess.TimeoutExpired as error:

            return {
                "allowed": True,
                "success": False,
                "exit_code": None,
                "stdout": (
                    error.stdout
                    if isinstance(error.stdout, str)
                    else ""
                ),
                "stderr":
                    f"Command exceeded {self.TIMEOUT_SECONDS} second timeout."
            }


        except Exception as error:

            return {
                "allowed": True,
                "success": False,
                "exit_code": None,
                "stdout": "",
                "stderr": str(error)
            }
