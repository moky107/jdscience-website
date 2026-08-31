/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PAGE = "https://resources.eduqas.co.uk/Pages/ResourceSingle.aspx?rIid=1537";
const OUT_FILE = path.join(__dirname, "../src/eduqasGcseMathematicsWalkthroughs.js");

function decodeHtml(value) {
  return String(value || "")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseWalkthroughLinks(html) {
  const decoded = decodeHtml(html);
  const pattern = /<a href='([^']+\.pptx)'[^>]*>([^<]+)<\/a>/gi;
  const items = [];
  let match = pattern.exec(decoded);
  while (match) {
    items.push({ url: match[1], label: match[2].trim() });
    match = pattern.exec(decoded);
  }
  return items;
}

function tierFromLabel(label) {
  if (/Higher/i.test(label)) return "Higher";
  if (/Foundation/i.test(label)) return "Foundation";
  return "";
}

function componentFromLabel(label) {
  const match = String(label).match(/Component\s+([12])/i);
  return match ? Number(match[1]) : null;
}

function yearFromLabel(label) {
  const match = String(label).match(/\((Summer|Autumn)\s+(\d{4})\)/i);
  if (!match) return { series: "", year: "" };
  return { series: match[1], year: match[2] };
}

function buildTitle(label) {
  const tier = tierFromLabel(label);
  const component = componentFromLabel(label);
  const { series, year } = yearFromLabel(label);
  const tierLabel = tier ? `${tier} ` : "";
  const componentLabel = component ? `Component ${component} ` : "";
  const seasonYear = series && year ? `${series} ${year}` : year || "Eduqas";
  return `Eduqas GCSE Mathematics ${tierLabel}${componentLabel}Exam Walkthrough — ${seasonYear}`.replace(/\s+/g, " ").trim();
}

function fileNameFromUrl(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() || "walkthrough.pptx");
  } catch {
    return "walkthrough.pptx";
  }
}

export function buildEduqasGcseMathematicsWalkthroughs(links) {
  return links.map(({ url, label }) => ({
    level: "GCSE/IGCSE",
    subject: "Maths",
    exam_board: "Eduqas",
    resource_category: "Videos",
    title: buildTitle(label),
    file_name: fileNameFromUrl(url),
    series_label: "Exam walkthroughs",
    file_url_override: url,
    description: "Official Eduqas/WJEC exam walkthrough PowerPoint with audio. External link opens Eduqas/WJEC resource.",
    source_attribution: "Official Eduqas/WJEC",
    source_page: SOURCE_PAGE,
  }));
}

function renderModule(resources) {
  return `/* Official Eduqas GCSE Mathematics exam walkthrough PowerPoints (with audio).
   Source hub: ${SOURCE_PAGE}
   Files remain on WJEC's public resource download service — not copied into this repo.
   Regenerate with: node scripts/eduqas-gcse-maths-walkthroughs-sync.mjs */

export const EDUQAS_GCSE_MATHEMATICS_WALKTHROUGHS = ${JSON.stringify(resources, null, 2)
  .replace(/"([^"]+)":/g, "$1:")
  .replace(/\\u2014/g, "—")};
`;
}

async function main() {
  const response = await fetch(SOURCE_PAGE, {
    headers: { "User-Agent": "JDScience-resource-sync/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Eduqas walkthrough page request failed: ${response.status}`);
  }

  const html = await response.text();
  const links = parseWalkthroughLinks(html);
  if (links.length === 0) {
    throw new Error("No walkthrough PowerPoint links found on Eduqas resource page");
  }

  const resources = buildEduqasGcseMathematicsWalkthroughs(links);
  fs.writeFileSync(OUT_FILE, renderModule(resources));
  console.log(`Wrote ${resources.length} Eduqas GCSE Mathematics walkthroughs to ${OUT_FILE}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
