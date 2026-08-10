from apscheduler.schedulers.blocking import BlockingScheduler

from flask import Flask

from modules.monitoring.service import MonitoringService


scheduler = BlockingScheduler()

service = MonitoringService()


def run_monitoring_cycle():

    print()
    print("===== MONITORING CYCLE START =====")

    # Local machine monitoring
    try:

        service.collect()

        print(
            "LOCAL monitoring completed."
        )

    except Exception as error:

        print(
            "LOCAL monitoring failed:",
            error
        )

    # AWS CloudWatch monitoring
    try:

        aws_result = service.collect_aws()

        print(
            "AWS monitoring completed:",
            len(aws_result),
            "servers"
        )

    except Exception as error:

        print(
            "AWS monitoring failed:",
            error
        )

    print(
        "===== MONITORING CYCLE END ====="
    )


def collect():

    from run import app

    with app.app_context():

        run_monitoring_cycle()


scheduler.add_job(
    collect,
    "interval",
    seconds=10
)


if __name__ == "__main__":

    print(
        "CloudOps AI Monitoring Worker Started"
    )

    scheduler.start()
