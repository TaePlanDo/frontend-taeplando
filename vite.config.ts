import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_DEV_API_PROXY_TARGET ?? "http://localhost:8000";
  const apiProxy = {
    "/api": {
      target: proxyTarget,
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/api/, ""),
    },
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Service worker + installability only apply after `npm run build` / `npm run preview` (disabled in `npm run dev`).
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["logo.png", "pwa-192x192.png", "pwa-512x512.png"],
        manifest: {
          name: "TaePlanDo",
          short_name: "TaePlanDo",
          lang: "pl",
          start_url: "/",
          display: "standalone",
          theme_color: "#f04a23",
          background_color: "#18181b",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
        workbox: {
          navigateFallback: "/index.html",
          // OAuth and API are real navigations/XHR - never rewrite them to the SPA shell.
          navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
      exclude: ["**/node_modules/**", "**/e2e/**", "**/dist/**"],
    },
    server: { proxy: apiProxy },
    // Needed for Google OAuth during `npm run preview`.
    preview: { proxy: apiProxy },
  };
});
