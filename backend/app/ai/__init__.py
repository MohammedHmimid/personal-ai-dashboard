from app.config import get_settings
from app.ai.base import AIProvider
from app.ai.gemini_provider import GeminiProvider


class MockProvider(AIProvider):
    name = "mock"

    def chat(self, message: str, context: dict) -> str:
        return f"Mode démo. Votre message : {message}"

    def summarize(self, text: str) -> str:
        return text[:500]

    def extract_tasks(self, text: str) -> list[str]:
        return []


def get_ai_provider() -> AIProvider:
    settings = get_settings()

    if settings.ai_provider == "gemini":
        if not settings.gemini_api_key:
            raise RuntimeError(
                "GEMINI_API_KEY n'est pas configurée."
            )

        return GeminiProvider(
            api_key=settings.gemini_api_key
        )

    return MockProvider()