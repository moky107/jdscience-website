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
    item.notesHtml = `<div class="callout">Original JD Science T-Level Chemistry lesson. Captions are available in the player. Download the student worksheet below. Answer booklets stay with teachers and are not published here.</div><p>${description}</p>`;
  } else {
    item.file_name = `${topicSlug}-coming-after-pilot-approval`;
    item.file_url_override = `${publicFolder}/`;
    item.notesHtml = `<div class="callout">This topic is listed so the T-Level Chemistry video page shows the full A11/A12 series. The video and student worksheet will be added after the A11.1 pilot is approved. Teacher answer booklets stay private.</div><p>${description}</p>`;
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
    title: "A11.2 Factors Affecting Rate of Reaction",
    topicSlug: "a11-2-factors-affecting-rate",
    description: "How concentration, pressure, surface area, temperature and catalysts change collision frequency and the chance of successful collisions.",
  }),
  chemistryLesson({
    title: "A11.3 Maxwell–Boltzmann Distribution",
    topicSlug: "a11-3-maxwell-boltzmann",
    description: "Using the Maxwell–Boltzmann distribution to explain why only some particles have energy greater than the activation energy.",
  }),
  chemistryLesson({
    title: "A12.1 Enthalpy Changes",
    topicSlug: "a12-1-enthalpy-changes",
    description: "Exothermic and endothermic enthalpy changes. A12.1 timing values from the source audit remain under review and are not used in this pilot.",
  }),
  chemistryLesson({
    title: "A12.2 Bond Enthalpies",
    topicSlug: "a12-2-bond-enthalpies",
    description: "Mean bond enthalpies and how they are used to estimate enthalpy changes of reaction.",
  }),
  chemistryLesson({
    title: "A12.3 Hess’s Law",
    topicSlug: "a12-3-hess-law",
    description: "Hess’s law cycles for calculating enthalpy changes that cannot be measured directly.",
  }),
  chemistryLesson({
    title: "A12.4 Calorimetry",
    topicSlug: "a12-4-calorimetry",
    description: "Using q = mcΔT and calorimetry data to calculate enthalpy changes.",
  }),
  chemistryLesson({
    title: "A12.5 Enthalpy Profile Diagrams",
    topicSlug: "a12-5-enthalpy-profile-diagrams",
    description: "Energy profile diagrams, activation energy and the difference between exothermic and endothermic profiles.",
  }),
  chemistryLesson({
    title: "A12.6 Entropy and Feasibility",
    topicSlug: "a12-6-entropy-and-feasibility",
    description: "Entropy changes and how they contribute to the feasibility of a reaction.",
  }),
];

export const TLEVEL_CHEMISTRY_VIDEOS = TLEVEL_CHEMISTRY_LESSON_VIDEOS;
