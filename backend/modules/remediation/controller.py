from flask import request, g

from modules.remediation.service import RemediationService


class RemediationController:

    service = RemediationService()


    def request_execution(self):

        data = request.get_json(silent=True) or {}

        return self.service.request_execution(
            data,
            g.user_id
        )


    def get_execution(self, execution_id):

        return self.service.get_execution(
            execution_id
        )


    def incident_history(self, incident_id):

        return self.service.incident_history(
            incident_id
        )


    def approve(self, execution_id):

        return self.service.approve(
            execution_id
        )


    def reject(self, execution_id):

        return self.service.reject(
            execution_id
        )

    def execute(self, execution_id):

        return self.service.execute(
            execution_id
        )

