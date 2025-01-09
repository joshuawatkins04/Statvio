import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,html}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        backdrop: "var(--backdrop)",
        surface: "var(--surface)",
        onSurface: "var(--onSurface)",
        primary: "var(--primary)",
        primaryHover: "var(--primaryHover)",
        secondary: "var(--secondary)",
        error: "var(--error)",
        // Text colors
        textPrimary: "var(--textPrimary)",
        textSecondary: "var(--textSecondary)",

        // Borders and outlines
        outline: "var(--outline)",
        accent: {
          light: "var(--accent-light)",
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
        },
        highlight: {
          DEFAULT: "var(--highlight)",
        },
        neutral: {
          50: "var(--neutral-50)",
          900: "var(--neutral-900)",
        },
        textSubtle: "var(--textSubtle)",
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
  },
  plugins: [typography],
};
