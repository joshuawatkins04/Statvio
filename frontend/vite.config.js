import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  return {
    plugins: [
      react({
        babel: {
          plugins: isProduction ? [["transform-remove-console", { exclude: ["error", "warn"] }]] : [],
        },
      }),
    ],
    build: {
      outDir: "dist",
    },
  };
});
