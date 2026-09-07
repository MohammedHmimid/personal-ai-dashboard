import httpx

from app.ai.base import AIProvider


class AnthropicProvider(AIProvider):
    name = "anthropic"

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6"):
        self.api_key = api_key
        self.model = model

    def _complete(self, system: str, user: str) -> str:
        response = httpx.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
            },
            json={
                "model": self.model,
                "max_tokens": 1000,
                "system": system,
                "messages": [{"role": "user", "content": user}],
            },
            timeout=30,
        )
        response.raise_for_status()
        blocks = response.json()["content"]
        return "".join(b["text"] for b in blocks if b["type"] == "text")

    def chat(self, message: str, context: dict) -> str:
        system = (
            "Tu es l'assistant IA du Personal AI Dashboard de l'utilisateur. "
            f"Contexte de son espace de travail : {context}"
        )
        return self._complete(system, message)

    def summarize(self, text: str) -> str:
        return self._complete("Résume ce texte en 2-3 phrases claires.", text)

    def extract_tasks(self, text: str) -> list[str]:
        raw = self._complete(
            "Extrait la liste des tâches actionnables de ce texte, une par ligne, sans numérotation.",
            text,
        )
        return [line.strip("- ").strip() for line in raw.splitlines() if line.strip()]
