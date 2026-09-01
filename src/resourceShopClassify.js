import {
  decodeResourceLabel,
  hasAwardingBodyUrl,
  isHostedOfficialExamCopy,
  isOriginalJdScienceFile,
  looksLikeOfficialPaper,
} from "./resourceNormalize.js";
import { approvedPricePenceForType, titlesLookLikeSameShopProduct } from "./shopStandardPrices.js";

const TEACHING_EXTENSIONS = new Set(["ppt", "pptx", "pdf", "doc", "docx"]);
const EXCLUDED_CATEGORIES = new Set(["past questions", "mark schemes", "examiner reports"]);
const COPYABLE_SHOP_TYPES = new Set(["powerpoint", "worksheet", "revision_notes"]);

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

export function shopCopySkipReason(resource) {
  if (!resource || resource.id == null || resource.id === "") return "missing_resource";
  if (Number.isNaN(Number(resource.id))) return "invalid_id";
  if (hasAwardingBodyUrl(resource) || looksLikeOfficialPaper(resource) || isHostedOfficialExamCopy(resource)) {
    return "third_party_copyright";
  }
  if (!isOriginalJdScienceFile(resource)) return "not_original_jdscience";
  const category = String(resource.resource_category || "").toLowerCase();
  if (EXCLUDED_CATEGORIES.has(category)) return "exam_material_category";
  const ext = resourceFileExtension(resource);
  if (!TEACHING_EXTENSIONS.has(ext)) return "unsupported_file_type";
  if (!resource.file_url && !resource.storage_path) return "missing_file";
  const type = classifyResourceProductType(resource);
  if (type === "answer_sheet") return "answer_sheet_bundled_with_worksheet";
  if (!COPYABLE_SHOP_TYPES.has(type)) return "unsupported_product_type";
  if (approvedPricePenceForType(type) == null) return "no_approved_price";
  return null;
}

export function isCopyableTeachingResource(resource) {
  return shopCopySkipReason(resource) == null;
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

export function planResourceShopCopy(resource, existingShopProducts = []) {
  const skip = shopCopySkipReason(resource);
  const product_type = resource ? classifyResourceProductType(resource) : "other";
  const title = resource ? cleanShopTitle(resource) : "";
  if (skip) {
    return { ok: false, skip, title, product_type, price_pence: null };
  }
  const duplicate = findDuplicateShopProduct(existingShopProducts, resource, product_type);
  if (duplicate) {
    return {
      ok: false,
      skip: "already_in_shop",
      title,
      product_type,
      price_pence: approvedPricePenceForType(product_type),
      existing_id: duplicate.id || null,
    };
  }
  return {
    ok: true,
    skip: null,
    title,
    product_type,
    price_pence: approvedPricePenceForType(product_type),
  };
}

export function findDuplicateShopProduct(existingShopProducts, resource, productType) {
  const list = Array.isArray(existingShopProducts) ? existingShopProducts : [];
  const id = Number(resource?.id);
  const type = productType || classifyResourceProductType(resource);
  const title = cleanShopTitle(resource);
  return list.find((row) => {
    if (!row) return false;
    if (id && Number(row.source_resource_id) === id) return true;
    if (row.product_type && row.product_type !== type) return false;
    return titlesLookLikeSameShopProduct(row.title, title);
  }) || null;
}
