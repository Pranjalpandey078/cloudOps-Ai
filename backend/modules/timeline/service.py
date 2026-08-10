from shared.response import ApiResponse

from modules.timeline.repository import TimelineRepository


class TimelineService:

    def __init__(self):

        self.repository = TimelineRepository()


    def add_event(
        self,
        incident_id,
        event_type,
        title,
        description=None
    ):

        self.repository.create_event(
            incident_id=incident_id,
            event_type=event_type,
            title=title,
            description=description
        )


    def get_timeline(
        self,
        incident_id
    ):

        events = self.repository.get_incident_timeline(
            incident_id
        )

        return ApiResponse.success(
            data=events
        )
