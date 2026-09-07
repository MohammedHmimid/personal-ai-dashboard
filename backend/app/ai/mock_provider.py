import re

from app.ai.base import AIProvider


class MockAIProvider(AIProvider):
    """Fournisseur par défaut : aucune dépendance externe, aucune clé API.

    Il simule un assistant raisonnablement utile en s'appuyant sur le
    contexte réel de l'utilisateur (tâches du jour, notes récentes,
    objectifs) pour que l'app soit pleinement démontrable sans OpenAI ni
    Anthropic configurés.
    """

    name = "mock"

    def chat(self, message: str, context: dict) -> str:
        lowered = message.lower()

        if "tâche" in lowered or "task" in lowered:
            tasks = context.get("today_tasks", [])
            if not tasks:
                return "Tu n'as aucune tâche prévue aujourd'hui. Envie d'en créer une ?"
            listed = "\n".join(f"- {t}" for t in tasks)
            return f"Voici tes tâches du jour :\n{listed}"

        if "objectif" in lowered or "goal" in lowered:
            goals = context.get("goals", [])
            if not goals:
                return "Tu n'as pas encore défini d'objectif. Veux-tu que je t'aide à en créer un ?"
            listed = "\n".join(f"- {g}" for g in goals)
            return f"Voici où tu en es sur tes objectifs :\n{listed}"

        if "note" in lowered:
            notes = context.get("recent_notes", [])
            if not notes:
                return "Tu n'as pas encore de notes. Commence par en créer une !"
            listed = "\n".join(f"- {n}" for n in notes)
            return f"Tes notes récentes :\n{listed}"

        return (
            "Je suis un assistant en mode démonstration (aucune clé API IA "
            "n'est configurée). Configure OPENAI_API_KEY ou ANTHROPIC_API_KEY "
            "dans le fichier .env pour activer un vrai modèle. En attendant, "
            "demande-moi tes tâches, tes notes ou tes objectifs !"
        )

    def summarize(self, text: str) -> str:
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        summary = " ".join(sentences[:2]) if sentences else ""
        return summary or "(rien à résumer)"

    def extract_tasks(self, text: str) -> list[str]:
        candidates: list[str] = []
        for line in text.splitlines():
            line = line.strip(" -*\t")
            if not line:
                continue
            if line.lower().startswith(("todo", "il faut", "à faire", "- [ ]")):
                candidates.append(line.split(":", 1)[-1].strip())
        return candidates[:10]
