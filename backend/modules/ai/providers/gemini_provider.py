from modules.ai.providers.base_provider import AIProvider


class GeminiProvider(AIProvider):

    def analyze_incident(self, incident):

        return {

            "provider": "Gemini",

            "message": "Gemini integration will be added in the next phase."

        }