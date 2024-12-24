/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,html}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Backdrop and primary colors
        backdrop: "#121212",
        surface: "#1e1e1e",
        onSurface: "#e0e0e0",
        primary: "#bb86fc",
        secondary: "#03dac6",
        error: "#cf6679",

        // Text colors
        textPrimary: "#ffffff",
        textSecondary: "#b3b3b3",

        // Borders and outlines
        outline: "#292929",
        accent: {
          light: "#FBBF24",
          DEFAULT: "#F59E0B",
          dark: "#D97706",
        },
        highlight: {
          DEFAULT: "#10B981",
        },
        neutral: {
          50: "#FAFAFA",
          900: "#111827",
        },
        textSubtle: "#4B5563",
      },
      fontFamily: {
        sans: ["Roboto", "Helvetica", "Arial", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      spacing: {
        72: "18rem",
        84: "21rem",
        96: "24rem",
      },
      animation: {
        fadeIn: "fadeIn 1s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
    },
    borderRadius: {
      xl: "1.25rem",
      md: "0.375rem",
      "2xl": "1.5rem",
      full: "9999px",
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
