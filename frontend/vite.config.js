import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: mode === "production" ? [["transform-remove-console", { exclude: ["error", "warn"] }]] : [],
      },
    }),
  ],
  build: {
    outDir: "dist",
  },
});
