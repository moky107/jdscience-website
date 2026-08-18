export const ADVICE_CATEGORIES = [
  { id: "revision-advice", label: "Revision advice" },
  { id: "exam-tips", label: "Exam tips" },
  { id: "education-news", label: "Education news" },
];

export function adviceCategoryLabel(id) {
  return ADVICE_CATEGORIES.find((item) => item.id === id)?.label || "Update";
}
