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
        "surface-raised": "rgb(var(--color-surface-raised) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: {
          DEFAULT: "#1F4E5F",
          soft: "rgba(31, 78, 95, 0.12)",
        },
        spark: {
          DEFAULT: "#B8862F",
          soft: "rgba(184, 134, 47, 0.14)",
        },
        success: "#2E9E6D",
        danger: "#C4495A",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
