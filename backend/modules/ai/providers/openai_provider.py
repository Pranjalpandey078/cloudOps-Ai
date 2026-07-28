from modules.ai.providers.base_provider import AIProvider


class OpenAIProvider(AIProvider):

    def analyze_incident(self, incident):

        return {

            "provider": "OpenAI",

            "message": "OpenAI integration will be added in the next phase."

        }