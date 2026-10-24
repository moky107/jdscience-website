/* Hosted T-Level Chemistry lessons for /papers Videos and /resources/t-level/science/videos/. */

import { RESOURCES_PUBLIC_BASE } from "./gcseChemistryVideos.js";

function chemistryLesson({ title, topicSlug, file_name, description, outcomes }) {
  const publicFolder = `/resources/t-level/science/videos/${topicSlug}`;
  const storageFolder = `t-level/science/videos/${topicSlug}`;
  return {
    level: "T-Level",
    subject: "Science",
    exam_board: "NCFE",
    resource_category: "Videos",
    all_boards: true,
    title,
    topicSlug,
    description,
    outcomes,
    hosted: true,
    source_path: null,
    file_name,
    file_url_override: `${RESOURCES_PUBLIC_BASE}/${storageFolder}/${file_name}`,
    caption_url: `${publicFolder}/captions.vtt`,
    poster_url: `${publicFolder}/poster.jpg`,
    downloadHref: `${publicFolder}/jdscience-${topicSlug}-worksheet.pdf`,
    downloadLabel: "Download student worksheet (PDF)",
    teacherSchemeSlug: topicSlug,
    notesHtml: `<div class="callout">Original JD Science T-Level Chemistry lesson. Captions are available in the player. Learning outcomes are listed below and on the student worksheet. Teacher marking schemes require an authorised teacher sign-in and are not stored at a public URL.</div><p>${description}</p><h2>Learning outcomes</h2><ul>${outcomes.map((item) => `<li>${item}</li>`).join("")}</ul>`,
  };
}

export const TLEVEL_CHEMISTRY_LESSON_VIDEOS = [
  chemistryLesson({
    title: "A11.1 Principles of Collision Theory",
    topicSlug: "a11-1-collision-theory",
    file_name: "jdscience-a11-1-collision-theory-1080p.mp4",
    description: "Activation energy, successful and unsuccessful collisions, and why particles must meet in the correct spatial orientation.",
    outcomes: [
      "Explain why reacting particles must collide",
      "Define activation energy",
      "Distinguish successful and unsuccessful collisions",
      "Explain correct spatial orientation",
    ],
  }),
  chemistryLesson({
    title: "A11.2 Temperature and Rate of Reaction",
    topicSlug: "a11-2-temperature-and-rate",
    file_name: "jdscience-a11-2-temperature-and-rate-1080p.mp4",
    description: "How temperature changes kinetic energy, collision frequency and the Maxwell–Boltzmann distribution, and why rate rises or falls.",
    outcomes: [
      "Link temperature to kinetic energy and particle speed",
      "Explain collision frequency and the proportion of successful collisions",
      "Describe the effect of lowering temperature",
      "Interpret a Maxwell–Boltzmann distribution",
    ],
  }),
  chemistryLesson({
    title: "A11.3 Catalysts and Reaction Rate",
    topicSlug: "a11-3-catalysts",
    file_name: "jdscience-a11-3-catalysts-1080p.mp4",
    description: "What a catalyst is, the alternative lower-Ea pathway, and how that appears on a Maxwell–Boltzmann distribution at constant temperature.",
    outcomes: [
      "Define a catalyst",
      "Use rate and recovery evidence",
      "Explain the alternative lower-Ea pathway",
      "Show a catalyst on a Maxwell–Boltzmann graph at constant T",
    ],
  }),
  chemistryLesson({
    title: "A12.1 Factors Affecting Rates of Chemical Reactions",
    topicSlug: "a12-1-factors-affecting-rates",
    file_name: "jdscience-a12-1-factors-affecting-rates-1080p.mp4",
    description: "Surface area, concentration and pressure explained with collision theory. The PowerPoint 95 s / 48 s times and the workbook 96 s / 51 s / 29 s times are kept separate.",
    outcomes: [
      "Explain surface area using collision theory",
      "Explain concentration using collision theory",
      "Explain pressure using collision theory",
      "Identify control variables in a rate investigation",
    ],
  }),
  chemistryLesson({
    title: "A12.2 Calculating Rate of Reaction",
    topicSlug: "a12-2-calculating-rate",
    file_name: "jdscience-a12-2-calculating-rate-1080p.mp4",
    description: "Average rate from amount of reactant used or product formed divided by time, including compound units and graph chords.",
    outcomes: [
      "Calculate average rate as change in amount ÷ time",
      "Use product-formed and reactant-used data",
      "Convert minutes to seconds when needed",
      "Read a chord gradient from a product–time graph",
    ],
  }),
  chemistryLesson({
    title: "A12.3 Enthalpy Changes",
    topicSlug: "a12-3-enthalpy-changes",
    file_name: "jdscience-a12-3-enthalpy-changes-1080p.mp4",
    description: "H and ΔH, exothermic and endothermic profiles, activation energy, and why a catalyst does not change ΔH.",
    outcomes: [
      "Define H and ΔH",
      "Describe exothermic and endothermic transfers",
      "Read Ea and ΔH on an enthalpy profile",
      "Explain that a catalyst does not change ΔH",
    ],
  }),
  chemistryLesson({
    title: "A12.4 Catalysts in Industrial Reactions",
    topicSlug: "a12-4-industrial-catalysts",
    file_name: "jdscience-a12-4-industrial-catalysts-1080p.mp4",
    description: "Lower activation energy, faster industrial turnaround and reduced costs, with unchanged ΔH.",
    outcomes: [
      "State the industrial rate → turnaround → cost chain",
      "Calculate time saved from process data",
      "Show lower Ea with unchanged ΔH",
      "Reject cost and energy misconceptions",
    ],
  }),
  chemistryLesson({
    title: "A12.5 Reversible Reactions",
    topicSlug: "a12-5-reversible-reactions",
    file_name: "jdscience-a12-5-reversible-reactions-1080p.mp4",
    description: "Dynamic equilibrium and Le Chatelier’s principle for concentration, temperature and pressure.",
    outcomes: [
      "Define dynamic equilibrium",
      "State the required conditions",
      "Predict concentration and temperature shifts",
      "Predict pressure shifts from gas moles",
    ],
  }),
  chemistryLesson({
    title: "A12.6 The Haber Process",
    topicSlug: "a12-6-haber-process",
    file_name: "jdscience-a12-6-haber-process-1080p.mp4",
    description: "Typical Haber conditions and the compromise between equilibrium yield, rate and economic cost.",
    outcomes: [
      "State typical temperature, pressure and catalyst",
      "Explain the temperature compromise",
      "Explain the pressure compromise",
      "State what iron does and does not change",
    ],
  }),
];

export const TLEVEL_CHEMISTRY_VIDEOS = TLEVEL_CHEMISTRY_LESSON_VIDEOS;
export const TLEVEL_TEACHER_SCHEME_SLUGS = TLEVEL_CHEMISTRY_VIDEOS.map((item) => item.topicSlug);
