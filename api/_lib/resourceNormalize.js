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
  { re: /\benergy\b/i, n: 1, label: "Energy", slug: "energy" },
  { re: /\belectricity\b/i, n: 2, label: "Electricity", slug: "electricity" },
  { re: /\bparticle/i, n: 3, label: "Particle model", slug: "particle-model" },
  { re: /\batomic|\bradioactiv/i, n: 4, label: "Atomic structure", slug: "atomic-structure" },
  { re: /\bforces?\b/i, n: 5, label: "Forces", slug: "forces" },
  { re: /\bwaves?\b/i, n: 6, label: "Waves", slug: "waves" },
  { re: /\bmagnetism|\belectromagnetism/i, n: 7, label: "Magnetism", slug: "magnetism" },
  { re: /\bspace\b|\bastronomy\b/i, n: 8, label: "Space physics", slug: "space-physics" },
];

const BIOLOGY_TOPICS = [
  { re: /\bcell\b|\btopic\s*1\b|\btopic1\b|\bb1\b/i, n: 1, label: "Cell biology", slug: "cell-biology" },
  { re: /\borganisation|\borganization|\btopic\s*2\b|\bb2\b/i, n: 2, label: "Organisation", slug: "organisation" },
  { re: /\binfection|\btopic\s*3\b|\bb3\b/i, n: 3, label: "Infection and response", slug: "infection-and-response" },
  { re: /\bbioenergetic|\btopic\s*4\b|\bb4\b/i, n: 4, label: "Bioenergetics", slug: "bioenergetics" },
  { re: /\bhomeostasis|\btopic\s*5\b|\bb5\b/i, n: 5, label: "Homeostasis and response", slug: "homeostasis" },
  { re: /\binheritance|\bevolution|\btopic\s*6\b|\bb6\b/i, n: 6, label: "Inheritance and evolution", slug: "inheritance" },
  { re: /\becology|\btopic\s*7\b|\bb7\b/i, n: 7, label: "Ecology", slug: "ecology" },
];

const CHEMISTRY_TOPICS = [
  { re: /\bc3\b|quantitative/i, n: 3, label: "Quantitative chemistry", slug: "quantitative-chemistry" },
  { re: /\bc2\b|bonding/i, n: 2, label: "Bonding and structure", slug: "bonding" },
  { re: /\bc5\b|energy changes/i, n: 5, label: "Energy changes", slug: "energy-changes" },
  { re: /\bc6\b|rate and extent/i, n: 6, label: "Rate and extent", slug: "rate-and-extent" },
  { re: /\bc7\b|organic chemistry/i, n: 7, label: "Organic chemistry", slug: "organic-chemistry" },
  { re: /\bc8\b|chemical analysis/i, n: 8, label: "Chemical analysis", slug: "chemical-analysis" },
  { re: /\bc9\b|atmosphere/i, n: 9, label: "Atmosphere", slug: "atmosphere" },
  { re: /\bc10\b|using resources/i, n: 10, label: "Using resources", slug: "using-resources" },
  { re: /\bc1\b|key concepts|\btopic\s*1\b/i, n: 1, label: "Key concepts", slug: "key-concepts" },
  { re: /\btopic\s*2\b|states of matter/i, n: 2, label: "States of matter", slug: "states-of-matter" },
  { re: /\bc4\b/i, n: 4, label: "Chemical changes", slug: "chemical-changes" },
  { re: /\btopic\s*3\b|chemical changes/i, n: 3, label: "Chemical changes", slug: "chemical-changes" },
  { re: /\btopic\s*4\b|extracting metals/i, n: 4, label: "Extracting metals", slug: "extracting-metals" },
  { re: /\btopic\s*5\b|separate chemistry 1/i, n: 5, label: "Separate chemistry 1", slug: "separate-chemistry-1" },
  { re: /\btopic\s*6\b|groups in the periodic/i, n: 6, label: "Periodic table groups", slug: "periodic-table-groups" },
  { re: /\btopic\s*8\b|fuels and earth/i, n: 8, label: "Fuels and earth science", slug: "fuels-and-earth-science" },
  { re: /\btopic\s*9\b|separate chemistry 2/i, n: 9, label: "Separate chemistry 2", slug: "separate-chemistry-2" },
];

function pathBasename(resource) {
  return String(resource.storage_path || resource.file_url || "").split("/").pop() || "";
}

function looksLikeOfficialPaper(resource) {
  const file = decodeResourceLabel(resource.file_name || resource.title || "");
  return /^(AQA-|OCR-|WJEC-|EDUQAS-|1[A-Z]{2}\d|846[123])/i.test(file)
    || /_QP-|_MS-|_QU(?:_|\s|\.|\(|$)|_PEF|-que-|-rms-|-msc-|-ins-/i.test(file);
}

function looksLikeUploadedDeck(resource) {
  if (looksLikeOfficialPaper(resource)) return false;
  const title = String(resource.title || "");
  const file = String(resource.file_name || "");
  const decoded = `${decodeResourceLabel(title)} ${decodeResourceLabel(file)} ${resource.storage_path || ""}`;
  const base = pathBasename(resource);
  return (
    /^\d{10,}-/.test(title) ||
    /^\d{10,}-/.test(file) ||
    /^\d{10,}-/.test(decodeResourceLabel(file)) ||
    /^\d{10,}-/.test(base) ||
    /%20/i.test(title) ||
    /%20/i.test(file) ||
    /jdscience/i.test(decoded) ||
    (/_[0-9a-f]{6,}\b/i.test(decoded) && /\.pptx?/i.test(file)) ||
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
    .replace(/\bworksheet\b/ig, "")
    .replace(/\bmodules?\b/ig, "modules")
    .replace(/[_\s-][0-9a-f]{6,}\b/ig, "")
    .replace(/\(\s*\d+\s*\)/g, "")
    .replace(/\bfinal\b/ig, "")
    .replace(/\bv\d+\b/ig, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCasePhrase(value) {
  const small = new Set(["and", "of", "the", "a", "in"]);
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (/^\d/.test(word)) return word;
      if (index > 0 && small.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function matchTopic(list, haystack) {
  return list.find((topic) => topic.re.test(haystack)) || null;
}

function jdTitle(subject, topic) {
  if (topic?.n) return `JDScience ${subject} topic ${topic.n}: ${topic.label}`;
  if (topic?.label) return `JDScience ${subject}: ${topic.label}`;
  return `JDScience ${subject}`;
}

export function tidyResourceTitle(resource) {
  const decodedTitle = decodeResourceLabel(resource.title || "");
  if (!looksLikeUploadedDeck(resource)) return decodedTitle || decodeResourceLabel(resource.file_name || "");
  const haystack = blob(resource).replace(/[_-]+/g, " ");
  const subject = inferResourceSubject(resource) || "Resource";
  const category = String(resource.resource_category || "").toLowerCase();
  const isNotes = category.includes("revision");

  if (isNotes) {
    if (subject === "Physics" || /\bphysics\b/.test(haystack)) {
      const topic = matchTopic(PHYSICS_TOPICS, haystack);
      if (topic) return jdTitle("Physics", topic);
    }
    if (subject === "Biology" || /\bbiolog/.test(haystack)) {
      const topic = matchTopic(BIOLOGY_TOPICS, haystack);
      if (topic) return jdTitle("Biology", topic);
    }
    if (subject === "Chemistry" || /\bchemistr/.test(haystack)) {
      const topic = matchTopic(CHEMISTRY_TOPICS, haystack);
      if (topic) return jdTitle("Chemistry", topic);
    }
  }

  let cleaned = stripTitleBoilerplate(decodedTitle || resource.file_name || pathBasename(resource))
    .replace(new RegExp(`^${subject}\\s+`, "i"), "")
    .replace(/\btopic(\d+)\b/ig, "topic $1")
    .replace(/\s+/g, " ")
    .trim();
  cleaned = cleaned.replace(/\bmodules\s+(\d+)\s+(\d+)\b/ig, "modules $1-$2");
  if (cleaned && subject && !new RegExp(`^${subject}$`, "i").test(cleaned)) {
    return `JDScience ${subject}: ${titleCasePhrase(cleaned)}`;
  }
  return cleaned ? `JDScience ${titleCasePhrase(cleaned)}` : decodedTitle;
}

export function tidyDownloadFilename(resource) {
  const original = decodeResourceLabel(resource.file_name || resource.title || pathBasename(resource));
  if (!looksLikeUploadedDeck(resource)) return original || "resource";
  const extMatch = original.match(/\.(pptx?|pdf|html)$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : "";
  const haystack = blob(resource).replace(/[_-]+/g, " ");
  const subject = slugify(inferResourceSubject(resource) || "resource");
  const category = String(resource.resource_category || "").toLowerCase();
  const isNotes = category.includes("revision");
  let topicSlug = "";
  if (isNotes) {
    const list = subject === "physics" ? PHYSICS_TOPICS : subject === "biology" ? BIOLOGY_TOPICS : subject === "chemistry" ? CHEMISTRY_TOPICS : [];
    const topic = matchTopic(list, haystack);
    if (topic) topicSlug = topic.slug;
  }
  if (!topicSlug) {
    topicSlug = slugify(
      stripTitleBoilerplate(original)
        .replace(new RegExp(`^${inferResourceSubject(resource) || ""}\\s+`, "i"), ""),
    );
  }
  const base = ["jdscience", subject, topicSlug].filter(Boolean).join("-").replace(/-+/g, "-");
  return ext ? `${base}${ext}` : base;
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
