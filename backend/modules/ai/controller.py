from flask import request

from modules.ai.service import AIService
from shared.response import ApiResponse


class AIController:

    service = AIService()

    def chat(self):

        body = request.get_json()

        question = body.get("question", "")

        if not question:

            return ApiResponse.error(
                message="Question is required",
                status=400
            )

        answer = self.service.chat(question)

        return ApiResponse.success(
            data={
                "answer": answer
            }
        )