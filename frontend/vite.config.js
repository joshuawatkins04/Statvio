import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [
      react({
        babel: {
          plugins:
            mode === "production" ? [["transform-remove-console", { exclude: ["error", "warn"] }]] : [],
        },
      }),
    ],
    build: {
      outDir: "dist",
    },
    define: {
      __SPOTIFY_DASHBOARD__: JSON.stringify(env.VITE_SPOTIFY_DASHBOARD),
      __SOUNDCLOUD_DASHBOARD__: JSON.stringify(env.VITE_SOUNDCLOUD_DASHBOARD),
      __AUTH_URL__: JSON.stringify(env.VITE_AUTH_URL),
      __AI_BASE_URL__: JSON.stringify(env.VITE_AI_BASE_URL),
      __SPOTIFY_BASE_URL__: JSON.stringify(env.VITE_SPOTIFY_BASE_URL),
      __SPOTIFY_AUTH_URL__: JSON.stringify(env.VITE_SPOTIFY_AUTH_URL),
      __SOUNDCLOUD_BASE_URL__: JSON.stringify(env.VITE_SOUNDCLOUD_BASE_URL),
      __SOUNDCLOUD_AUTH_URL__: JSON.stringify(env.VITE_SOUNDCLOUD_AUTH_URL),
      __PAYPAL_BASE_URL__: JSON.stringify(env.VITE_PAYPAL_BASE_URL),
      __PAYPAL_COMPLETE_ORDER_URL__: JSON.stringify(env.VITE_PAYPAL_COMPLETE_ORDER_URL),
      __AWS_UPLOAD_URL__: JSON.stringify(env.VITE_AWS_UPLOAD_URL),
    },
  };
});
