/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#6366F1",
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
        },
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
      "2xl": "1.5rem",
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
