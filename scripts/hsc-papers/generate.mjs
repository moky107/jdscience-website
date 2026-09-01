import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UNIT1_PAPERS } from "./unit1.mjs";
import { UNIT2_PAPERS } from "./unit2.mjs";
import { renderHscPaperHtml } from "./render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicRoot = path.join(root, "public", "resources", "btec-level-3", "health-and-social-care");
const tmpRoot = path.join(root, "scripts", "hsc-papers", ".tmp-html");

export const ALL_HSC_PAPERS = [...UNIT1_PAPERS, ...UNIT2_PAPERS];

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
  fs.mkdirSync(publicRoot, { recursive: true });
  const chrome = chromeBin();
  const written = [];

  for (const paper of ALL_HSC_PAPERS) {
    const variants = [
      { file: paper.studentFile, markScheme: false },
      { file: paper.markSchemeFile, markScheme: true },
    ];
    for (const variant of variants) {
      const html = renderHscPaperHtml(paper, { markScheme: variant.markScheme });
      const stem = variant.file.replace(/\.pdf$/i, "");
      const htmlPath = path.join(tmpRoot, `${stem}.html`);
      const pdfPath = path.join(publicRoot, variant.file);
      fs.writeFileSync(htmlPath, html);
      htmlToPdf(chrome, htmlPath, pdfPath, `chrome-${stem}`);
      const stat = fs.statSync(pdfPath);
      written.push({
        file: variant.file,
        bytes: stat.size,
        path: `/resources/btec-level-3/health-and-social-care/${variant.file}`,
      });
      console.log(`Wrote ${written[written.length - 1].path} (${stat.size} bytes)`);
    }
  }

  console.log(`Generated ${written.length} HSC PDFs`);
  return written;
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  main();
}
