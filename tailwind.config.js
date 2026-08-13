/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          raised: "rgb(var(--color-surface-raised) / <alpha-value>)",
          sunken: "rgb(var(--color-surface-sunken) / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        foreground: {
          DEFAULT: "rgb(var(--color-fg) / <alpha-value>)",
          muted: "rgb(var(--color-fg-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(var(--color-accent-fg) / <alpha-value>)",
        },
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        chart: "rgb(var(--color-chart) / <alpha-value>)",
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px -12px rgba(0,0,0,0.25)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
