import os

from modules.ai.providers.ollama_provider import OllamaProvider
from modules.ai.providers.openai_provider import OpenAIProvider
from modules.ai.providers.gemini_provider import GeminiProvider


class AIProviderFactory:

    @staticmethod
    def get_provider():

        provider = os.getenv(
            "AI_PROVIDER",
            "OLLAMA"
        ).upper()

        if provider == "OPENAI":
            return OpenAIProvider()

        if provider == "GEMINI":
            return GeminiProvider()

        return OllamaProvider()