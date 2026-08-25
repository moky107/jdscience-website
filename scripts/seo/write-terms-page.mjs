import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  TERMS_PAGE_DESCRIPTION,
  TERMS_PAGE_TITLE,
  TERMS_SECTIONS,
  TERMS_UPDATED,
  TERMS_VERSION,
} from "../../src/termsAndConditions.js";
import { escapeHtml, renderPublicPage } from "./html-chrome.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function buildTermsHtml() {
  const sections = TERMS_SECTIONS.map((section) => {
    const paragraphs = (section.paragraphs || []).map((item) => `<p>${escapeHtml(item)}</p>`).join("\n");
    const bullets = section.bullets?.length
      ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : "";
    const afterParagraphs = (section.afterParagraphs || []).map((item) => `<p>${escapeHtml(item)}</p>`).join("\n");
    return `<h2 id="${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2>\n${paragraphs}\n${bullets}\n${afterParagraphs}`;
  }).join("\n");

  const bodyHtml = `
    <p class="callout">Version ${escapeHtml(TERMS_VERSION)} · Last updated ${escapeHtml(TERMS_UPDATED)}. Anybody registering, applying as a tutor, or booking a session must agree to these terms before continuing.</p>
    ${sections}
    <p>Questions about these terms: <a href="mailto:info@jdscience.co.uk">info@jdscience.co.uk</a>.</p>
  `;

  return renderPublicPage({
    title: TERMS_PAGE_TITLE,
    description: TERMS_PAGE_DESCRIPTION,
    canonicalPath: "/terms/",
    heading: "Terms and Conditions",
    lede: "Please read these terms before you register, apply as a tutor, or book a session on JD Science.",
    breadcrumbs: [{ name: "Terms and Conditions", path: "/terms/" }],
    jsonLd: {
      "@type": "WebPage",
      name: "JD Science Terms and Conditions",
      url: "https://www.jdscience.co.uk/terms/",
    },
    bodyHtml,
  });
}

export function writeTermsPage(publicDir = path.join(root, "public")) {
  const full = path.join(publicDir, "terms", "index.html");
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, buildTermsHtml());
  return full;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out = writeTermsPage();
  console.log(`Wrote ${out}`);
}
