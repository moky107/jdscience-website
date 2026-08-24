/* Canonicalise uploaded and static resource records so files appear
   under the correct subject/category and dead storage keys are hidden. */

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function decodeResourceLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw;
  }
}

function blob(resource) {
  return [
    decodeResourceLabel(resource.file_name),
    decodeResourceLabel(resource.title),
    resource.storage_path || "",
    resource.file_url || "",
  ].join(" ").toLowerCase();
}

export function levelKey(level) {
  const s = slugify(level);
  if (s.includes("11")) return "11+";
  if (s.includes("gcse") || s.includes("igcse")) return "GCSE/IGCSE";
  if (s.includes("a-level") || s === "alevel") return "A-Level";
  if (s.includes("t-level") || s === "tlevel") return "T-Level";
  if (s.includes("btec")) return "BTEC";
  return level;
}

export function inferResourceSubject(resource) {
  const level = levelKey(resource.level);
  if (level === "T-Level" || level === "BTEC") return resource.subject;
  const text = blob(resource);
  const name = `${decodeResourceLabel(resource.file_name)} ${decodeResourceLabel(resource.title)}`.toLowerCase();
  if (/\b8463\d|\b8463-|\b1ph0/.test(text)) return "Physics";
  if (/\b8461\d|\b8461-|\b1bi0/.test(text)) return "Biology";
  if (/\b8462\d|\b8462-|\b1ch0/.test(text)) return "Chemistry";
  if (/\b1ma1\b|\b8300/.test(text)) return "Maths";
  if (/physics/.test(name) && !/physical chemistry/.test(name)) return "Physics";
  if (/biology/.test(name)) return "Biology";
  if (/chemistry/.test(name)) return "Chemistry";
  return resource.subject;
}

export function inferResourceCategory(resource) {
  const file = `${decodeResourceLabel(resource.file_name)} ${decodeResourceLabel(resource.title)}`;
  if (/_MS(?:\s*\(\d+\))?\.PDF/i.test(file) || /-W-MS-/i.test(file) || /-MS-/i.test(file) || /mark scheme/i.test(file)) {
    return "Mark Schemes";
  }
  if (/_QU(?:\s*\(\d+\))?\.PDF/i.test(file) || /-QP-/i.test(file) || /-INS-/i.test(file) || /-PT-/i.test(file)) {
    return "Past Questions";
  }
  return resource.resource_category;
}

export function isDeadResource(resource) {
  const text = blob(resource);
  const path = `${resource.storage_path || ""} ${resource.file_url || ""}`.toLowerCase();
  if (path.includes("/biology/") && /physics/.test(text)) return true;
  const url = resource.file_url || "";
  if (
    url.startsWith("/resources/")
    && /\/biology\/[^/]+\/revision-notes\/.+\.pptx$/i.test(url)
    && !resource.file_url_override
  ) {
    return true;
  }
  return false;
}

export function resourceOpenHref(resource) {
  if (!resource) return "#";
  if (resource.file_type === "video-embed") return resource.file_url;
  if (resource.storage_path && resource.id != null && !String(resource.id).startsWith("static-")) {
    return `/api/resource-file?id=${encodeURIComponent(resource.id)}`;
  }
  return resource.file_url;
}

function resourceDedupeKey(resource) {
  const name = slugify(decodeResourceLabel(resource.file_name || resource.title).replace(/\.(pdf|pptx|ppt|html)$/i, ""));
  return [
    levelKey(resource.level),
    slugify(resource.subject),
    slugify(resource.exam_board),
    slugify(resource.resource_category),
    name,
  ].join("|");
}

function resourceScore(resource) {
  const url = resource.file_url || "";
  let score = 0;
  if (/filestore\.aqa\.org\.uk|qualifications\.pearson\.com|ocr\.org\.uk|eduqas\.co\.uk|wjec\.co\.uk/.test(url)) score += 6;
  if (url.startsWith("/worksheets/")) score += 5;
  if (url.startsWith("/resources/") && /revision-notes/.test(url) && url.endsWith("/")) score += 4;
  if (url.startsWith("/resources/") && !resource.storage_path) score += 3;
  if (resource.storage_path) score += 2;
  if (String(resource.id || "").startsWith("static-")) score += 1;
  return score;
}

export function canonicalizeResource(resource) {
  if (!resource || resource.published === false) return null;
  const title = decodeResourceLabel(resource.title);
  const fileName = decodeResourceLabel(resource.file_name || resource.title);
  const next = {
    ...resource,
    title: title || resource.title,
    file_name: fileName || resource.file_name,
    subject: inferResourceSubject({ ...resource, title, file_name: fileName }),
    resource_category: inferResourceCategory({ ...resource, title, file_name: fileName }),
  };
  if (isDeadResource(next)) return null;
  return next;
}

export function mergeResourceCatalog(uploaded, staticItems) {
  const merged = new Map();
  for (const row of [...(uploaded || []), ...(staticItems || [])]) {
    const item = canonicalizeResource(row);
    if (!item) continue;
    const key = resourceDedupeKey(item);
    const existing = merged.get(key);
    if (!existing || resourceScore(item) > resourceScore(existing)) merged.set(key, item);
  }
  return [...merged.values()];
}

export function repairPatchForResource(resource) {
  const next = canonicalizeResource({ ...resource, published: true });
  if (!next) {
    return { published: false };
  }
  const patch = {};
  if (next.subject && next.subject !== resource.subject) patch.subject = next.subject;
  if (next.resource_category && next.resource_category !== resource.resource_category) {
    patch.resource_category = next.resource_category;
  }
  if (next.title && next.title !== resource.title) patch.title = next.title;
  if (next.file_name && next.file_name !== resource.file_name) patch.file_name = next.file_name;
  if (isDeadResource(resource)) patch.published = false;
  return patch;
}
