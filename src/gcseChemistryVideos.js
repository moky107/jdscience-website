/* Hosted GCSE Chemistry lessons for /papers Videos and public /resources pages. */

export const RESOURCES_PUBLIC_BASE =
  "https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources";

function calculationLesson({ title, topicSlug, file_name, source_path, description }) {
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
    hosted: false,
    poster_url: `/resources/gcse/chemistry/videos/${topicSlug}/poster.jpg`,
    file_url_override: `/resources/gcse/chemistry/videos/${topicSlug}/${file_name}`,
    notesHtml: `<div class="callout">Original JD Science GCSE Chemistry lesson. Watch on this page, or download the MP4.</div><p>${description}</p>`,
  };
}

function foundationLesson({ title, topicSlug, file_name, description }) {
  const storageFolder = `gcse-igcse/chemistry/videos/${topicSlug}`;
  return {
    level: "GCSE/IGCSE",
    subject: "Chemistry",
    exam_board: "Edexcel",
    resource_category: "Videos",
    all_boards: true,
    title,
    topicSlug,
    file_name,
    source_path: null,
    hosted: true,
    description,
    file_url_override: `${RESOURCES_PUBLIC_BASE}/${storageFolder}/${file_name}`,
    caption_url: `/resources/gcse/chemistry/videos/${topicSlug}/captions.vtt`,
    poster_url: `/resources/gcse/chemistry/videos/${topicSlug}/poster.jpg`,
    notesHtml: `<div class="callout">Original JD Science GCSE Chemistry lesson. Captions are available in the player.</div><p>${description}</p>`,
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

export const GCSE_CHEMISTRY_FOUNDATION_VIDEOS = [
  foundationLesson({
    title: "States of Matter",
    topicSlug: "states-of-matter",
    file_name: "jdscience-states-of-matter-1080p.mp4",
    description: "Particle arrangement and movement in solids, liquids and gases, with exam-style questions.",
  }),
  foundationLesson({
    title: "Changes of State",
    topicSlug: "changes-of-state",
    file_name: "jdscience-changes-of-state-1080p.mp4",
    description: "Melting, boiling, evaporation and condensation, including an accurate heating curve.",
  }),
  foundationLesson({
    title: "Pure Substances and Mixtures",
    topicSlug: "pure-substances-and-mixtures",
    file_name: "jdscience-pure-substances-and-mixtures-1080p.mp4",
    description: "How melting points show purity, and how mixtures differ from pure substances.",
  }),
  foundationLesson({
    title: "Separation Techniques",
    topicSlug: "separation-techniques",
    file_name: "jdscience-separation-techniques-1080p.mp4",
    description: "Filtration, crystallisation, simple distillation and fractional distillation.",
  }),
  foundationLesson({
    title: "Chromatography",
    topicSlug: "chromatography",
    file_name: "jdscience-chromatography-1080p.mp4",
    description: "Paper chromatography, Rf values and why different dyes separate.",
  }),
  foundationLesson({
    title: "Potable Water and Waste Water Treatment",
    topicSlug: "potable-water",
    file_name: "jdscience-potable-water-1080p.mp4",
    description: "Potable water, sewage treatment and why desalination can be expensive.",
  }),
];

export const GCSE_CHEMISTRY_CALCULATION_VIDEOS = [
  calculationLesson({
    title: "Calculating Moles",
    topicSlug: "calculating-moles",
    file_name: "jdscience-moles-1080p.mp4",
    source_path: "content/videos/moles/jdscience-moles-1080p.mp4",
    description: "How to calculate moles from mass and relative formula mass, with worked examples and a practice question.",
  }),
  calculationLesson({
    title: "Concentration",
    topicSlug: "concentration",
    file_name: "jdscience-concentration-1080p.mp4",
    source_path: "content/videos/concentration/jdscience-concentration-1080p.mp4",
    description: "Concentration in mol/dm³ from moles and volume, with unit conversions and a practice question.",
  }),
  calculationLesson({
    title: "Percentage by Mass",
    topicSlug: "percentage-by-mass",
    file_name: "jdscience-percentage-by-mass-1080p.mp4",
    source_path: "content/videos/percentage-by-mass/jdscience-percentage-by-mass-1080p.mp4",
    description: "Percentage by mass from an element's Ar and the compound's Mr, with worked examples and a practice question.",
  }),
  calculationLesson({
    title: "Empirical Formulae",
    topicSlug: "empirical-formulae",
    file_name: "jdscience-empirical-formulae-1080p.mp4",
    source_path: "content/videos/empirical-formula/jdscience-empirical-formulae-1080p.mp4",
    description: "Finding an empirical formula from percentage composition, including dividing by Ar and simplifying the ratio.",
  }),
  calculationLesson({
    title: "Atom Economy",
    topicSlug: "atom-economy",
    file_name: "jdscience-atom-economy-1080p.mp4",
    source_path: "content/videos/atom-economy/jdscience-atom-economy-1080p.mp4",
    description: "Atom economy from the Mr of the desired product and the total Mr of all products, with a practice question.",
  }),
];

export const GCSE_CHEMISTRY_LESSON_VIDEOS = [
  ...GCSE_CHEMISTRY_FOUNDATION_VIDEOS,
  ...GCSE_CHEMISTRY_CALCULATION_VIDEOS,
];

export const GCSE_CHEMISTRY_VIDEOS = [
  ...GCSE_CHEMISTRY_LESSON_VIDEOS,
  GCSE_CHEMISTRY_KEY_CONCEPTS_VIDEO,
];
