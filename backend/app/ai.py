from app.config import get_settings


class MockProvider:
    name = "mock"

    def chat(self, message: str, context: dict) -> str:
        return f"Mode démo. Votre message : {message}"

    def summarize(self, text: str) -> str:
        return text[:500]

    def extract_tasks(self, text: str) -> list[str]:
        return []


class AnthropicProvider:
    name = "anthropic"

    def __init__(self, api_key: str):
        self.api_key = api_key

    def chat(self, message: str, context: dict) -> str:
        from anthropic import Anthropic

        client = Anthropic(api_key=self.api_key)

        prompt = f"""
Tu es l'assistant IA personnel d'une application de notes.

Contexte de l'utilisateur :

Notes récentes :
{context.get("recent_notes", [])}

Tâches :
{context.get("today_tasks", [])}

Objectifs :
{context.get("goals", [])}

Question de l'utilisateur :
{message}

Réponds de manière claire, utile et concise.
"""

        response = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        return response.content[0].text

    def summarize(self, text: str) -> str:
        return self.chat(
            f"Résume le texte suivant :\n\n{text}",
            {},
        )

    def extract_tasks(self, text: str) -> list[str]:
        response = self.chat(
            f"""
Extrais les tâches importantes de ce texte.

Texte :
{text}

Retourne uniquement une liste de tâches, une tâche par ligne.
""",
            {},
        )

        return [
            line.strip("-• ")
            for line in response.splitlines()
            if line.strip()
        ]


def get_ai_provider():
    settings = get_settings()

    if settings.ai_provider == "anthropic":
        if not settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY n'est pas configurée.")

        return AnthropicProvider(settings.anthropic_api_key)

    return MockProvider()