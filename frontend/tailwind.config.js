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
          DEFAULT: "#5B5FEF",
          soft: "rgba(91, 95, 239, 0.12)",
        },
        spark: {
          DEFAULT: "#F2A93B",
          soft: "rgba(242, 169, 59, 0.14)",
        },
        success: "#3FBE8F",
        danger: "#EF5A6F",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
