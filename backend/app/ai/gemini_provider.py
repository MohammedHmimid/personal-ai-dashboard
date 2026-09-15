from google import genai

from app.ai.base import AIProvider


class GeminiProvider(AIProvider):
    name = "gemini"

    def __init__(
        self,
        api_key: str,
        model: str = "gemini-3.6-flash",
    ):
        self.client = genai.Client(api_key=api_key)
        self.model = model

    def _complete(self, system: str, user: str) -> str:
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=user,
                config={
                    "system_instruction": system,
                    "max_output_tokens": 1000,
                },
            )

            if not response.text:
                return "Gemini n'a retourné aucune réponse."

            return response.text

        except Exception as error:
            print("\n========================================")
            print("GEMINI ERROR:")
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