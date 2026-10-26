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

/** Slugs with cloned-voice MP4s uploaded to the public resources bucket. */
export const GCSE_BIOLOGY_HOSTED_SLUGS = [
  "1-1-cell-division",
  "1-2-bacterial-growth",
];

export const GCSE_BIOLOGY_LESSON_VIDEOS = BIOLOGY_SCRIPTS
  .filter((script) => GCSE_BIOLOGY_HOSTED_SLUGS.includes(script.slug))
  .map(biologyLesson);

export const GCSE_BIOLOGY_VIDEOS = GCSE_BIOLOGY_LESSON_VIDEOS;

export { BY_SLUG, BIOLOGY_SCRIPTS };
