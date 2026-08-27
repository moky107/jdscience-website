import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MATHS_PAPERS } from "./maths.mjs";
import { ENGLISH_PAPERS } from "./english.mjs";
import { VERBAL_PAPERS } from "./verbal.mjs";
import { NVR_PAPERS } from "./nvr.mjs";
import { MIXED_PAPERS, PARENT_GUIDE } from "./mixed.mjs";
import { SERIES2_PAPERS } from "./series2.mjs";
import { renderPaperHtml } from "./render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicRoot = path.join(root, "public", "resources", "11-plus");
const tmpRoot = path.join(root, "scripts", "eleven-plus", ".tmp-html");

export const ALL_11PLUS_PAPERS = [
  ...MATHS_PAPERS,
  ...ENGLISH_PAPERS,
  ...VERBAL_PAPERS,
  ...NVR_PAPERS,
  ...MIXED_PAPERS,
  PARENT_GUIDE,
  ...SERIES2_PAPERS,
];

function chromeBin() {
  const candidates = [
    "/opt/google/chrome/chrome",
    "/usr/bin/google-chrome-stable",
    "google-chrome",
    "chrome",
    "chromium",
    "chromium-browser",
  ];
  for (const bin of candidates) {
    if (bin.startsWith("/")) {
      if (fs.existsSync(bin)) return bin;
      continue;
    }
    const found = spawnSync("which", [bin], { encoding: "utf8" });
    if (found.status === 0) return found.stdout.trim();
  }
  throw new Error("Chrome/Chromium not found for PDF generation");
}

function htmlToPdf(chrome, htmlPath, pdfPath, profileName) {
  const profile = path.join(tmpRoot, profileName || "chrome-profile");
  fs.mkdirSync(profile, { recursive: true });
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profile}`,
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ], { encoding: "utf8", timeout: 90000 });
  if (result.error) throw result.error;
  if (!fs.existsSync(pdfPath) || fs.statSync(pdfPath).size < 2000) {
    throw new Error(`PDF failed for ${pdfPath}: ${result.stderr || result.stdout || result.status}`);
  }
}

export function main() {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  fs.mkdirSync(tmpRoot, { recursive: true });
  const chrome = chromeBin();
  const written = [];
  const onlySeries2 = process.argv.includes("--series2");
  const papers = onlySeries2 ? SERIES2_PAPERS : ALL_11PLUS_PAPERS;

  for (const paper of papers) {
    const folder = path.join(publicRoot, paper.folder);
    fs.mkdirSync(folder, { recursive: true });
    const html = renderPaperHtml(paper);
    const htmlPath = path.join(tmpRoot, `${paper.id}.html`);
    const pdfPath = path.join(folder, paper.file);
    fs.writeFileSync(htmlPath, html);
    htmlToPdf(chrome, htmlPath, pdfPath, `chrome-${paper.id}`);
    const stat = fs.statSync(pdfPath);
    if (stat.size < 2000) throw new Error(`${paper.file} looks too small (${stat.size} bytes)`);
    written.push({ file: paper.file, bytes: stat.size, path: `/resources/11-plus/${paper.folder}/${paper.file}` });
    console.log(`Wrote ${written[written.length - 1].path} (${stat.size} bytes)`);
  }

  fs.writeFileSync(
    path.join(tmpRoot, "manifest.json"),
    JSON.stringify(written, null, 2),
  );
  console.log(`Generated ${written.length} 11+ PDFs`);
  return written;
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  main();
}
