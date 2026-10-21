/* Hosted GCSE Chemistry lessons for /papers Videos and public /resources pages. */

function lesson({ title, topicSlug, file_name, source_path, description }) {
  return {
    level: "GCSE/IGCSE",
    subject: "Chemistry",
    exam_board: "Edexcel",
    resource_category: "Videos",
    all_boards: true,
    title,
    topicSlug,
    file_name,
    source_path,
    description,
    file_url_override: `/resources/gcse/chemistry/videos/${topicSlug}/${file_name}`,
    notesHtml: `<div class="callout">Original JD Science GCSE Chemistry lesson. Watch on this page, or download the MP4.</div><p>${description}</p>`,
  };
}

export const GCSE_CHEMISTRY_KEY_CONCEPTS_VIDEO = {
  level: "GCSE/IGCSE",
  subject: "Chemistry",
  exam_board: "Edexcel",
  resource_category: "Videos",
  title: "Topic 1 Key Concepts In Chemistry",
  embed_url: "https://share.synthesia.io/embeds/videos/99d5e9d6-8756-4051-9e53-246cc6af911e",
  all_boards: true,
};

export const GCSE_CHEMISTRY_LESSON_VIDEOS = [
  lesson({
    title: "Calculating Moles",
    topicSlug: "calculating-moles",
    file_name: "jdscience-moles-1080p.mp4",
    source_path: "content/videos/moles/jdscience-moles-1080p.mp4",
    description: "How to calculate moles from mass and relative formula mass, with worked examples and a practice question.",
  }),
  lesson({
    title: "Concentration",
    topicSlug: "concentration",
    file_name: "jdscience-concentration-1080p.mp4",
    source_path: "content/videos/concentration/jdscience-concentration-1080p.mp4",
    description: "Concentration in mol/dm³ from moles and volume, with unit conversions and a practice question.",
  }),
  lesson({
    title: "Percentage by Mass",
    topicSlug: "percentage-by-mass",
    file_name: "jdscience-percentage-by-mass-1080p.mp4",
    source_path: "content/videos/percentage-by-mass/jdscience-percentage-by-mass-1080p.mp4",
    description: "Percentage by mass from an element's Ar and the compound's Mr, with worked examples and a practice question.",
  }),
  lesson({
    title: "Empirical Formulae",
    topicSlug: "empirical-formulae",
    file_name: "jdscience-empirical-formulae-1080p.mp4",
    source_path: "content/videos/empirical-formula/jdscience-empirical-formulae-1080p.mp4",
    description: "Finding an empirical formula from percentage composition, including dividing by Ar and simplifying the ratio.",
  }),
  lesson({
    title: "Atom Economy",
    topicSlug: "atom-economy",
    file_name: "jdscience-atom-economy-1080p.mp4",
    source_path: "content/videos/atom-economy/jdscience-atom-economy-1080p.mp4",
    description: "Atom economy from the Mr of the desired product and the total Mr of all products, with a practice question.",
  }),
  lesson({
    title: "Six-Mark Exam Technique",
    topicSlug: "six-mark-questions",
    file_name: "jdscience-six-mark-questions-1080p.mp4",
    source_path: "content/videos/six-mark-questions/jdscience-six-mark-questions-1080p.mp4",
    description: "How to get full marks in GCSE Chemistry six-mark questions: command words, levels of response, and the Point–Science–Explain–Link–Check structure.",
  }),
];

export const GCSE_CHEMISTRY_VIDEOS = [
  ...GCSE_CHEMISTRY_LESSON_VIDEOS,
  GCSE_CHEMISTRY_KEY_CONCEPTS_VIDEO,
];
