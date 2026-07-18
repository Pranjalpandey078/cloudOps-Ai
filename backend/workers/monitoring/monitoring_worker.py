from apscheduler.schedulers.blocking import BlockingScheduler

from modules.monitoring.service import MonitoringService

scheduler = BlockingScheduler()

service = MonitoringService()


@scheduler.scheduled_job(

    "interval",

    seconds=10

)

def collect():

    service.collect()


scheduler.start()