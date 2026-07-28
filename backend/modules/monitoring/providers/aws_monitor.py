import boto3

from datetime import (
    datetime,
    timedelta,
    timezone
)


class AWSMonitoringProvider:

    def __init__(self):

        session = boto3.Session()

        self.region = (
            session.region_name
            or "ap-south-1"
        )

        self.cloudwatch = session.client(
            "cloudwatch",
            region_name=self.region
        )


    def get_metric(
        self,
        instance_id,
        metric_name
    ):

        end_time = datetime.now(
            timezone.utc
        )

        start_time = (
            end_time
            - timedelta(minutes=15)
        )

        response = (
            self.cloudwatch.get_metric_statistics(
                Namespace="AWS/EC2",

                MetricName=metric_name,

                Dimensions=[
                    {
                        "Name": "InstanceId",
                        "Value": instance_id
                    }
                ],

                StartTime=start_time,
                EndTime=end_time,

                Period=300,

                Statistics=[
                    "Average"
                ]
            )
        )

        datapoints = response.get(
            "Datapoints",
            []
        )

        if not datapoints:
            return 0.0

        # CloudWatch does not guarantee datapoint order.
        latest = max(
            datapoints,
            key=lambda item: item["Timestamp"]
        )

        return round(
            float(
                latest.get(
                    "Average",
                    0
                )
            ),
            2
        )


    def collect_instance_metrics(
        self,
        instance_id
    ):

        return {
            "cpu": self.get_metric(
                instance_id,
                "CPUUtilization"
            ),

            "network_in": self.get_metric(
                instance_id,
                "NetworkIn"
            ),

            "network_out": self.get_metric(
                instance_id,
                "NetworkOut"
            )
        }
