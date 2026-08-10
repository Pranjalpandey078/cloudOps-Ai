from modules.timeline.service import TimelineService


class TimelineController:

    def __init__(self):

        self.service = TimelineService()


    def get_timeline(
        self,
        incident_id
    ):

        return self.service.get_timeline(
            incident_id
        )
