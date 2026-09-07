from abc import ABC, abstractmethod


class AIProvider(ABC):
    """Interface commune à tous les fournisseurs IA.

    Pour brancher un vrai fournisseur (OpenAI, Anthropic, Ollama...), il
    suffit d'implémenter cette classe et de l'enregistrer dans
    `get_ai_provider()` (voir __init__.py). Aucune clé API ne doit jamais
    transiter côté frontend : tout passe par ce backend.
    """

    name: str = "base"

    @abstractmethod
    def chat(self, message: str, context: dict) -> str:
        """Répond à un message utilisateur, avec le contexte de son espace
        de travail (notes/tâches/objectifs récents) injecté par l'appelant."""
        raise NotImplementedError

    @abstractmethod
    def summarize(self, text: str) -> str:
        raise NotImplementedError

    @abstractmethod
    def extract_tasks(self, text: str) -> list[str]:
        raise NotImplementedError
