export const SHOP_LEVELS = ["11+", "GCSE/IGCSE", "A Level", "BTEC", "T Level"];

export const SHOP_SUBJECTS = [
  "Biology",
  "Chemistry",
  "Physics",
  "Maths",
  "English",
  "Applied Science",
  "Mixed",
  "General",
];

export const SHOP_EXAM_BOARDS = ["AQA", "Edexcel", "OCR", "Eduqas", "WJEC", "Pearson", "NCFE", "City & Guilds", "N/A"];

export const SHOP_PRODUCT_TYPES = [
  { value: "powerpoint", label: "PowerPoint Presentation" },
  { value: "worksheet", label: "Worksheet" },
  { value: "revision_notes", label: "Revision Notes" },
  { value: "practice_questions", label: "Practice Questions & Mark Schemes" },
  { value: "study_pack", label: "Study Pack" },
  { value: "book", label: "Book" },
  { value: "stationery", label: "JDScience Stationery" },
  { value: "clothing", label: "JDScience Clothing" },
  { value: "merchandise", label: "Branded Merchandise" },
];

export const SHOP_PRODUCT_KINDS = [
  { value: "digital", label: "Digital download" },
  { value: "physical", label: "Physical product" },
];

export function shopProductTypeLabel(value) {
  return SHOP_PRODUCT_TYPES.find((item) => item.value === value)?.label || value || "";
}

export function shopProductKindLabel(value) {
  return SHOP_PRODUCT_KINDS.find((item) => item.value === value)?.label || value || "";
}
