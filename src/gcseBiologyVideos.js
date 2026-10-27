/* Hosted GCSE Biology lessons for /papers Videos and public /resources pages. */

import { RESOURCES_PUBLIC_BASE } from "./gcseChemistryVideos.js";
import { BY_SLUG, LESSONS as BIOLOGY_SCRIPTS } from "./gcseBiologyLessonMeta.js";

function biologyLesson(script) {
  const topicSlug = script.slug;
  const storageFolder = `gcse-igcse/biology/videos/${topicSlug}`;
  const publicFolder = `/resources/gcse/biology/videos/${topicSlug}`;
  const tier = script.tier ? ` ${script.tier}.` : "";
  return {
    level: "GCSE/IGCSE",
    subject: "Biology",
    exam_board: "AQA",
    resource_category: "Videos",
    all_boards: true,
    title: `${script.spec} ${script.title}`,
    topicSlug,
    file_name: script.filename,
    source_path: null,
    hosted: true,
    description: `${script.description || script.subtitle}${tier}`,
    file_url_override: `${RESOURCES_PUBLIC_BASE}/${storageFolder}/${script.filename}`,
    caption_url: `${publicFolder}/captions.vtt`,
    poster_url: `${publicFolder}/poster.jpg`,
    notesHtml: `<div class="callout">Original JD Science GCSE Biology lesson. Captions are available in the player.</div><p>${script.description || script.subtitle}</p>`,
  };
}

/** Slugs with narrated MP4s uploaded to the public resources bucket. */
export const GCSE_BIOLOGY_HOSTED_SLUGS = [
  "1-1-cell-division",
  "1-2-bacterial-growth",
  "1-3-transport-in-cells",
  "2-3-plant-tissues-organs-systems",
  "3-2-monoclonal-antibodies",
  "3-3-plant-disease",
  "4-1-photosynthesis",
  "4-2-respiration",
  "5-1-homeostasis",
  "5-2-the-nervous-system",
  "5-3-hormonal-coordination",
  "5-4-plant-hormones",
  "6-1-reproduction",
];

/** Lessons that still need a usable original-narration recording. */
export const GCSE_BIOLOGY_AWAITING_AUDIO = [
  "2-1-principles-of-organisation",
  "2-2-animal-tissues-organs-systems",
  "3-1-communicable-diseases",
  "3-1-discovering-and-testing-new-drugs",
  "6-2-variation-and-evolution",
  "6-3-genetics-and-evolution",
  "6-4-classification",
  "7-1-adaptations-interdependence",
  "7-2-organisation-of-an-ecosystem",
  "7-3-biodiversity",
  "7-4-trophic-levels",
  "7-5-food-production",
];

export const GCSE_BIOLOGY_LESSON_VIDEOS = BIOLOGY_SCRIPTS
  .filter((script) => GCSE_BIOLOGY_HOSTED_SLUGS.includes(script.slug))
  .map(biologyLesson);

export const GCSE_BIOLOGY_VIDEOS = GCSE_BIOLOGY_LESSON_VIDEOS;

export { BY_SLUG, BIOLOGY_SCRIPTS };
