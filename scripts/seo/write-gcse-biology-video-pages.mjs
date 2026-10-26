#!/usr/bin/env node
/** Write only GCSE Biology video SEO pages. Does not rebuild 11+ lastmods. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GCSE_BIOLOGY_VIDEOS } from "../../src/gcseBiologyVideos.js";
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
  return `
            <style>
              .lesson-video { margin: 0 0 24px; background: #0f172a; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 16px rgba(15,23,42,.05); }
              .lesson-video video { display: block; width: 100%; aspect-ratio: 16 / 9; background: #000; }
              .lesson-video figcaption { background: #fff; padding: 10px 14px; }
              .lesson-video figcaption .download { margin: 0; }
            </style>
            <figure class="lesson-video">
              <video controls playsinline preload="metadata" poster="${escapeHtml(item.poster_url)}" title="${escapeHtml(item.title)}" crossorigin="anonymous">
                <source src="${escapeHtml(item.file_url_override)}" type="video/mp4" />
                <track kind="captions" src="${escapeHtml(item.caption_url)}" srclang="en" label="English" default />
              </video>
              <figcaption><a class="download" href="${escapeHtml(item.file_url_override)}" download>Download ${escapeHtml(item.title)} (MP4)</a></figcaption>
            </figure>`;
}

function main() {
  const indexPath = "resources/gcse/biology/videos";
  const cards = GCSE_BIOLOGY_VIDEOS.map((item) => card(
    `/resources/gcse/biology/videos/${item.topicSlug}/`,
    item.title,
    item.description,
    item.poster_url,
  )).join("");

  writePage(indexPath, renderPublicPage({
    title: "GCSE Biology Videos | JD Science",
    description: "Original JD Science GCSE Biology lessons with captions, exam-style questions and model answers.",
    canonicalPath: `/${indexPath}/`,
    heading: "GCSE Biology videos",
    lede: "Original JD Science lessons. Watch on this page, or download the MP4.",
    breadcrumbs: [
      { name: "Resources", path: "/resources/" },
      { name: "GCSE", path: "/resources/gcse/" },
      { name: "Biology", path: "/resources/gcse/biology/" },
      { name: "Videos", path: `/${indexPath}/` },
    ],
    jsonLd: {
      "@type": "CollectionPage",
      name: "GCSE Biology Videos",
      url: `${SITE_ORIGIN}/${indexPath}/`,
    },
    bodyHtml: `<p>These lessons sit beside the GCSE Chemistry videos and do not replace them.</p><div class="cards">${cards}</div>`,
  }));

  for (const item of GCSE_BIOLOGY_VIDEOS) {
    const topicPath = `resources/gcse/biology/videos/${item.topicSlug}`;
    const siblings = GCSE_BIOLOGY_VIDEOS.filter((other) => other.topicSlug !== item.topicSlug)
      .map((other) => card(
        `/resources/gcse/biology/videos/${other.topicSlug}/`,
        other.title,
        other.description,
        other.poster_url,
      )).join("");
    writePage(topicPath, renderPublicPage({
      title: `${item.title} GCSE Biology Videos | JD Science`,
      description: item.description,
      canonicalPath: `/${topicPath}/`,
      heading: item.title,
      lede: item.description,
      breadcrumbs: [
        { name: "Resources", path: "/resources/" },
        { name: "GCSE", path: "/resources/gcse/" },
        { name: "Biology", path: "/resources/gcse/biology/" },
        { name: "Videos", path: `/${indexPath}/` },
        { name: item.title, path: `/${topicPath}/` },
      ],
      jsonLd: {
        "@type": "LearningResource",
        name: `${item.title} GCSE Biology Videos`,
        description: item.description,
        url: `${SITE_ORIGIN}/${topicPath}/`,
      },
      bodyHtml: `${item.notesHtml || ""}
            ${videoHtml(item)}
            <p><a class="download" href="/resources/gcse/biology/videos/${item.topicSlug}/transcript.txt">Read the full transcript</a></p>
            <h2>More GCSE Biology topics</h2><div class="cards">${siblings}</div>`,
    }));
  }
  console.log(`wrote ${GCSE_BIOLOGY_VIDEOS.length} GCSE Biology video pages`);
}

main();
