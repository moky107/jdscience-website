const LEVEL_ALIASES = {
  gcse: "GCSE/IGCSE",
  igcse: "GCSE/IGCSE",
  "gcse/igcse": "GCSE/IGCSE",
  "gcse-igcse": "GCSE/IGCSE",
  "a-level": "A-Level",
  alevel: "A-Level",
  "a level": "A-Level",
  "t-level": "T-Level",
  tlevel: "T-Level",
  "t level": "T-Level",
  btec: "BTEC",
  "11+": "11+",
  "11-plus": "11+",
};

const CANONICAL_LEVELS = ["11+", "GCSE/IGCSE", "A-Level", "T-Level", "BTEC"];
const CANONICAL_RES = [
  "Specifications",
  "Revision Notes",
  "Past Questions",
  "Mark Schemes",
  "Examiner Reports",
  "Worksheets",
  "Videos",
];

function matchIgnoreCase(value, options) {
  const needle = String(value || "").trim().toLowerCase();
  if (!needle) return null;
  return options.find((item) => item.toLowerCase() === needle) || null;
}

export function papersHref({ level, subject, res, board } = {}) {
  const params = new URLSearchParams();
  if (level) params.set("level", level);
  if (subject) params.set("subject", subject);
  if (res) params.set("res", res);
  if (board) params.set("board", board);
  const query = params.toString();
  return query ? `/papers?${query}` : "/papers";
}

export function parsePapersQuery(search) {
  const params = new URLSearchParams(search || "");
  const rawLevel = params.get("level") || "";
  const rawSubject = params.get("subject") || "";
  const rawRes = params.get("res") || params.get("type") || "";
  const rawBoard = params.get("board") || "";

  const level = CANONICAL_LEVELS.includes(rawLevel)
    ? rawLevel
    : LEVEL_ALIASES[rawLevel.trim().toLowerCase()] || null;
  const res = matchIgnoreCase(rawRes, CANONICAL_RES);
  const subject = rawSubject.trim() || null;
  const board = rawBoard.trim() || null;

  return {
    level,
    subject,
    res,
    board,
    hasFilters: Boolean(level || subject || res || board),
  };
}
