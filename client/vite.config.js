import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Bihar Disaster Risk & Relocation Intelligence",
        short_name: "DisasterRelocate",
        description:
          "Scenario-based flood risk and relocation decision-support prototype for the Koshi river basin, Bihar.",
        theme_color: "#0f3d5c",
        background_color: "#f4f6f8",
        display: "standalone",
        start_url: "/public",
        icons: [
          { src: "pwa-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "pwa-512.svg", sizes: "512x512", type: "image/svg+xml" }
        ]
      },
      workbox: {
        // Runtime caching for the read-only public-mode API calls, so
        // previously viewed village/risk/safe-location data is available
        // offline. Authority-mode write actions are never cached.
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === "GET" &&
              (url.pathname.startsWith("/api/villages") ||
                url.pathname.startsWith("/api/services") ||
                url.pathname.startsWith("/api/districts") ||
                url.pathname.startsWith("/api/floodzones") ||
                url.pathname.startsWith("/api/river") ||
                url.pathname.startsWith("/api/dashboard")),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 3 },
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: ({ url }) => url.hostname.includes("tile.openstreetmap.org"),
            handler: "CacheFirst",
            options: {
              cacheName: "map-tiles",
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 14 }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      }
    }
  }
});
