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

const DEAD_PHYSICS_UNDER_BIOLOGY_IDS = new Set([65, 66, 67, 68, 69]);

function isPhysicsNamed(resource) {
  const name = `${decodeResourceLabel(resource.file_name)} ${decodeResourceLabel(resource.title)}`.toLowerCase();
  return /physics/.test(name) && !/physical chemistry/.test(name);
}

function isBiologyLocation(resource) {
  const path = `${resource.storage_path || ""} ${resource.file_url || ""}`.toLowerCase();
  return String(resource.subject || "").toLowerCase() === "biology" || path.includes("/biology/");
}

function isMissingLocalRevisionBinary(resource) {
  const url = resource.file_url || "";
  const file = decodeResourceLabel(resource.file_name || "");
  const category = String(resource.resource_category || "").toLowerCase();
  const subject = String(resource.subject || "").toLowerCase();
  if (resource.file_url_override) return false;
  if (resource.storage_path) return false;
  const isRevision = category.includes("revision");
  const looksBinary = /\.(pptx?|pdf)$/i.test(url) || /\.(pptx?|pdf)$/i.test(file);
  if (!isRevision || !looksBinary) return false;
  if (url.startsWith("/resources/") && /\/biology\//i.test(url)) return true;
  if (subject === "biology" && looksBinary) return true;
  return false;
}

export function isDeadResource(resource) {
  if (!resource) return true;
  if (DEAD_PHYSICS_UNDER_BIOLOGY_IDS.has(Number(resource.id))) return true;
  if (isBiologyLocation(resource) && isPhysicsNamed(resource)) return true;
  if (isMissingLocalRevisionBinary(resource)) return true;
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

const PHYSICS_TOPICS = [
  { re: /\benergy\b/i, n: 1, label: "Energy" },
  { re: /\belectricity\b/i, n: 2, label: "Electricity" },
  { re: /\bparticle/i, n: 3, label: "Particle model" },
  { re: /\batomic|\bradioactiv/i, n: 4, label: "Atomic structure" },
  { re: /\bforces?\b/i, n: 5, label: "Forces" },
  { re: /\bwaves?\b/i, n: 6, label: "Waves" },
];

const BIOLOGY_TOPICS = [
  { re: /\bcell\b|\btopic\s*1\b|\btopic1\b|\bb1\b/i, n: 1, label: "Cell biology" },
  { re: /\borganisation|\borganization|\btopic\s*2\b|\bb2\b/i, n: 2, label: "Organisation" },
  { re: /\binfection|\btopic\s*3\b|\bb3\b/i, n: 3, label: "Infection and response" },
  { re: /\bbioenergetic|\btopic\s*4\b|\bb4\b/i, n: 4, label: "Bioenergetics" },
  { re: /\bhomeostasis|\btopic\s*5\b|\bb5\b/i, n: 5, label: "Homeostasis and response" },
  { re: /\binheritance|\bevolution|\btopic\s*6\b|\bb6\b/i, n: 6, label: "Inheritance, variation and evolution" },
  { re: /\becology|\btopic\s*7\b|\bb7\b/i, n: 7, label: "Ecology" },
];

function looksLikeUploadedDeck(resource) {
  const title = String(resource.title || "");
  const file = String(resource.file_name || "");
  const decoded = `${decodeResourceLabel(title)} ${decodeResourceLabel(file)} ${resource.storage_path || ""}`;
  return (
    /^\d{10,}/.test(title) ||
    /^\d{10,}/.test(file) ||
    /^\d{10,}/.test(decodeResourceLabel(file)) ||
    /%20/i.test(title) ||
    /%20/i.test(file) ||
    /jdscience/i.test(decoded) ||
    (/\.pptx?$/i.test(file) && /revision notes/i.test(String(resource.resource_category || "")))
  );
}

function stripTitleBoilerplate(value) {
  return decodeResourceLabel(value)
    .replace(/\.(pptx?|pdf|html)$/i, "")
    .replace(/^\d{10,}-?/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b20\b/g, " ")
    .replace(/\bjdscience\b/ig, "")
    .replace(/\b(aqa|edexcel|ocr|eduqas|wjec|gcse|igcse)\b/ig, "")
    .replace(/\(\s*\d+\s*\)/g, "")
    .replace(/\bfinal\b/ig, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCasePhrase(value) {
  const small = new Set(["and", "of", "the", "a"]);
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && small.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function tidyResourceTitle(resource) {
  const decodedTitle = decodeResourceLabel(resource.title || "");
  if (!looksLikeUploadedDeck(resource)) return decodedTitle || decodeResourceLabel(resource.file_name || "");
  const haystack = blob(resource).replace(/[_-]+/g, " ");
  const subject = inferResourceSubject(resource);
  if (subject === "Physics" || /physics/.test(haystack)) {
    for (const topic of PHYSICS_TOPICS) {
      if (topic.re.test(haystack)) return `Physics topic ${topic.n}: ${topic.label}`;
    }
  }
  if (subject === "Biology" || /biology/.test(haystack)) {
    for (const topic of BIOLOGY_TOPICS) {
      if (topic.re.test(haystack)) return `Biology topic ${topic.n}: ${topic.label}`;
    }
  }
  const cleaned = stripTitleBoilerplate(decodedTitle || resource.file_name || "")
    .replace(new RegExp(`^${subject}\\s+`, "i"), "")
    .replace(/\btopic\s*\d+\b/ig, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned && subject && !new RegExp(`^${subject}$`, "i").test(cleaned)) {
    return `${subject}: ${titleCasePhrase(cleaned)}`;
  }
  return titleCasePhrase(cleaned) || decodedTitle;
}

export function tidyDownloadFilename(resource) {
  const title = tidyResourceTitle(resource);
  const slug = slugify(title) || "resource";
  const original = decodeResourceLabel(resource.file_name || resource.title || "");
  const extMatch = original.match(/\.(pptx?|pdf|html)$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : "";
  return ext ? `${slug}${ext}` : slug;
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
  if (isDeadResource(resource)) return null;
  const title = tidyResourceTitle(resource);
  const fileName = looksLikeUploadedDeck(resource)
    ? tidyDownloadFilename({ ...resource, title })
    : decodeResourceLabel(resource.file_name || resource.title);
  const next = {
    ...resource,
    title: title || resource.title,
    file_name: fileName || resource.file_name,
    subject: inferResourceSubject({ ...resource, title, file_name: fileName }),
    resource_category: inferResourceCategory({ ...resource, title, file_name: fileName }),
  };
  if (isDeadResource(next) || (next.subject === "Biology" && isPhysicsNamed(resource))) return null;
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
