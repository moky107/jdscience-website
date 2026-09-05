import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  parseDateRange,
  sanitizeAnalyticsEvent,
} from "./api/_lib/analytics.js";
import { aggregateAnalyticsDashboard } from "./api/_lib/analyticsAggregate.js";

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

const localEvents = [];

function readJsonBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

function localAnalyticsApi() {
  return {
    name: "local-analytics-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || "").split("?")[0];
        if (req.method === "POST" && url === "/api/analytics-event") {
          const body = await readJsonBody(req);
          const events = Array.isArray(body.events) ? body.events : [body];
          for (const event of events) {
            const result = sanitizeAnalyticsEvent(event, { userAgent: req.headers["user-agent"] || "" });
            if (result.ok) {
              localEvents.push({ ...result.row, created_at: new Date().toISOString(), id: crypto.randomUUID() });
            }
          }
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method === "POST" && url === "/api/admin-analytics") {
          const body = await readJsonBody(req);
          if (!body.password) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Incorrect password." }));
            return;
          }
          const range = parseDateRange({
            range: body.range || "last_30_days",
            start: body.start,
            end: body.end,
          });
          const seed = localEvents.length ? localEvents : [
            {
              id: "1",
              event_name: "page_view",
              anonymous_visitor_id: "v1",
              session_id: "s1",
              page_path: "/",
              source: "Google organic search",
              medium: "organic",
              created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
              is_admin: false,
              metadata: {},
            },
            {
              id: "2",
              event_name: "page_view",
              anonymous_visitor_id: "v2",
              session_id: "s2",
              page_path: "/shop/my-chemistry-companion",
              source: "Facebook",
              medium: "social",
              campaign: "companion-launch",
              created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
              is_admin: false,
              metadata: {},
            },
            {
              id: "3",
              event_name: "product_view",
              anonymous_visitor_id: "v2",
              session_id: "s2",
              page_path: "/shop/my-chemistry-companion",
              product_id: "503d4625-94df-4d80-b6d0-7c06cebdf693",
              source: "Facebook",
              created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
              is_admin: false,
              metadata: { title: "My Chemistry Companion", product_slug: "my-chemistry-companion" },
            },
            {
              id: "4",
              event_name: "amazon_book_click",
              anonymous_visitor_id: "v2",
              session_id: "s2",
              page_path: "/shop/my-chemistry-companion",
              product_id: "503d4625-94df-4d80-b6d0-7c06cebdf693",
              source: "Facebook",
              device_category: "mobile",
              created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
              is_admin: false,
              metadata: { is_chemistry_companion: true, product_slug: "my-chemistry-companion" },
            },
            {
              id: "5",
              event_name: "resource_download",
              anonymous_visitor_id: "v1",
              session_id: "s1",
              page_path: "/papers",
              resource_id: "gcse-chem-notes",
              source: "Google organic search",
              created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
              is_admin: false,
              metadata: { title: "GCSE Chemistry Revision Notes", level: "GCSE/IGCSE", subject: "Chemistry", resource_type: "Revision Notes" },
            },
            {
              id: "6",
              event_name: "resource_view",
              anonymous_visitor_id: "v1",
              session_id: "s1",
              page_path: "/papers",
              resource_id: "gcse-chem-notes",
              source: "Google organic search",
              created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
              is_admin: false,
              metadata: { title: "GCSE Chemistry Revision Notes", level: "GCSE/IGCSE", subject: "Chemistry", resource_type: "Revision Notes" },
            },
            {
              id: "7",
              event_name: "add_to_cart",
              anonymous_visitor_id: "v2",
              session_id: "s2",
              page_path: "/shop",
              product_id: "p2",
              source: "Facebook",
              created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
              is_admin: false,
              metadata: { title: "BTEC Unit 1 Worksheet Pack" },
            },
            {
              id: "8",
              event_name: "tutor_profile_view",
              anonymous_visitor_id: "v3",
              session_id: "s3",
              page_path: "/tutors",
              tutor_id: "joseph-danso",
              source: "Direct",
              created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
              is_admin: false,
              metadata: { tutor_name: "Joseph Danso" },
            },
          ];
          const dashboard = aggregateAnalyticsDashboard({
            events: seed,
            range,
            shopOrders: [],
            shopProducts: [
              { id: "503d4625-94df-4d80-b6d0-7c06cebdf693", title: "My Chemistry Companion", product_type: "Revision Notes" },
              { id: "p2", title: "BTEC Unit 1 Worksheet Pack", product_type: "Worksheet" },
            ],
            bookings: [
              { id: "b1", subject: "Chemistry", level: "GCSE/IGCSE", status: "confirmed", created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
            ],
            searchConsoleConnected: false,
          });
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, dashboard }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    servePublicHtml("/terms", "public/terms/index.html"),
    servePublicHtml("/about", "public/about/index.html"),
    localAnalyticsApi(),
    react(),
  ],
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  server: { host: true },
  preview: { host: true },
});
