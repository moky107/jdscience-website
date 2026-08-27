import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const robots = fs.readFileSync(path.join(root, "public", "robots.txt"), "utf8");
const client = fs.readFileSync(path.join(root, "src", "supabaseClient.js"), "utf8");
const app = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");

const apexRedirect = vercel.redirects.find((item) => item.has?.[0]?.value === "jdscience.co.uk");
assert.ok(apexRedirect, "apex → www redirect required");
assert.equal(apexRedirect.destination, "https://www.jdscience.co.uk/:path*");
assert.equal(apexRedirect.statusCode, 308);

const globalHeaders = vercel.headers.find((item) => item.source === "/(.*)")?.headers || [];
const headerMap = Object.fromEntries(globalHeaders.map((item) => [item.key, item.value]));
assert.match(headerMap["Strict-Transport-Security"], /max-age=63072000/);
assert.equal(headerMap["X-Content-Type-Options"], "nosniff");
assert.equal(headerMap["Referrer-Policy"], "strict-origin-when-cross-origin");
assert.match(headerMap["Permissions-Policy"], /camera=\(\)/);
assert.equal(headerMap["X-Frame-Options"], "DENY");
assert.match(headerMap["Content-Security-Policy"], /frame-ancestors 'none'/);
assert.match(headerMap["Content-Security-Policy"], /https:\/\/\*\.supabase\.co/);
assert.match(headerMap["Content-Security-Policy"], /share\.synthesia\.io/);
assert.match(headerMap["Content-Security-Policy"], /youtube-nocookie\.com/);
assert.match(headerMap["Content-Security-Policy"], /checkout\.stripe\.com/);
assert.doesNotMatch(headerMap["Content-Security-Policy"], /default-src \*/);

assert.match(robots, /Sitemap: https:\/\/www\.jdscience\.co\.uk\/sitemap\.xml/);
assert.match(robots, /Disallow: \/auth\//);
assert.match(robots, /Disallow: \/api\//);
assert.match(robots, /Disallow: \/\*\?admin=1/);
assert.match(robots, /Disallow: \/\*&admin=1/);

assert.match(indexHtml, /rel="canonical" href="https:\/\/www\.jdscience\.co\.uk\/"/);
assert.doesNotMatch(client, /import\.meta\.env\.SUPABASE_SERVICE_ROLE_KEY/);
assert.doesNotMatch(app, /ResourceAccessGate|resourceLibraryLocked/);
assert.match(app, /Browse and download resources freely/);

const sitemap = fs.readFileSync(path.join(root, "public", "sitemap.xml"), "utf8");
assert.match(sitemap, /https:\/\/www\.jdscience\.co\.uk\//);
assert.doesNotMatch(sitemap, /https?:\/\/jdscience\.co\.uk\//);
assert.doesNotMatch(sitemap, /localhost|vercel\.app/);

console.log("security-headers.test.mjs: ok");
