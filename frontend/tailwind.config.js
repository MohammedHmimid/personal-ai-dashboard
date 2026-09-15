/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-raised":
          "rgb(var(--color-surface-raised) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",

        primary: {
          DEFAULT: "#4F46E5",
          soft: "rgba(79, 70, 229, 0.10)",
        },

        success: "#16A34A",
        danger: "#DC2626",
        warning: "#D97706",
      },

      borderRadius: {
        card: "12px",
      },

      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06)",
        "card-hover":
          "0 8px 24px rgba(15, 23, 42, 0.08)",
      },
    },
  },

  plugins: [],
};