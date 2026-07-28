from apscheduler.schedulers.blocking import BlockingScheduler

from modules.monitoring.service import MonitoringService


scheduler = BlockingScheduler()


service = MonitoringService()



@scheduler.scheduled_job(
    "interval",
    seconds=10
)
def collect():

    print()
    print(
        "===== MONITORING CYCLE START ====="
    )


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



if __name__ == "__main__":

    print(
        "CloudOps AI Monitoring Worker Started"
    )

    scheduler.start()
