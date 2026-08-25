import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function servePublicHtml(url, relativeFile) {
  const file = path.resolve(relativeFile);
  return {
    name: `serve-${url.replace(/\W+/g, "-")}`,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathName = decodeURIComponent((req.url || "").split("?")[0]);
        if (pathName !== url && pathName !== `${url}/`) return next();
        if (!fs.existsSync(file)) return next();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(fs.readFileSync(file));
      });
    },
  };
}

export default defineConfig({
  plugins: [
    servePublicHtml("/terms", "public/terms/index.html"),
    servePublicHtml("/about", "public/about/index.html"),
    react(),
  ],
  server: { host: true },
  preview: { host: true },
});
