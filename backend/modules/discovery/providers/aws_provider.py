import boto3


class AWSDiscoveryProvider:

    def __init__(self, region_name=None):

        self.session = boto3.Session(
            region_name=region_name
        )

        self.region = (
            self.session.region_name
            or "ap-south-1"
        )


    def discover(self):

        ec2 = self.session.client(
            "ec2",
            region_name=self.region
        )

        response = ec2.describe_instances()

        instances = []

        for reservation in response.get(
            "Reservations", []
        ):

            for instance in reservation.get(
                "Instances", []
            ):

                instances.append(
                    self._normalize(instance)
                )

        return instances


    def _normalize(self, instance):

        tags = {
            tag.get("Key"): tag.get("Value")
            for tag in instance.get("Tags", [])
        }

        instance_id = instance.get("InstanceId")

        hostname = (
            tags.get("Name")
            or instance.get("PrivateDnsName")
            or instance_id
        )

        state = (
            instance.get("State", {})
            .get("Name", "unknown")
            .upper()
        )

        placement = instance.get(
            "Placement", {}
        )

        return {
            "provider": "AWS",
            "discovery_source": "AWS",
            "instance_id": instance_id,
            "external_resource_id": instance_id,
            "hostname": hostname,
            "ip_address": (
                instance.get("PrivateIpAddress")
                or instance.get("PublicIpAddress")
                or ""
            ),
            "public_ip": instance.get(
                "PublicIpAddress"
            ),
            "operating_system": (
                instance.get("PlatformDetails")
                or "Linux/UNIX"
            ),
            "os_version": None,
            "cpu_cores": (
                instance.get("CpuOptions", {})
                .get("CoreCount", 0)
            ),
            "memory_gb": 0,
            "disk_gb": 0,
            "cloud_provider": "AWS",
            "region": self.region,
            "availability_zone": (
                placement.get("AvailabilityZone")
            ),
            "instance_type": instance.get(
                "InstanceType"
            ),
            "status": state,
            "launch_time": instance.get(
                "LaunchTime"
            ),
            "name": tags.get("Name")
        }
