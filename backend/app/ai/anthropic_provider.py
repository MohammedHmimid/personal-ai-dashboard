import httpx

from app.ai.base import AIProvider


class AnthropicProvider(AIProvider):
    name = "anthropic"

    def __init__(
        self,
        api_key: str,
        model: str = "claude-sonnet-4-6",
    ):
        self.api_key = api_key
        self.model = model

    def _complete(self, system: str, user: str) -> str:
        try:
            response = httpx.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": self.model,
                    "max_tokens": 1000,
                    "system": system,
                    "messages": [
                        {
                            "role": "user",
                            "content": user,
                        }
                    ],
                },
                timeout=30,
            )

            print("\n========================================")
            print("ANTHROPIC STATUS:", response.status_code)
            print("ANTHROPIC RESPONSE:")
            print(response.text)
            print("========================================\n")

            if response.status_code != 200:
                return (
                    "Erreur lors de la communication avec Anthropic. "
                    "Consultez le terminal du serveur pour plus de détails."
                )

            data = response.json()

            blocks = data.get("content", [])

            return "".join(
                block.get("text", "")
                for block in blocks
                if block.get("type") == "text"
            )

        except httpx.RequestError as error:
            print("\n========================================")
            print("ANTHROPIC CONNECTION ERROR:")
            print(error)
            print("========================================\n")

            return (
                "Impossible de contacter le service Anthropic. "
                "Vérifiez votre connexion internet."
            )

        except Exception as error:
            print("\n========================================")
            print("ANTHROPIC ERROR:")
            print(type(error).__name__)
            print(error)
            print("========================================\n")

            return "Une erreur est survenue avec l'assistant IA."

    def chat(self, message: str, context: dict) -> str:
        system = (
            "Tu es l'assistant IA du Personal AI Dashboard "
            "de l'utilisateur.\n\n"
            "Tu aides l'utilisateur avec ses notes, ses tâches "
            "et ses objectifs.\n\n"
            f"Contexte de l'espace de travail : {context}"
        )

        return self._complete(system, message)

    def summarize(self, text: str) -> str:
        system = (
            "Tu es un assistant de prise de notes. "
            "Résume le texte en 2 ou 3 phrases claires."
        )

        return self._complete(system, text)

    def extract_tasks(self, text: str) -> list[str]:
        system = (
            "Extrait les tâches actionnables du texte. "
            "Retourne uniquement une tâche par ligne, "
            "sans numérotation ni explication."
        )

        raw = self._complete(system, text)

        return [
            line.strip("-• ").strip()
            for line in raw.splitlines()
            if line.strip()
        ]