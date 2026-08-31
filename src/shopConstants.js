export const SHOP_LEVELS = ["11+", "GCSE/IGCSE", "A Level", "BTEC", "BTEC Level 3", "T Level"];

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
  { value: "powerpoint", label: "PowerPoint" },
  { value: "pdf", label: "PDF" },
  { value: "worksheet", label: "Worksheet" },
  { value: "revision_notes", label: "Revision Notes" },
  { value: "answer_sheet", label: "Answer Sheet" },
  { value: "practice_questions", label: "Practice Questions & Mark Schemes" },
  { value: "exam_walkthrough", label: "Exam Walkthrough" },
  { value: "study_pack", label: "Study Pack" },
  { value: "book", label: "Book" },
  { value: "physical_book", label: "Physical Book" },
  { value: "digital", label: "Digital Download" },
  { value: "digital_download", label: "Digital Download" },
  { value: "bundle", label: "Bundle" },
  { value: "other", label: "Other" },
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
