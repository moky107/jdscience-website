import { decodeResourceLabel } from "./resourceNormalize.js";

const TEACHING_EXTENSIONS = new Set(["ppt", "pptx", "pdf", "doc", "docx"]);
const EXCLUDED_CATEGORIES = new Set(["past questions", "mark schemes", "examiner reports"]);

export function resourceFileExtension(resource) {
  const name = decodeResourceLabel(resource?.file_name || resource?.title || "");
  const fromName = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  if (TEACHING_EXTENSIONS.has(fromName)) return fromName;
  const url = String(resource?.file_url || "");
  const urlMatch = url.match(/\.([a-z0-9]{3,4})(?:\?|$)/i);
  if (urlMatch && TEACHING_EXTENSIONS.has(urlMatch[1].toLowerCase())) {
    return urlMatch[1].toLowerCase();
  }
  const ft = String(resource?.file_type || "").toLowerCase();
  if (ft.includes("presentation") || ft.includes("powerpoint")) return "pptx";
  if (ft.includes("pdf")) return "pdf";
  if (ft.includes("word") || ft.includes("msword")) return "docx";
  return fromName || "";
}

export function classifyResourceProductType(resource) {
  const ext = resourceFileExtension(resource);
  const category = String(resource?.resource_category || "").toLowerCase();
  const title = decodeResourceLabel(resource?.title || "").toLowerCase();
  const file = decodeResourceLabel(resource?.file_name || "").toLowerCase();
  const blob = `${category} ${title} ${file}`;

  if (ext === "ppt" || ext === "pptx" || /powerpoint|presentation/.test(blob)) {
    return "powerpoint";
  }
  if (/answer[-\s_]*sheet/.test(blob) || category.includes("answer")) {
    return "answer_sheet";
  }
  if (category.includes("worksheet") || /worksheet|workbook|fill.?in/.test(blob)) {
    return "worksheet";
  }
  if (category.includes("revision") || /revision\s*notes?/.test(blob)) {
    return "revision_notes";
  }
  if (ext === "pdf" || ext === "doc" || ext === "docx") {
    return "revision_notes";
  }
  return "other";
}

export function isCopyableTeachingResource(resource) {
  if (!resource || resource.id == null || resource.id === "") return false;
  if (Number.isNaN(Number(resource.id))) return false;
  const category = String(resource.resource_category || "").toLowerCase();
  if (EXCLUDED_CATEGORIES.has(category)) return false;
  const ext = resourceFileExtension(resource);
  if (!TEACHING_EXTENSIONS.has(ext)) return false;
  if (!resource.file_url && !resource.storage_path) return false;
  return true;
}

export function cleanShopTitle(resource) {
  let title = decodeResourceLabel(resource?.title || resource?.file_name || "Untitled resource");
  title = title.replace(/\.(pptx?|pdf|docx?)$/i, "");
  title = title.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  title = title.replace(/\s*\(\d+\)\s*$/, "").trim();
  return title.slice(0, 180) || "Untitled resource";
}

export function productTypeLabelForCopy(type) {
  if (type === "powerpoint") return "PowerPoint";
  if (type === "worksheet") return "Worksheet";
  if (type === "answer_sheet") return "Answer Sheet";
  if (type === "revision_notes") return "Revision Notes";
  return type || "Resource";
}
