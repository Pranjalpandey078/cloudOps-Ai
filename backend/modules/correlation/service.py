from shared.response import ApiResponse
from .repository import CorrelationRepository


class CorrelationService:

    repository = CorrelationRepository()


    def related_incidents(
        self,
        incident_id
    ):

        incidents = (
            self.repository.get_related_incidents(
                incident_id
            )
        )

        return ApiResponse.success(
            data=incidents
        )


    def dashboard_stats(self):

        data = self.repository.get_dashboard_stats()

        return ApiResponse.success(
            data=data
        )

    def list_groups(self):

        connection = self.repository.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                title,
                root_cause,
                severity,
                confidence_score,
                status,
                incident_count,
                created_at AS first_seen,
                updated_at AS last_seen,
                TIMESTAMPDIFF(
                    MINUTE,
                    created_at,
                    NOW()
                ) AS active_minutes
            FROM incident_correlation_groups
            ORDER BY created_at DESC
            """
        )

        rows = cursor.fetchall()

        connection.close()

        return ApiResponse.success(
            data=rows
        )
