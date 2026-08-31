/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUALIFICATION_ID = "38449";
const API_URL = `https://www.eduqas.co.uk/umbraco/surface/TabSurface/GetPastPapersTab?qualificationId=${QUALIFICATION_ID}&cultureId=en-GB`;
const OUT_FILE = path.join(__dirname, "../src/eduqasGcseMathematicsResources.js");

function decodeHtml(value) {
  return String(value || "")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseListItems(html) {
  const decoded = decodeHtml(html);
  const marker = "\"listItems\":";
  const start = decoded.indexOf(marker);
  if (start < 0) throw new Error("Could not find listItems in Eduqas past-papers response");

  let index = start + marker.length;
  while (decoded[index] === " ") index += 1;
  if (decoded[index] !== "[") throw new Error("Expected listItems array");

  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = index;

  for (; end < decoded.length; end += 1) {
    const char = decoded[end];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === "\"") inString = false;
      continue;
    }
    if (char === "\"") inString = true;
    else if (char === "[") depth += 1;
    else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }

  return JSON.parse(decoded.slice(index, end));
}

function encodeOfficialUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.pathname = parsed.pathname
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");
    return parsed.toString();
  } catch {
    return url;
  }
}

function fileNameFromUrl(url) {
  const segment = url.split("/").pop() || "resource.pdf";
  return decodeURIComponent(segment);
}

function parseComponentMeta(fileName) {
  const text = String(fileName || "");
  const componentMatch = text.match(/Component\s+([12])/i);
  const component = componentMatch ? Number(componentMatch[1]) : null;
  const tier = /Higher/i.test(text)
    ? "Higher"
    : /Foundation|Found Noncalculato|Found Calculator/i.test(text)
      ? "Foundation"
      : "";
  const resourceInsert = /\[Resource\]/i.test(text) || /\[Braille Text\]/i.test(text);
  const braille = /\[Braille Text\]/i.test(text);
  return { component, tier, resourceInsert, braille };
}

function mapCategory(productReference) {
  if (productReference === "Past Paper") return "Past Questions";
  if (productReference === "Mark Scheme") return "Mark Schemes";
  if (productReference === "Examiner Report") return "Examiner Reports";
  return null;
}

function buildTitle({ productReference, fileName, year }) {
  const { component, tier, resourceInsert, braille } = parseComponentMeta(fileName);
  const typeLabel = productReference === "Mark Scheme"
    ? "Mark Scheme"
    : productReference === "Examiner Report"
      ? "Examiner Report"
      : "Past Paper";
  const suffix = braille
    ? " (Braille)"
    : resourceInsert && !braille
      ? " (Resource Insert)"
      : "";
  const tierLabel = tier ? `${tier} ` : "";
  const componentLabel = component ? `Component ${component} ` : "";
  return `Eduqas GCSE Mathematics ${tierLabel}${componentLabel}${typeLabel} — ${year}${suffix}`.replace(/\s+/g, " ").trim();
}

function buildSeriesLabel(series, year) {
  const season = String(series || "").trim();
  const yr = String(year || "").trim();
  if (!season || !yr) return season || yr || "Eduqas GCSE Mathematics";
  return `${season} ${yr}`;
}

function buildDescription(productReference) {
  if (productReference === "Mark Scheme") {
    return "Official Eduqas/WJEC mark scheme. External link opens Eduqas/WJEC resource.";
  }
  if (productReference === "Examiner Report") {
    return "Official Eduqas/WJEC examiner report. External link opens Eduqas/WJEC resource.";
  }
  return "Official Eduqas/WJEC past paper. External link opens Eduqas/WJEC resource.";
}

function shouldInclude(item) {
  if (!item?.Url) return false;
  if (item.ProductReference === "Modified Paper") return false;
  if (/\[Braille Text\]/i.test(item.FileName || "")) return false;
  if (!mapCategory(item.ProductReference)) return false;
  return true;
}

function dedupeKey(entry) {
  return [
    entry.series_label,
    entry.resource_category,
    entry.title,
    entry.file_url_override,
  ].join("|");
}

export function buildEduqasGcseMathematicsResources(items) {
  const resources = [];
  const seen = new Set();

  for (const item of items.filter(shouldInclude)) {
    const resource_category = mapCategory(item.ProductReference);
    const file_url_override = encodeOfficialUrl(item.Url);
    const entry = {
      level: "GCSE/IGCSE",
      subject: "Maths",
      exam_board: "Eduqas",
      resource_category,
      title: buildTitle({
        productReference: item.ProductReference,
        fileName: item.FileName,
        year: item.Year,
      }),
      file_name: fileNameFromUrl(file_url_override),
      series_label: buildSeriesLabel(item.Series, item.Year),
      file_url_override,
      description: buildDescription(item.ProductReference),
      source_attribution: "Official Eduqas/WJEC",
    };

    const key = dedupeKey(entry);
    if (seen.has(key)) continue;
    seen.add(key);
    resources.push(entry);
  }

  resources.sort((a, b) => {
    const series = a.series_label.localeCompare(b.series_label);
    if (series !== 0) return series;
    const category = a.resource_category.localeCompare(b.resource_category);
    if (category !== 0) return category;
    return a.title.localeCompare(b.title);
  });

  return resources;
}

function renderModule(resources) {
  return `/* Official Eduqas GCSE Mathematics past papers and mark schemes.
   Generated from the Eduqas qualification past-papers tab (qualificationId ${QUALIFICATION_ID}).
   Links use WJEC's public pastpapers.download.wjec.co.uk filestore — exam PDFs are not copied into this repo.
   Regenerate with: node scripts/eduqas-gcse-maths-sync.mjs */

export const EDUQAS_GCSE_MATHEMATICS_RESOURCES = ${JSON.stringify(resources, null, 2)
  .replace(/"([^"]+)":/g, "$1:")
  .replace(/\\u2014/g, "—")};
`;
}

async function main() {
  const response = await fetch(API_URL, {
    headers: { "User-Agent": "JDScience-resource-sync/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Eduqas past-papers request failed: ${response.status}`);
  }

  const html = await response.text();
  const items = parseListItems(html);
  const resources = buildEduqasGcseMathematicsResources(items);

  fs.writeFileSync(OUT_FILE, renderModule(resources));

  const counts = resources.reduce((acc, item) => {
    acc[item.resource_category] = (acc[item.resource_category] || 0) + 1;
    return acc;
  }, {});

  console.log(`Wrote ${resources.length} Eduqas GCSE Mathematics resources to ${OUT_FILE}`);
  console.log(counts);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
