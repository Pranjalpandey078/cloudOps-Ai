from flask import request

from modules.incidents.service import IncidentService


class IncidentController:

    service = IncidentService()

    def create(self):

        data = request.get_json()

        return self.service.create(data)

    def latest(self):

        return self.service.latest()

    def recent(self):

        return self.service.recent()

    def resolve(self, incident_id):

        return self.service.resolve(incident_id)

    def analyze(self):

        incident = request.get_json()

        return self.service.analyze(
            incident
        )

    def chat(self, incident_id):

        body = request.get_json()

        question = body["question"]

        return self.service.chat(
            incident_id,
            question
        )