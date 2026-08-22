import { contextFor } from "./exam.mjs";
import { buildGcseMaths } from "./gcse-maths.mjs";
import { buildAlevelMaths } from "./alevel-maths.mjs";
import { buildScience } from "./science-packs.mjs";
import { buildTLevel } from "./tlevel-packs.mjs";

export function buildQuestions(offering, topicId, topicTitle) {
  const ctx = contextFor(offering);
  ctx.topicTitle = topicTitle;
  let questions;
  if (offering.level === "T-Level") {
    questions = buildTLevel(topicId, ctx);
  } else if (offering.subject === "Maths" && offering.level === "GCSE/IGCSE") {
    questions = buildGcseMaths(topicId, ctx);
  } else if (offering.subject === "Maths" && offering.level === "A-Level") {
    questions = buildAlevelMaths(topicId, ctx);
  } else {
    questions = buildScience(topicId, ctx);
  }
  if (!questions || questions.length < 30) {
    throw new Error(`${offering.board} ${offering.level} ${offering.subject} ${topicId} has ${questions?.length || 0} questions`);
  }
  return questions.slice(0, 32);
}
