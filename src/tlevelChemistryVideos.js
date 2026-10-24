/* Hosted T-Level Chemistry lessons for /papers Videos and /resources/t-level/science/videos/. */

import { RESOURCES_PUBLIC_BASE } from "./gcseChemistryVideos.js";

function chemistryLesson({ title, topicSlug, file_name, description, ready = false }) {
  const publicFolder = `/resources/t-level/science/videos/${topicSlug}`;
  const storageFolder = `t-level/science/videos/${topicSlug}`;
  const item = {
    level: "T-Level",
    subject: "Science",
    exam_board: "NCFE",
    resource_category: "Videos",
    all_boards: true,
    title,
    topicSlug,
    description,
    hosted: Boolean(ready && file_name),
    source_path: null,
  };
  if (ready && file_name) {
    item.file_name = file_name;
    item.file_url_override = `${RESOURCES_PUBLIC_BASE}/${storageFolder}/${file_name}`;
    item.caption_url = `${publicFolder}/captions.vtt`;
    item.poster_url = `${publicFolder}/poster.jpg`;
    item.downloadHref = `${publicFolder}/jdscience-${topicSlug}-worksheet.pdf`;
    item.downloadLabel = "Download student worksheet (PDF)";
    item.notesHtml = `<div class="callout">Original JD Science T-Level Chemistry lesson. Captions are available in the player. Learning outcomes are in the video and on the student worksheet. Answer booklets stay with teachers and are not published here.</div><p>${description}</p>`;
  } else {
    item.file_name = `${topicSlug}-coming-after-approval`;
    item.file_url_override = `${publicFolder}/`;
    item.notesHtml = `<div class="callout">This topic is listed so the T-Level Chemistry video page shows the full A11/A12 series. The video and student worksheet will be added after the current batch is approved. Teacher answer booklets stay private.</div><p>${description}</p>`;
  }
  return item;
}

export const TLEVEL_CHEMISTRY_LESSON_VIDEOS = [
  chemistryLesson({
    title: "A11.1 Principles of Collision Theory",
    topicSlug: "a11-1-collision-theory",
    file_name: "jdscience-a11-1-collision-theory-1080p.mp4",
    description: "Activation energy, successful and unsuccessful collisions, and why particles must meet in the correct spatial orientation.",
    ready: true,
  }),
  chemistryLesson({
    title: "A11.2 Temperature and Rate of Reaction",
    topicSlug: "a11-2-temperature-and-rate",
    file_name: "jdscience-a11-2-temperature-and-rate-1080p.mp4",
    description: "How temperature changes kinetic energy, collision frequency and the Maxwell–Boltzmann distribution, and why rate rises or falls.",
    ready: true,
  }),
  chemistryLesson({
    title: "A11.3 Catalysts and Reaction Rate",
    topicSlug: "a11-3-catalysts",
    file_name: "jdscience-a11-3-catalysts-1080p.mp4",
    description: "What a catalyst is, the alternative lower-Ea pathway, and how that appears on a Maxwell–Boltzmann distribution at constant temperature.",
    ready: true,
  }),
  chemistryLesson({
    title: "A12.1 Factors Affecting Rates of Chemical Reactions",
    topicSlug: "a12-1-factors-affecting-rates",
    description: "Coming after this batch. Original A12.1 PDFs are not in the current upload set; timing values 95 s / 48 s versus 96 s / 51 s / 29 s remain under review.",
  }),
  chemistryLesson({
    title: "A12.2 Calculating Rate of Reaction",
    topicSlug: "a12-2-calculating-rate",
    description: "Coming after this batch. Produce from the original A12.2 PDFs when they are available.",
  }),
  chemistryLesson({
    title: "A12.3 Enthalpy Changes",
    topicSlug: "a12-3-enthalpy-changes",
    description: "Coming after this batch. Produce from the original A12.3 PDFs when they are available.",
  }),
  chemistryLesson({
    title: "A12.4 Catalysts in Industrial Reactions",
    topicSlug: "a12-4-industrial-catalysts",
    description: "Coming after this batch. Produce from the original A12.4 PDFs when they are available.",
  }),
  chemistryLesson({
    title: "A12.5 Reversible Reactions",
    topicSlug: "a12-5-reversible-reactions",
    description: "Dynamic equilibrium and Le Chatelier’s principle. Original teacher PowerPoint is available; student workbook PDF is not in this upload set.",
  }),
  chemistryLesson({
    title: "A12.6 The Haber Process",
    topicSlug: "a12-6-haber-process",
    description: "Haber process conditions, compromise between rate and equilibrium. Original student and teacher workbooks are available.",
  }),
];

export const TLEVEL_CHEMISTRY_VIDEOS = TLEVEL_CHEMISTRY_LESSON_VIDEOS;
