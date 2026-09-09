import { Github, Linkedin, Mail, Sparkles } from "lucide-react";
import profilePhoto from "../assets/profile.jpeg";

const APP_FEATURES = [
  "Notes rapides pour capturer tes idées",
  "Tâches organisées par priorité",
  "Objectifs suivis avec une barre de progression",
  "Assistant IA pour t'aider au quotidien",
];

export default function About() {
  return (
    <div className="flex flex-col max-w-2xl gap-6">
      <h1 className="text-lg font-semibold font-display">Support & À propos</h1>

      {/* À propos de l'app */}
      <section className="p-5 card">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-accent" />
          <h2 className="text-sm font-semibold font-display">L'application</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted">
          <strong className="text-ink">SecondBrain</strong> est un tableau de bord personnel qui centralise tes
          notes, tâches et objectifs, avec un assistant IA intégré pour t'aider à rester organisé et productif au
          quotidien.
        </p>
        <ul className="flex flex-col gap-2 mt-4">
          {APP_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-ink">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {/* Profil du créateur */}
      <section className="p-6 card">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src={profilePhoto}
            alt="Photo de profil"
            className="object-cover w-24 h-24 border-2 rounded-full shadow-sm border-accent-soft"
          />
          <div>
            <p className="text-base font-semibold font-display">Data Scientist & Développeur Full Stack</p>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Étudiant en Master Intelligence Artificielle à la Faculté des Sciences Ben M'Sik, passionné par le
            développement d'applications intelligentes, le Machine Learning et le développement Web Full Stack. Je
            possède une solide expérience dans la conception d'applications web, l'analyse de données et le
            développement de modèles d'intelligence artificielle. Curieux, autonome et motivé, je recherche une
            première expérience professionnelle afin de contribuer à des projets innovants tout en développant mes
            compétences techniques.
          </p>

          <div className="flex items-center gap-2 mt-1">
            
              <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=mohammedhmimid05@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-1.5 !py-1.5 !px-3 text-xs"
          ></a>
              <Mail size={13} /> Contact
            <a
              href="https://www.linkedin.com/in/mohammed-hmimid-11b194287/"
              className="btn-secondary flex items-center gap-1.5 !py-1.5 !px-3 text-xs"
            >
              <Linkedin size={13} /> LinkedIn
            </a>
            <a
              href="https://github.com/MohammedHmimid"
              className="btn-secondary flex items-center gap-1.5 !py-1.5 !px-3 text-xs"
            >
              <Github size={13} /> GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="p-5 card">
        <h2 className="mb-2 text-sm font-semibold font-display">Besoin d'aide ?</h2>
        <p className="text-sm text-muted">
          Une question, un bug ou une suggestion ? Écris-moi directement à{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=mohammedhmimid05@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            mohammedhmimid05@gmail.com
          </a>
          , je réponds généralement sous 24 à 48h.
        </p>
      </section>
    </div>
  );
}
