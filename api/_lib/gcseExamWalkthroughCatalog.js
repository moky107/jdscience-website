/* Catalogue for GCSE Science exam walkthrough shop products.
   Used only by the one-off publish script. Do not import from shop
   handlers, npm run build, or Vercel request paths. */

export const GCSE_WALKTHROUGH_LEVEL = "GCSE/IGCSE";
export const GCSE_WALKTHROUGH_EXAM_BOARD = "N/A";
export const SUBJECT_PRICE_PENCE = 500;
export const BUNDLE_PRICE_PENCE = 1299;

const DESCRIPTION_PREFIX =
  "JDScience GCSE Science exam walkthrough resource. Each question includes step-by-step thinking, model answers, mark breakdowns, common mistakes and examiner-style tips. ";

const DESCRIPTION_SUFFIX =
  " This is an original JDScience resource and does not reproduce copyrighted past-paper questions.";

export const GCSE_EXAM_WALKTHROUGH_PRODUCTS = [
  {
    slug: "gcse-chemistry-exam-walkthrough-pack",
    title: "GCSE Chemistry Exam Walkthrough Pack",
    short_description:
      "Step-by-step worked exam-style Chemistry questions with full mark breakdowns and examiner tips.",
    description:
      DESCRIPTION_PREFIX +
      "Covers atomic structure, bonding, quantitative chemistry, chemical changes, energy, rates, organic chemistry, analysis, the atmosphere and resources." +
      DESCRIPTION_SUFFIX,
    price_pence: SUBJECT_PRICE_PENCE,
    product_type: "exam_walkthrough",
    subject: "Chemistry",
    keywords: ["GCSE", "IGCSE", "Chemistry", "Exam Walkthrough", "Revision", "Mark scheme"],
    folder: "chemistry",
    localDownloadName: "gcse-chemistry-exam-walkthrough-pack.pdf",
    localDocxName: "gcse-chemistry-exam-walkthrough-pack.docx",
    localCoverName: "cover.png",
    localPreviewName: "gcse-chemistry-exam-walkthrough-preview.pdf",
    sort_order: 120,
    is_featured: true,
  },
  {
    slug: "gcse-biology-exam-walkthrough-pack",
    title: "GCSE Biology Exam Walkthrough Pack",
    short_description:
      "Step-by-step worked exam-style Biology questions with full mark breakdowns and examiner tips.",
    description:
      DESCRIPTION_PREFIX +
      "Covers cell biology, organisation, infection, bioenergetics, homeostasis, inheritance, ecology and required practical skills." +
      DESCRIPTION_SUFFIX,
    price_pence: SUBJECT_PRICE_PENCE,
    product_type: "exam_walkthrough",
    subject: "Biology",
    keywords: ["GCSE", "IGCSE", "Biology", "Exam Walkthrough", "Revision", "Mark scheme"],
    folder: "biology",
    localDownloadName: "gcse-biology-exam-walkthrough-pack.pdf",
    localDocxName: "gcse-biology-exam-walkthrough-pack.docx",
    localCoverName: "cover.png",
    localPreviewName: "gcse-biology-exam-walkthrough-preview.pdf",
    sort_order: 121,
    is_featured: true,
  },
  {
    slug: "gcse-physics-exam-walkthrough-pack",
    title: "GCSE Physics Exam Walkthrough Pack",
    short_description:
      "Step-by-step worked exam-style Physics questions with full mark breakdowns and examiner tips.",
    description:
      DESCRIPTION_PREFIX +
      "Covers energy, electricity, particle model, radioactivity, forces, waves, magnetism, space physics and required practical skills." +
      DESCRIPTION_SUFFIX,
    price_pence: SUBJECT_PRICE_PENCE,
    product_type: "exam_walkthrough",
    subject: "Physics",
    keywords: ["GCSE", "IGCSE", "Physics", "Exam Walkthrough", "Revision", "Mark scheme"],
    folder: "physics",
    localDownloadName: "gcse-physics-exam-walkthrough-pack.pdf",
    localDocxName: "gcse-physics-exam-walkthrough-pack.docx",
    localCoverName: "cover.png",
    localPreviewName: "gcse-physics-exam-walkthrough-preview.pdf",
    sort_order: 122,
    is_featured: true,
  },
  {
    slug: "gcse-science-exam-walkthrough-bundle",
    title: "GCSE Science Exam Walkthrough Bundle",
    short_description:
      "All three GCSE Science exam walkthrough packs — Chemistry, Biology and Physics — in one download.",
    description:
      DESCRIPTION_PREFIX +
      "Includes the full Chemistry, Biology and Physics exam walkthrough packs (PDF and editable DOCX for each subject) in a single zip download." +
      DESCRIPTION_SUFFIX,
    price_pence: BUNDLE_PRICE_PENCE,
    product_type: "bundle",
    subject: "Mixed",
    keywords: ["GCSE", "IGCSE", "Combined Science", "Bundle", "Chemistry", "Biology", "Physics", "Exam Walkthrough"],
    folder: "bundle",
    localDownloadName: "gcse-science-exam-walkthrough-bundle.zip",
    localDocxName: null,
    localCoverName: "cover.png",
    localPreviewName: null,
    sort_order: 123,
    is_featured: true,
  },
];

export function gcseWalkthroughProductSpecs() {
  return GCSE_EXAM_WALKTHROUGH_PRODUCTS.map((item) => ({ ...item }));
}
