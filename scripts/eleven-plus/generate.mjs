import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import { PAPER_BUILDERS } from "./build-html.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outRoot = path.join(root, "public", "resources", "11plus");
const htmlRoot = path.join(root, "scripts", "eleven-plus", "html-preview");
const chromePath = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function htmlToPdf(browser, htmlPath, pdfPath) {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", right: "12mm", bottom: "14mm", left: "12mm" },
    displayHeaderFooter: false,
  });
  await page.close();
}

async function countPdfPages(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  const text = buf.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  if (matches?.length) return matches.length;
  const alt = text.match(/\/Count\s+(\d+)/);
  return alt ? Number(alt[1]) : null;
}

export async function generateElevenPlusPdfs() {
  ensureDir(htmlRoot);
  ensureDir(outRoot);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
    headless: true,
  });

  const manifest = [];
  try {
    for (const paper of PAPER_BUILDERS) {
      const subjectDir = path.join(outRoot, paper.subjectSlug);
      ensureDir(path.join(subjectDir, "practice-papers"));
      ensureDir(path.join(subjectDir, "answers"));

      const paperHtml = paper.buildPaper();
      const answersHtml = paper.buildAnswers();
      const paperHtmlPath = path.join(htmlRoot, `${paper.fileBase}.html`);
      const answersHtmlPath = path.join(htmlRoot, `${paper.fileBase}-answers.html`);
      const paperPdfPath = path.join(subjectDir, "practice-papers", `${paper.fileBase}.pdf`);
      const answersPdfPath = path.join(subjectDir, "answers", `${paper.fileBase}-answers.pdf`);

      fs.writeFileSync(paperHtmlPath, paperHtml);
      fs.writeFileSync(answersHtmlPath, answersHtml);
      await htmlToPdf(browser, paperHtmlPath, paperPdfPath);
      await htmlToPdf(browser, answersHtmlPath, answersPdfPath);

      const paperPages = await countPdfPages(paperPdfPath);
      const answersPages = await countPdfPages(answersPdfPath);

      manifest.push({
        subject: paper.subject,
        title: paper.title,
        kind: "paper",
        localPath: paperPdfPath,
        publicPath: `/resources/11plus/${paper.subjectSlug}/practice-papers/${paper.fileBase}.pdf`,
        pages: paperPages,
        category: "Past Questions",
      });
      manifest.push({
        subject: paper.subject,
        title: paper.answersTitle,
        kind: "answers",
        localPath: answersPdfPath,
        publicPath: `/resources/11plus/${paper.subjectSlug}/answers/${paper.fileBase}-answers.pdf`,
        pages: answersPages,
        category: "Mark Schemes",
      });

      console.log(`Generated ${paper.fileBase}.pdf (${paperPages} pages) and answers (${answersPages} pages)`);
    }
  } finally {
    await browser.close();
  }

  const manifestPath = path.join(outRoot, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateElevenPlusPdfs()
    .then((manifest) => {
      console.log(`Wrote ${manifest.length} PDFs`);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
