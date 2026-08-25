import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function serveDirectoryIndex(url, file) {
  return {
    name: "serve-directory-index",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const pathName = decodeURIComponent((req.url || "").split("?")[0]);
        if (pathName === url || pathName === `${url}/`) {
          req.url = file;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    serveDirectoryIndex("/terms", "/terms/index.html"),
    serveDirectoryIndex("/about", "/about/index.html"),
    react(),
  ],
  server: { host: true },
  preview: { host: true },
});
