from app.ai.base import AIProvider
from app.ai.mock_provider import MockAIProvider
from app.config import get_settings

_provider_instance: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    """Renvoie le fournisseur IA actif. Retombe automatiquement sur le mode
    Mock si aucune clé n'est configurée pour le fournisseur choisi."""
    global _provider_instance
    if _provider_instance is not None:
        return _provider_instance

    settings = get_settings()

    if settings.ai_provider == "openai" and settings.openai_api_key:
        from app.ai.openai_provider import OpenAIProvider

        _provider_instance = OpenAIProvider(settings.openai_api_key)
    elif settings.ai_provider == "anthropic" and settings.anthropic_api_key:
        from app.ai.anthropic_provider import AnthropicProvider

        _provider_instance = AnthropicProvider(settings.anthropic_api_key)
    else:
        _provider_instance = MockAIProvider()

    return _provider_instance
