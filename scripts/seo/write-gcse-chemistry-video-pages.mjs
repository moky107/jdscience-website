#!/usr/bin/env node
/** Write GCSE Chemistry video SEO pages from the live catalog. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GCSE_CHEMISTRY_VIDEOS, GCSE_CHEMISTRY_LESSON_VIDEOS } from "../../src/gcseChemistryVideos.js";
import { SITE_ORIGIN } from "../../src/educatorProfile.js";
import { escapeHtml, renderPublicPage } from "./html-chrome.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = path.join(root, "public");

function writePage(relPath, html) {
  const full = path.join(publicDir, relPath, "index.html");
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

function card(href, title, text, image) {
  return `<a class="card" href="${escapeHtml(href)}">${image ? `<img class="card-thumb" src="${escapeHtml(image)}" alt="" />` : ""}<strong>${escapeHtml(title)}</strong><span class="meta">${escapeHtml(text)}</span></a>`;
}

function videoHtml(item) {
  if (item.embed_url) {
    return `<p><a class="download" href="${escapeHtml(item.embed_url)}">Watch ${escapeHtml(item.title)}</a></p>`;
  }
  const captions = item.caption_url
    ? `<track kind="captions" src="${escapeHtml(item.caption_url)}" srclang="en" label="English" default />`
    : "";
  return `
            <style>
              .lesson-video { margin: 0 0 24px; background: #0f172a; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 16px rgba(15,23,42,.05); }
              .lesson-video video { display: block; width: 100%; aspect-ratio: 16 / 9; background: #000; }
              .lesson-video figcaption { background: #fff; padding: 10px 14px; }
              .lesson-video figcaption .download { margin: 0; }
            </style>
            <figure class="lesson-video">
              <video controls playsinline preload="metadata"${item.poster_url ? ` poster="${escapeHtml(item.poster_url)}"` : ""} title="${escapeHtml(item.title)}"${item.caption_url ? " crossorigin=\"anonymous\"" : ""}>
                <source src="${escapeHtml(item.file_url_override)}" type="video/mp4" />
                ${captions}
              </video>
              <figcaption><a class="download" href="${escapeHtml(item.file_url_override)}" download>Download ${escapeHtml(item.title)} (MP4)</a></figcaption>
            </figure>`;
}

function main() {
  const indexPath = "resources/gcse/chemistry/videos";
  const cards = GCSE_CHEMISTRY_VIDEOS.map((item) => card(
    `/resources/gcse/chemistry/videos/${item.topicSlug || "key-concepts-in-chemistry"}/`,
    item.title,
    item.description || `${item.title} GCSE Chemistry Videos`,
    item.poster_url,
  )).join("");

  writePage(indexPath, renderPublicPage({
    title: "GCSE Chemistry Videos | JD Science",
    description: "Original JD Science GCSE Chemistry lessons with captions, exam-style questions and model answers.",
    canonicalPath: `/${indexPath}/`,
    heading: "GCSE Chemistry videos",
    lede: "Original JD Science lessons. Watch on this page, or download the MP4.",
    breadcrumbs: [
      { name: "Resources", path: "/resources/" },
      { name: "GCSE", path: "/resources/gcse/" },
      { name: "Chemistry", path: "/resources/gcse/chemistry/" },
      { name: "Videos", path: `/${indexPath}/` },
    ],
    jsonLd: {
      "@type": "CollectionPage",
      name: "GCSE Chemistry Videos",
      url: `${SITE_ORIGIN}/${indexPath}/`,
    },
    bodyHtml: `<p>These lessons sit beside the GCSE Biology videos and do not replace them.</p><div class="cards">${cards}</div>`,
  }));

  for (const item of GCSE_CHEMISTRY_VIDEOS) {
    const slug = item.topicSlug || "key-concepts-in-chemistry";
    const topicPath = `resources/gcse/chemistry/videos/${slug}`;
    const siblings = GCSE_CHEMISTRY_LESSON_VIDEOS.filter((other) => other.topicSlug !== item.topicSlug)
      .map((other) => card(
        `/resources/gcse/chemistry/videos/${other.topicSlug}/`,
        other.title,
        other.description,
        other.poster_url,
      )).join("");
    writePage(topicPath, renderPublicPage({
      title: `${item.title} GCSE Chemistry Videos | JD Science`,
      description: item.description || `${item.title} GCSE Chemistry videos from JD Science.`,
      canonicalPath: `/${topicPath}/`,
      heading: item.title,
      lede: item.description || `${item.title} GCSE Chemistry videos from JD Science.`,
      breadcrumbs: [
        { name: "Resources", path: "/resources/" },
        { name: "GCSE", path: "/resources/gcse/" },
        { name: "Chemistry", path: "/resources/gcse/chemistry/" },
        { name: "Videos", path: `/${indexPath}/` },
        { name: item.title, path: `/${topicPath}/` },
      ],
      jsonLd: {
        "@type": "LearningResource",
        name: `${item.title} GCSE Chemistry Videos`,
        description: item.description || `${item.title} GCSE Chemistry Videos`,
        url: `${SITE_ORIGIN}/${topicPath}/`,
      },
      bodyHtml: `${item.notesHtml || ""}
            ${videoHtml(item)}
            <h2>More GCSE Chemistry topics</h2><div class="cards">${siblings}</div>`,
    }));
  }
  console.log(`wrote ${GCSE_CHEMISTRY_VIDEOS.length} GCSE Chemistry video pages`);
}

main();
