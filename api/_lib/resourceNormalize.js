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
    const looksEncoded = /%[0-9A-Fa-f]{2}/.test(raw);
    const prepared = looksEncoded ? raw.replace(/\+/g, " ") : raw;
    return decodeURIComponent(prepared);
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
    resource.series_label || "",
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

/** Explicit JDScience authorship markers only — never storage path / host alone. */
export function isJdScienceAuthored(resource) {
  const title = decodeResourceLabel(resource?.title || "");
  const file = decodeResourceLabel(resource?.file_name || "");
  const series = String(resource?.series_label || "");
  const url = `${resource?.file_url_override || ""} ${resource?.file_url || ""}`;
  if (/jdscience|jd\s*science/i.test(`${title} ${file} ${series}`)) return true;
  // Public original worksheet HTML/PDF library only — not Supabase ".../worksheets/..." storage folders.
  if (/(?:^|[\s"'])\/worksheets\//i.test(url) || /^\/worksheets\//i.test(String(resource?.file_url_override || "")) || /^\/worksheets\//i.test(String(resource?.file_url || ""))) {
    return true;
  }
  if (/\/resources\/11-plus\//i.test(url) && /jdscience/i.test(`${title} ${file} ${url}`)) return true;
  return false;
}

const EDEXCEL_GCSE_CHEM_TOPIC_RE =
  /topic\s*_?\s*1\b.*key\s*concepts|key\s*concepts\s*in\s*chemistry|topic\s*_?\s*2\b.*states\s*of\s*matter|topic\s*_?\s*3\b.*chemical\s*changes|topic\s*_?\s*4\b.*extracting\s*metals|topic\s*_?\s*5\b.*separate\s*chemistry|topic\s*_?\s*6\b.*groups\s*in\s*the\s*periodic|topic\s*_?\s*7\b.*rates\s*(and|&)\s*energy|topic\s*_?\s*8\b.*fuels\s*(and|&)\s*earth|topic\s*_?\s*9\b.*separate\s*chemistry/i;

const TLEVEL_SIGNAL_RE =
  /\bt[\s_-]*level\b|\btlevel\b|specification\s*points?\s*a1[0-5]|core\s*chemistry\s*a1[0-5]|a10\s*[-–—to]+\s*a15/i;

const ALEVEL_CHEM_SIGNAL_RE =
  /\ba[\s_-]*level\b|mass\s*spectra|infrared|further\s*equilibrium|topic\s*2\.12|hess'?s?\s*law|calorimetr/i;

export function looksLikeTLevelResource(resource) {
  return TLEVEL_SIGNAL_RE.test(blob(resource));
}

export function looksLikeEdexcelGcseChemistryTopic(resource) {
  const text = blob(resource).replace(/[_-]+/g, " ");
  if (TLEVEL_SIGNAL_RE.test(text)) return false;
  if (ALEVEL_CHEM_SIGNAL_RE.test(text) && !EDEXCEL_GCSE_CHEM_TOPIC_RE.test(text)) return false;
  return EDEXCEL_GCSE_CHEM_TOPIC_RE.test(text);
}

export function inferResourceLevel(resource) {
  if (looksLikeTLevelResource(resource)) return "T-Level";
  if (looksLikeEdexcelGcseChemistryTopic(resource)) return "GCSE/IGCSE";
  return levelKey(resource.level) || resource.level;
}

export function inferResourceExamBoard(resource) {
  const text = blob(resource);
  if (looksLikeTLevelResource(resource)) {
    if (/ncfe/.test(text)) return "NCFE";
    if (/pearson|edexcel/.test(text)) return "Pearson";
    return resource.exam_board || "Pearson";
  }
  if (looksLikeEdexcelGcseChemistryTopic(resource)) return "Edexcel";
  // Prefer explicit board tokens in the filename/title over a mismatched stored board.
  if (/\baqa\b/.test(text) && !/\bedexcel\b/.test(text)) return "AQA";
  if (/\bedexcel\b/.test(text) && !/\baqa\b/.test(text)) return "Edexcel";
  if (/\bocr\b/.test(text)) return "OCR";
  if (/\beduqas\b/.test(text)) return "Eduqas";
  if (/\bwjec\b/.test(text)) return "WJEC";
  return resource.exam_board;
}

export function inferResourceSubject(resource) {
  const level = inferResourceLevel(resource);
  if (level === "T-Level") {
    const text = blob(resource);
    if (/food\s*science/.test(text)) return "Food Sciences";
    if (/laboratory/.test(text)) return "Laboratory Sciences";
    if (/healthcare\s*science/.test(text)) return "Healthcare Science";
    if (/\bhealth\b/.test(text) && !/healthcare/.test(text) && !/chemistry|physics|biology|science\b/.test(text)) {
      return "Health";
    }
    // Core chemistry / science decks belong under T-Level Science, even if a GCSE Chemistry subject was stored.
    if (/core\s*chemistry|a10|a15|t[\s_-]*level.*chem|chem.*t[\s_-]*level|\bscience\b/.test(text)) {
      return "Science";
    }
    if (resource.subject && /science|laboratory|food|health/i.test(resource.subject)) {
      return resource.subject;
    }
    return "Science";
  }
  if (level === "BTEC") return resource.subject;
  if (looksLikeEdexcelGcseChemistryTopic(resource)) return "Chemistry";
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
  if (/worksheet|workbook|fill[_\s-]?in/i.test(file) && !/revision\s*notes?/i.test(file)) {
    return "Worksheets";
  }
  if (/\.pptx?$/i.test(file) && /revision|notes|deck|teaching/i.test(file)) {
    return resource.resource_category || "Revision Notes";
  }
  const current = String(resource.resource_category || "").trim();
  if (!current) return "Resource";
  return current;
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

const AWARDING_BODY_URL = /filestore\.aqa\.org\.uk|qualifications\.pearson\.com|ocr\.org\.uk|eduqas\.co\.uk|wjec\.co\.uk|ncfe\.org\.uk/i;
const EXAM_MATERIAL_CATEGORIES = /^(Past Questions|Mark Schemes|Examiner Reports)$/i;

export function hasAwardingBodyUrl(resource) {
  const url = `${resource?.file_url_override || ""} ${resource?.file_url || ""}`;
  return AWARDING_BODY_URL.test(url);
}

export function looksLikeOfficialPaper(resource) {
  const file = decodeResourceLabel(resource.file_name || resource.title || "");
  return /^(AQA-|OCR-|WJEC-|EDUQAS-|1[A-Z]{2}\d|846[123])/i.test(file)
    || /_QP-|_MS-|_QU(?:_|\s|\.|\(|$)|_PEF|-que-|-rms-|-msc-|-ins-/i.test(file)
    || /\b31617h\b/i.test(file)
    || /question-paper-btec|mark-scheme-btec|examiner-report-btec/i.test(file)
    || /unit\d-.*-(question-paper|mark-scheme|examiner-report)/i.test(file);
}

function isExamMaterialCategory(resource) {
  return EXAM_MATERIAL_CATEGORIES.test(String(resource?.resource_category || ""));
}

function isOriginalJdScienceFile(resource) {
  if (isJdScienceAuthored(resource)) return true;
  const url = String(resource?.file_url_override || resource?.file_url || "");
  // Hosted 11+ originals are JD Science materials even when the filename omits the brand.
  if (url.startsWith("/resources/11-plus/")) return true;
  return false;
}

export function isHostedOfficialExamCopy(resource) {
  if (!resource || hasAwardingBodyUrl(resource) || isOriginalJdScienceFile(resource)) return false;
  if (looksLikeOfficialPaper(resource)) return true;
  if (!isExamMaterialCategory(resource)) return false;
  const file = decodeResourceLabel(resource.file_name || resource.title || "");
  const url = resource.file_url || "";
  if (resource.storage_path) return true;
  if (url.startsWith("/resources/") && /\.pdf$/i.test(file || url)) return true;
  if (!url && !resource.file_url_override && /\.pdf$/i.test(file)) return true;
  return false;
}

export function isDeadResource(resource) {
  if (!resource) return true;
  if (DEAD_PHYSICS_UNDER_BIOLOGY_IDS.has(Number(resource.id))) return true;
  if (isBiologyLocation(resource) && isPhysicsNamed(resource)) return true;
  if (isMissingLocalRevisionBinary(resource)) return true;
  if (isHostedOfficialExamCopy(resource)) return true;
  return false;
}

export function resourceOpenHref(resource) {
  if (!resource) return "#";
  if (resource.file_type === "video-embed") return resource.file_url;
  if (isHostedOfficialExamCopy(resource)) return "#";
  if (hasAwardingBodyUrl(resource) && (looksLikeOfficialPaper(resource) || isExamMaterialCategory(resource))) {
    return resource.file_url_override || resource.file_url;
  }
  if (resource.storage_path && resource.id != null && !String(resource.id).startsWith("static-")) {
    return `/api/education-posts?kind=file&id=${encodeURIComponent(resource.id)}`;
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

/** GCSE Chemistry topic labels — only used when level is GCSE/IGCSE. */
const CHEMISTRY_TOPICS = [
  { re: /\btopic\s*_?\s*7\b|rates\s*(and|&)\s*energy/i, n: 7, label: "Rates and energy changes", slug: "rates-and-energy-changes" },
  { re: /\bc3\b|quantitative/i, n: 3, label: "Quantitative chemistry", slug: "quantitative-chemistry" },
  { re: /\bc2\b|bonding/i, n: 2, label: "Bonding and structure", slug: "bonding" },
  { re: /\bc5\b|(?<!rates\s(and|&)\s)energy changes/i, n: 5, label: "Energy changes", slug: "energy-changes" },
  { re: /\bc6\b|rate and extent/i, n: 6, label: "Rate and extent", slug: "rate-and-extent" },
  { re: /\bc7\b|organic chemistry/i, n: 7, label: "Organic chemistry", slug: "organic-chemistry" },
  { re: /\bc8\b|chemical analysis/i, n: 8, label: "Chemical analysis", slug: "chemical-analysis" },
  { re: /\bc9\b|atmosphere/i, n: 9, label: "Atmosphere", slug: "atmosphere" },
  { re: /\bc10\b|using resources/i, n: 10, label: "Using resources", slug: "using-resources" },
  { re: /\bc1\b|key concepts|\btopic\s*_?\s*1\b/i, n: 1, label: "Key concepts", slug: "key-concepts" },
  { re: /\btopic\s*_?\s*2\b|states of matter/i, n: 2, label: "States of matter", slug: "states-of-matter" },
  { re: /\bc4\b/i, n: 4, label: "Chemical changes", slug: "chemical-changes" },
  { re: /\btopic\s*_?\s*3\b|chemical changes/i, n: 3, label: "Chemical changes", slug: "chemical-changes" },
  { re: /\btopic\s*_?\s*4\b|extracting metals/i, n: 4, label: "Extracting metals", slug: "extracting-metals" },
  { re: /\btopic\s*_?\s*5\b|separate chemistry 1/i, n: 5, label: "Separate chemistry 1", slug: "separate-chemistry-1" },
  { re: /\btopic\s*_?\s*6\b|groups in the periodic/i, n: 6, label: "Periodic table groups", slug: "periodic-table-groups" },
  { re: /\btopic\s*_?\s*8\b|fuels and earth/i, n: 8, label: "Fuels and earth science", slug: "fuels-and-earth-science" },
  { re: /\btopic\s*_?\s*9\b|separate chemistry 2/i, n: 9, label: "Separate chemistry 2", slug: "separate-chemistry-2" },
];

function pathBasename(resource) {
  return String(resource.storage_path || resource.file_url || "").split("/").pop() || "";
}

function looksLikeUploadedDeck(resource) {
  const hostedUrl = `${resource.file_url_override || ""} ${resource.file_url || ""}`;
  if (hostedUrl.includes("/resources/11-plus/")) return false;
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

function edexcelGcseChemistryTitle(resource) {
  const haystack = blob(resource).replace(/[_-]+/g, " ");
  const topic = matchTopic(CHEMISTRY_TOPICS, haystack);
  const authored = isJdScienceAuthored(resource);
  const category = String(inferResourceCategory(resource) || "").toLowerCase();
  const kind = category.includes("worksheet") ? "worksheet" : category.includes("revision") ? "revision notes" : "resource";
  if (topic?.n) {
    const base = `Edexcel GCSE Chemistry Topic ${topic.n}: ${topic.label}`;
    if (authored && kind === "worksheet") return `JDScience worksheet — ${base}`;
    if (authored) return `JDScience ${kind} — ${base}`;
    return base;
  }
  const cleaned = titleCasePhrase(stripTitleBoilerplate(resource.title || resource.file_name || ""));
  return cleaned || "Edexcel GCSE Chemistry resource";
}

function tLevelTitle(resource) {
  const haystack = blob(resource).replace(/[_-]+/g, " ");
  const authored = isJdScienceAuthored(resource);
  const category = String(inferResourceCategory(resource) || "").toLowerCase();
  if (/core chemistry|a10|a15/.test(haystack)) {
    if (category.includes("worksheet")) {
      return authored
        ? "JDScience worksheet — T-Level Science Core Chemistry (A10–A15)"
        : "T-Level Science Core Chemistry worksheets (A10–A15)";
    }
    return authored
      ? "JDScience revision notes — T-Level Science Core Chemistry (A10–A15)"
      : "T-Level Science Core Chemistry (A10–A15)";
  }
  const cleaned = titleCasePhrase(
    stripTitleBoilerplate(resource.title || resource.file_name || "")
      .replace(/\btlevel\b/ig, "T-Level")
      .replace(/\bt level\b/ig, "T-Level"),
  );
  return cleaned || "T-Level Science resource";
}

export function tidyResourceTitle(resource) {
  const decodedTitle = decodeResourceLabel(resource.title || "");
  if (looksLikeTLevelResource(resource)) return tLevelTitle(resource);
  if (looksLikeEdexcelGcseChemistryTopic(resource)) return edexcelGcseChemistryTitle(resource);

  if (!looksLikeUploadedDeck(resource)) return decodedTitle || decodeResourceLabel(resource.file_name || "");

  const authored = isJdScienceAuthored(resource);
  const haystack = blob(resource).replace(/[_-]+/g, " ");
  const level = inferResourceLevel(resource);
  const subject = inferResourceSubject(resource) || "Resource";
  const category = String(resource.resource_category || "").toLowerCase();
  const isNotes = category.includes("revision");

  if (isNotes && authored) {
    if (subject === "Physics" || /\bphysics\b/.test(haystack)) {
      const topic = matchTopic(PHYSICS_TOPICS, haystack);
      if (topic) return jdTitle("Physics", topic);
    }
    if (subject === "Biology" || /\bbiolog/.test(haystack)) {
      const topic = matchTopic(BIOLOGY_TOPICS, haystack);
      if (topic) return jdTitle("Biology", topic);
    }
    if (level === "GCSE/IGCSE" && (subject === "Chemistry" || /\bchemistr/.test(haystack))) {
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

  if (!cleaned) {
    return authored ? `JDScience ${subject}` : (decodedTitle || "Resource");
  }

  const phrase = titleCasePhrase(cleaned);
  if (!authored) {
    // Neutral label — never invent "JDScience Worksheet" from storage path alone.
    if (subject && !new RegExp(`^${subject}$`, "i").test(cleaned)) {
      return `${subject}: ${phrase}`;
    }
    return phrase;
  }

  if (category.includes("worksheet")) {
    return `JDScience worksheet — ${subject}: ${phrase}`;
  }
  if (cleaned && subject && !new RegExp(`^${subject}$`, "i").test(cleaned)) {
    return `JDScience ${subject}: ${phrase}`;
  }
  return `JDScience ${phrase}`;
}

export function tidyDownloadFilename(resource) {
  const original = decodeResourceLabel(resource.file_name || resource.title || pathBasename(resource));
  if (!looksLikeUploadedDeck(resource)) return original || "resource";
  const extMatch = original.match(/\.(pptx?|pdf|html)$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : "";
  const haystack = blob(resource).replace(/[_-]+/g, " ");
  const level = inferResourceLevel(resource);
  const subject = slugify(inferResourceSubject(resource) || "resource");
  const category = String(resource.resource_category || "").toLowerCase();
  const isNotes = category.includes("revision");
  const authored = isJdScienceAuthored(resource);
  let topicSlug = "";
  if (isNotes) {
    if (subject === "physics") {
      const topic = matchTopic(PHYSICS_TOPICS, haystack);
      if (topic) topicSlug = topic.slug;
    } else if (subject === "biology") {
      const topic = matchTopic(BIOLOGY_TOPICS, haystack);
      if (topic) topicSlug = topic.slug;
    } else if (subject === "chemistry" && (level === "GCSE/IGCSE" || looksLikeEdexcelGcseChemistryTopic(resource))) {
      const topic = matchTopic(CHEMISTRY_TOPICS, haystack);
      if (topic) topicSlug = topic.slug;
    }
  }
  if (!topicSlug) {
    topicSlug = slugify(
      stripTitleBoilerplate(original)
        .replace(new RegExp(`^${inferResourceSubject(resource) || ""}\\s+`, "i"), ""),
    );
  }
  const prefix = authored ? "jdscience" : slugify(level || "resource");
  const base = [prefix, subject, topicSlug].filter(Boolean).join("-").replace(/-+/g, "-");
  return ext ? `${base}${ext}` : base;
}

/**
 * Assess whether automatic classification is trustworthy for upload/edit flows.
 * Uncertain cases should be confirmed by an admin rather than silently labelled.
 */
export function assessResourceClassification(resource) {
  const reasons = [];
  const suggested = {
    level: inferResourceLevel(resource),
    subject: inferResourceSubject(resource),
    exam_board: inferResourceExamBoard(resource),
    resource_category: inferResourceCategory(resource),
  };

  const declaredLevel = levelKey(resource.level);
  const declaredSubject = resource.subject;
  const declaredBoard = resource.exam_board;
  const declaredCategory = resource.resource_category;

  if (looksLikeTLevelResource(resource) && declaredLevel && declaredLevel !== "T-Level") {
    reasons.push("Filename/title indicates T-Level but another level was selected.");
  }
  if (looksLikeEdexcelGcseChemistryTopic(resource) && declaredLevel && declaredLevel !== "GCSE/IGCSE") {
    reasons.push("Filename/title matches Edexcel GCSE Chemistry topics but another level was selected.");
  }
  if (looksLikeEdexcelGcseChemistryTopic(resource) && declaredBoard && declaredBoard !== "Edexcel") {
    reasons.push("Edexcel GCSE Chemistry topic file listed under a different exam board.");
  }
  if (suggested.subject && declaredSubject && slugify(suggested.subject) !== slugify(declaredSubject)) {
    reasons.push(`Subject signal (${suggested.subject}) conflicts with selected subject (${declaredSubject}).`);
  }
  if (!declaredCategory || String(declaredCategory).toLowerCase() === "resource") {
    reasons.push("Resource type is missing or neutral.");
  }
  if (!isJdScienceAuthored(resource) && /worksheet/i.test(String(declaredCategory || ""))) {
    // Allowed, but do not auto-brand as JDScience worksheet.
  }
  if (!resource.title && !resource.file_name) {
    reasons.push("Title and filename are both missing.");
  }

  const uncertain = reasons.length > 0;
  return {
    ok: !uncertain,
    uncertain,
    reasons,
    suggested,
    needs_review: uncertain,
  };
}

/** Hide resources from a page whose level/subject conflict with verified signals. */
export function resourceMatchesPageContext(resource, { level, subject } = {}) {
  if (!resource) return false;
  const canonical = {
    ...resource,
    level: inferResourceLevel(resource),
    subject: inferResourceSubject(resource),
  };
  if (level && levelKey(canonical.level) !== levelKey(level)) return false;
  if (subject && slugify(canonical.subject) !== slugify(subject)) return false;
  // Prevent T-Level chemistry material appearing under GCSE Chemistry.
  if (levelKey(level) === "GCSE/IGCSE" && looksLikeTLevelResource(resource)) return false;
  if (levelKey(level) === "GCSE/IGCSE" && slugify(subject) === "chemistry" && looksLikeTLevelResource(resource)) {
    return false;
  }
  return true;
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
  if (/filestore\.aqa\.org\.uk|qualifications\.pearson\.com|ocr\.org\.uk|eduqas\.co\.uk|wjec\.co\.uk|ncfe\.org\.uk/.test(url)) score += 6;
  if (url.startsWith("/worksheets/")) score += 5;
  if (url.startsWith("/resources/") && /revision-notes/.test(url) && url.endsWith("/")) score += 4;
  if (url.startsWith("/resources/") && !resource.storage_path) score += 3;
  if (resource.storage_path) score += 2;
  if (String(resource.id || "").startsWith("static-")) score += 1;
  if (isJdScienceAuthored(resource)) score += 1;
  return score;
}

export function canonicalizeResource(resource) {
  if (!resource || resource.published === false) return null;
  if (isDeadResource(resource)) return null;

  const level = inferResourceLevel(resource);
  const subject = inferResourceSubject({ ...resource, level });
  const exam_board = inferResourceExamBoard({ ...resource, level, subject });
  const resource_category = inferResourceCategory({ ...resource, level, subject });
  const assessment = assessResourceClassification({
    ...resource,
    level,
    subject,
    exam_board,
    resource_category,
  });

  const titled = { ...resource, level, subject, exam_board, resource_category };
  const title = tidyResourceTitle(titled);
  const fileName = looksLikeUploadedDeck(titled)
    ? tidyDownloadFilename({ ...titled, title })
    : decodeResourceLabel(resource.file_name || resource.title);

  const next = {
    ...resource,
    level,
    subject,
    exam_board,
    resource_category: resource_category || "Resource",
    title: title || resource.title,
    file_name: fileName || resource.file_name,
    classification_uncertain: assessment.uncertain,
    classification_reasons: assessment.reasons,
    needs_review: assessment.needs_review,
  };

  if (isDeadResource(next) || (next.subject === "Biology" && isPhysicsNamed(resource))) return null;

  // Final guard: never surface T-Level rows under a non-T-Level declared page via wrong level.
  if (looksLikeTLevelResource(resource) && levelKey(next.level) !== "T-Level") return null;

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
  if (next.level && next.level !== resource.level) patch.level = next.level;
  if (next.subject && next.subject !== resource.subject) patch.subject = next.subject;
  if (next.exam_board && next.exam_board !== resource.exam_board) patch.exam_board = next.exam_board;
  if (next.resource_category && next.resource_category !== resource.resource_category) {
    patch.resource_category = next.resource_category;
  }
  if (next.title && next.title !== resource.title) patch.title = next.title;
  if (next.file_name && next.file_name !== resource.file_name) patch.file_name = next.file_name;
  if (isDeadResource(resource)) patch.published = false;
  return patch;
}
