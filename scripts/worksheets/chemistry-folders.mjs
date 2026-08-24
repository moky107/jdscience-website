import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JD_SCIENCE_WORKSHEETS } from "../../src/jdScienceWorksheets.js";
import { isAnswerSheet } from "./catalog.mjs";
import { escapeHtml, renderPublicPage } from "../seo/html-chrome.mjs";

function unitNumberFromUrl(url) {
  const match = String(url || "").match(/\/unit-(\d+)\//i);
  return match ? Number(match[1]) : 0;
}

function writePage(root, relPath, html) {
  const full = path.join(root, "public", relPath.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

export function writeChemistryFolderIndexes(root, catalog) {
  const units = (catalog || []).filter((item) => (
    item.level === "GCSE/IGCSE"
    && item.subject === "Chemistry"
    && /\/unit-\d+\//.test(item.file_url_override || "")
  ));

  const byChem = new Map();
  for (const item of units) {
    const unitDir = item.file_url_override.replace(/\/[^/]+$/, "");
    const chemDir = unitDir.replace(/\/unit-\d+$/i, "");
    const n = unitNumberFromUrl(item.file_url_override);
    if (!byChem.has(chemDir)) byChem.set(chemDir, { board: item.exam_board, units: new Map() });
    const chem = byChem.get(chemDir);
    if (!chem.units.has(n)) chem.units.set(n, { dir: unitDir, worksheet: null, answers: null });
    const unit = chem.units.get(n);
    if (isAnswerSheet(item)) unit.answers = item;
    else unit.worksheet = item;
  }

  for (const [chemDir, chem] of byChem) {
    const unitList = [...chem.units.entries()].sort((a, b) => a[0] - b[0]);
    writePage(root, chemDir, renderPublicPage({
      title: `${chem.board} GCSE Chemistry unit worksheets | JD Science`,
      description: `${chem.board} GCSE Chemistry worksheets organised in unit folders, each with a separate answers sheet.`,
      canonicalPath: `${chemDir}/`,
      heading: `${chem.board} GCSE Chemistry`,
      lede: "Worksheets are in the unit folders. Open a unit for the student worksheet and the matching answers.",
      breadcrumbs: [
        { name: "Worksheets", path: "/worksheets/" },
        { name: chem.board, path: `${chemDir}/` },
      ],
      jsonLd: { "@type": "CollectionPage", name: `${chem.board} GCSE Chemistry unit worksheets`, url: `https://www.jdscience.co.uk${chemDir}/` },
      bodyHtml: `<p>These JD Science files follow the same layout as the Chemistry unit folders: <strong>Unit 1</strong>, <strong>Unit 2</strong>, <strong>Unit 3</strong> and so on, with the worksheet and answers kept separate inside each unit.</p>
        <div class="cards">${unitList.map(([n, unit]) => `<a class="card" href="${escapeHtml(unit.dir)}/"><strong>Unit ${n}</strong><span class="meta">Worksheet and answers</span></a>`).join("")}</div>`,
    }));

    for (const [n, unit] of unitList) {
      const links = [];
      if (unit.worksheet) {
        links.push(`<li><a href="${escapeHtml(unit.worksheet.file_url_override)}">${escapeHtml(unit.worksheet.title)}</a></li>`);
      }
      if (unit.answers) {
        links.push(`<li><a href="${escapeHtml(unit.answers.file_url_override)}">${escapeHtml(unit.answers.title)}</a></li>`);
      }
      writePage(root, unit.dir, renderPublicPage({
        title: `${chem.board} Chemistry Unit ${n} | JD Science`,
        description: `${chem.board} GCSE Chemistry Unit ${n} worksheet and separate answers from JD Science.`,
        canonicalPath: `${unit.dir}/`,
        heading: `Unit ${n}`,
        lede: "This unit folder contains the student worksheet and a separate answers sheet.",
        breadcrumbs: [
          { name: "Worksheets", path: "/worksheets/" },
          { name: chem.board, path: `${chemDir}/` },
          { name: `Unit ${n}`, path: `${unit.dir}/` },
        ],
        jsonLd: { "@type": "CollectionPage", name: `${chem.board} Chemistry Unit ${n}`, url: `https://www.jdscience.co.uk${unit.dir}/` },
        bodyHtml: `<ul>${links.join("")}</ul>`,
      }));
    }
  }

  return byChem.size;
}

const runningDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (runningDirect) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const count = writeChemistryFolderIndexes(root, JD_SCIENCE_WORKSHEETS);
  console.log(`Wrote Chemistry unit folder indexes for ${count} exam boards.`);
}
