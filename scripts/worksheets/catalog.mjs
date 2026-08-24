/** Helpers for pairing worksheets with their separate answer sheets. */

export function isAnswerSheet(item) {
  const name = item.file_name || "";
  const url = item.file_url_override || "";
  return /(^|\/)answers\.html$/i.test(name)
    || /-answers\.html$/i.test(name)
    || /(^|\/)answers\.html$/i.test(url)
    || /-answers\.html$/i.test(url);
}

export function answersUrlFor(item) {
  const url = item.file_url_override || "";
  if (/worksheet\.html$/i.test(url)) return url.replace(/worksheet\.html$/i, "answers.html");
  if (/\.html$/i.test(url) && !isAnswerSheet(item)) return url.replace(/\.html$/i, "-answers.html");
  return null;
}

export function unitNumberFromId(topicId) {
  const match = String(topicId || "").match(/^unit-(\d+)$/);
  return match ? Number(match[1]) : null;
}

export function unitTopicRest(topicTitle) {
  return String(topicTitle || "").replace(/^Unit\s+\d+\s*[—–-]\s*/i, "").trim();
}

export function unitDisplayTitles(topicId, topicTitle, questionCount) {
  const n = unitNumberFromId(topicId);
  if (!n) {
    return {
      worksheetTitle: `${topicTitle} — JD Science worksheet (${questionCount} questions)`,
      answersTitle: `${topicTitle} — JD Science answers`,
      worksheetSeries: "JD Science topic worksheets",
      answersSeries: "JD Science answer sheets",
      worksheetHeading: topicTitle,
      answersHeading: topicTitle,
    };
  }
  const rest = unitTopicRest(topicTitle) || topicTitle;
  return {
    worksheetTitle: `Unit ${n} worksheet — ${rest}`,
    answersTitle: `Unit ${n} answers — ${rest}`,
    worksheetSeries: `Unit ${n}`,
    answersSeries: `Unit ${n}`,
    worksheetHeading: `Unit ${n} worksheet — ${rest}`,
    answersHeading: `Unit ${n} answers — ${rest}`,
  };
}

export function compareTopicTitles(a, b) {
  const unitA = String(a || "").match(/^Unit\s+(\d+)/i);
  const unitB = String(b || "").match(/^Unit\s+(\d+)/i);
  if (unitA && unitB) {
    const diff = Number(unitA[1]) - Number(unitB[1]);
    if (diff) return diff;
  }
  return String(a || "").localeCompare(String(b || ""));
}
