import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JD_SCIENCE_WORKSHEETS } from "../../src/jdScienceWorksheets.js";
import { isAnswerSheet, answersUrlFor } from "../worksheets/catalog.mjs";

const SITE = "https://www.jdscience.co.uk";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const worksheetsDir = path.join(root, "public", "worksheets");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isoDate(filePath) {
  try {
    return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function worksheetSeoBlock({ title, pathName, isAnswers }) {
  const topic = title
    .replace(/^JD Science answers\s*\|\s*/i, "")
    .replace(/^JD Science\s*\|\s*/i, "")
    .replace(/\s*[—-]\s*JD Science.*$/i, "")
    .trim();
  const description = isAnswers
    ? `Indicative answers and marking points for ${topic}. Original JD Science practice material for UK students, not an official exam paper.`
    : `Free original JD Science worksheet: ${topic}. Exam-style science and maths practice for GCSE, A-Level, T-Level and BTEC students in the UK.`;
  const canonical = `${SITE}${pathName}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: title,
    description,
    url: canonical,
    learningResourceType: isAnswers ? "Answer key" : "Worksheet",
    inLanguage: "en-GB",
    isAccessibleForFree: true,
    provider: {
      "@type": "EducationalOrganization",
      name: "JD Science",
      url: SITE,
    },
  };
  return `  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="JD Science" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${SITE}/og-image.png" />
  <meta property="og:locale" content="en_GB" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
`;
}

function patchWorksheetHtml(filePath) {
  let html = fs.readFileSync(filePath, "utf8");
  const rel = `/${path.relative(path.join(root, "public"), filePath).split(path.sep).join("/")}`;
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : "JD Science worksheet";
  const isAnswers = /-answers\.html$/i.test(filePath) || /answers/i.test(title);

  html = html.replace(/<html\s+lang="en">/i, '<html lang="en-GB">');

  if (!html.includes('rel="canonical"')) {
    html = html.replace(/<\/title>\s*/i, `</title>\n${worksheetSeoBlock({ title, pathName: rel, isAnswers })}`);
  }

  html = html.replace(
    /<div class="web">www\.jdscience\.co\.uk<\/div>/,
    '<div class="web"><a href="https://www.jdscience.co.uk">www.jdscience.co.uk</a> · <a href="https://www.jdscience.co.uk/worksheets/">Worksheets</a></div>',
  );

  if (!html.includes(".web a {")) {
    html = html.replace(
      ".web { color: var(--teal); font-size: 13px; font-weight: 700; }",
      ".web { color: var(--teal); font-size: 13px; font-weight: 700; }\n    .web a { color: inherit; text-decoration: none; }",
    );
  }

  // Resource pages are public — do not inject a login gate script.
  html = html.replace(/\s*<script[^>]*src=["']\/resource-gate\.js["'][^>]*>\s*<\/script>\s*/gi, "\n");

  fs.writeFileSync(filePath, html);
}

function walkHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith(".html") && entry.name !== "index.html") out.push(full);
  }
  return out;
}

function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, lastmod: today, changefreq: "weekly", priority: "1.0" },
    { loc: `${SITE}/papers`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE}/tutors`, lastmod: today, changefreq: "weekly", priority: "0.8" },
    { loc: `${SITE}/worksheets/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE}/about/`, lastmod: today, changefreq: "monthly", priority: "0.8" },
    { loc: `${SITE}/terms/`, lastmod: today, changefreq: "monthly", priority: "0.7" },
    { loc: `${SITE}/tutors/joseph-danso/`, lastmod: today, changefreq: "monthly", priority: "0.8" },
    { loc: `${SITE}/resources/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE}/resources/gcse/chemistry/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE}/resources/gcse/physics/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE}/resources/gcse/biology/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE}/resources/a-level/chemistry/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE}/resources/a-level/physics/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE}/resources/a-level/biology/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE}/resources/btec/applied-science/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE}/resources/t-level/science/`, lastmod: today, changefreq: "weekly", priority: "0.9" },
  ];

  function walkIndexPages(dir, baseUrl) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkIndexPages(full, `${baseUrl}${entry.name}/`);
      else if (entry.name === "index.html") {
        const loc = baseUrl.endsWith("/") ? `${SITE}${baseUrl}` : `${SITE}${baseUrl}/`;
        if (!urls.some((url) => url.loc === loc)) {
          const depth = baseUrl.split("/").filter(Boolean).length;
          urls.push({
            loc,
            lastmod: isoDate(full),
            changefreq: "monthly",
            priority: depth <= 3 ? "0.8" : "0.6",
          });
        }
      }
    }
  }
  walkIndexPages(path.join(root, "public", "about"), "/about/");
  walkIndexPages(path.join(root, "public", "terms"), "/terms/");
  walkIndexPages(path.join(root, "public", "tutors"), "/tutors/");
  walkIndexPages(path.join(root, "public", "resources"), "/resources/");
  walkIndexPages(path.join(root, "public", "worksheets"), "/worksheets/");

  for (const item of JD_SCIENCE_WORKSHEETS) {
    const loc = `${SITE}${item.file_url_override}`;
    const filePath = path.join(root, "public", item.file_url_override.replace(/^\//, ""));
    const isAnswers = isAnswerSheet(item);
    urls.push({
      loc,
      lastmod: isoDate(filePath),
      changefreq: "monthly",
      priority: isAnswers ? "0.5" : "0.7",
    });
  }

  const body = urls.map((url) => `  <url>
    <loc>${escapeHtml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  fs.writeFileSync(path.join(root, "public", "sitemap.xml"), xml);
  return urls.length;
}

function writeWorksheetHub() {
  const groups = new Map();
  for (const item of JD_SCIENCE_WORKSHEETS) {
    if (isAnswerSheet(item)) continue;
    const key = `${item.level}||${item.exam_board}||${item.subject}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  const sections = [];
  const levelOrder = ["GCSE/IGCSE", "A-Level", "T-Level", "BTEC"];
  const sortedKeys = [...groups.keys()].sort((a, b) => {
    const [levelA, boardA, subjectA] = a.split("||");
    const [levelB, boardB, subjectB] = b.split("||");
    const levelDiff = (levelOrder.indexOf(levelA) + 99) - (levelOrder.indexOf(levelB) + 99);
    if (levelDiff) return levelDiff;
    return `${boardA} ${subjectA}`.localeCompare(`${boardB} ${subjectB}`);
  });

  let currentLevel = "";
  for (const key of sortedKeys) {
    const [level, board, subject] = key.split("||");
    if (level !== currentLevel) {
      if (currentLevel) sections.push("</section>");
      sections.push(`<section><h2>${escapeHtml(level)} worksheets</h2>`);
      currentLevel = level;
    }
    const items = groups.get(key);
    sections.push(`<h3>${escapeHtml(board)} ${escapeHtml(subject)}</h3><ul>`);
    for (const item of items) {
      const answers = JD_SCIENCE_WORKSHEETS.find((other) => (
        isAnswerSheet(other)
        && other.exam_board === item.exam_board
        && other.level === item.level
        && other.subject === item.subject
        && other.file_url_override === answersUrlFor(item)
      ));
      const topic = item.title.replace(/\s*[—-]\s*JD Science.*$/i, "").trim();
      const answerLink = answers
        ? ` <a class="answers" href="${escapeHtml(answers.file_url_override)}">${escapeHtml(answers.title.startsWith("Unit ") ? answers.title.split(" — ")[0] : "Answers")}</a>`
        : "";
      sections.push(`<li><a href="${escapeHtml(item.file_url_override)}">${escapeHtml(topic)}</a>${answerLink}</li>`);
    }
    sections.push("</ul>");
  }
  if (currentLevel) sections.push("</section>");

  const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Free GCSE, A-Level and T-Level Science Worksheets | JD Science</title>
  <meta name="description" content="Browse free original JD Science topic worksheets and answer sheets for GCSE, IGCSE, A-Level, T-Level and BTEC Biology, Chemistry, Physics, Maths and vocational science." />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${SITE}/worksheets/" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="JD Science" />
  <meta property="og:title" content="Free science and maths worksheets | JD Science" />
  <meta property="og:description" content="Original exam-style worksheets for GCSE, A-Level, T-Level and BTEC science and maths." />
  <meta property="og:url" content="${SITE}/worksheets/" />
  <meta property="og:image" content="${SITE}/og-image.png" />
  <meta property="og:locale" content="en_GB" />
  <meta name="twitter:card" content="summary_large_image" />
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #0f172a; background: #f8fafc; }
    header { background: #004d40; color: #fff; padding: 28px 18px; }
    header a { color: #99f6e4; }
    main { max-width: 960px; margin: 0 auto; padding: 28px 18px 64px; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    h2 { color: #004d40; margin: 36px 0 12px; }
    h3 { margin: 18px 0 8px; font-size: 18px; }
    p { line-height: 1.6; color: #334155; }
    ul { margin: 0 0 8px; padding-left: 20px; }
    li { margin: 6px 0; line-height: 1.5; }
    a { color: #0f766e; }
    .answers { color: #64748b; font-size: 13px; }
    nav { margin-top: 10px; }
  </style>
</head>
<body>
  <header>
      <nav><a href="/">JD Science home</a> · <a href="/about/">About</a> · <a href="/terms/">Terms</a> · <a href="/tutors/joseph-danso/">Joseph Danso</a> · <a href="/resources/">Resources</a> · <a href="/papers">Past papers</a> · <a href="/tutors">Find a tutor</a></nav>
    <h1>Free science and maths worksheets</h1>
    <p style="color:#ccfbf1;max-width:720px">Original JD Science topic worksheets for GCSE, IGCSE, A-Level, T-Level and BTEC. Every question is newly written for tutoring and revision — not copied from official exam papers.</p>
  </header>
  <main>
    <p>Use these worksheets to practise Biology, Chemistry, Physics, Maths and vocational science topics. Each worksheet has a separate answer sheet. For tutoring, past papers and more revision resources visit <a href="/">jdscience.co.uk</a>.</p>
    ${sections.join("\n")}
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(worksheetsDir, "index.html"), html);
}

const files = walkHtml(worksheetsDir);
for (const file of files) patchWorksheetHtml(file);
const urlCount = writeSitemap();
writeWorksheetHub();
console.log(`Patched ${files.length} worksheets, wrote sitemap with ${urlCount} URLs, and built /worksheets/ index.`);
