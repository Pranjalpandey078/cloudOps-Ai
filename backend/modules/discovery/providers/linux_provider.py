import os
import platform
import socket
import shutil


class LinuxDiscoveryProvider:

    def discover(self):

        hostname = socket.gethostname()

        try:
            ip_address = socket.gethostbyname(hostname)
        except socket.gaierror:
            ip_address = "127.0.0.1"

        cpu_cores = os.cpu_count() or 1

        memory_gb = self._memory_gb()

        disk = shutil.disk_usage("/")
        disk_gb = round(
            disk.total / (1024 ** 3)
        )

        return {
            "provider": "LINUX",
            "hostname": hostname,
            "ip_address": ip_address,
            "operating_system": platform.system(),
            "os_version": platform.release(),
            "cpu_cores": cpu_cores,
            "memory_gb": memory_gb,
            "disk_gb": disk_gb,
            "cloud_provider": "ON_PREMISE",
            "region": None,
            "availability_zone": None,
            "instance_type": None,
            "status": "RUNNING"
        }


    def _memory_gb(self):

        try:
            page_size = os.sysconf("SC_PAGE_SIZE")
            physical_pages = os.sysconf(
                "SC_PHYS_PAGES"
            )

            total_bytes = (
                page_size * physical_pages
            )

            return round(
                total_bytes / (1024 ** 3)
            )

        except (ValueError, OSError, AttributeError):
            return 0
