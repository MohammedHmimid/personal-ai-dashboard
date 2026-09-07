import httpx

from app.ai.base import AIProvider


class OpenAIProvider(AIProvider):
    name = "openai"

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model

    def _complete(self, system: str, user: str) -> str:
        response = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            },
            timeout=30,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

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
