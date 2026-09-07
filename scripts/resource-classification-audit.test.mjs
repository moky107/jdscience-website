import assert from "node:assert/strict";
import {
  assessResourceClassification,
  canonicalizeResource,
  inferResourceExamBoard,
  inferResourceLevel,
  inferResourceSubject,
  isJdScienceAuthored,
  looksLikeEdexcelGcseChemistryTopic,
  looksLikeTLevelResource,
  mergeResourceCatalog,
  resourceMatchesPageContext,
  tidyResourceTitle,
} from "../src/resourceNormalize.js";
import {
  validateResourceUploadMeta,
} from "../api/_lib/resourceUpload.js";

// --- T-Level must not appear under GCSE Chemistry ---
const tLevelWorksheet = {
  id: 373,
  level: "T-Level",
  subject: "Science",
  exam_board: "Pearson",
  resource_category: "Worksheets",
  title: "TLevel_Chemistry_Worksheets_A10-A15",
  file_name: "TLevel_Chemistry_Worksheets_A10-A15.pdf",
  storage_path: "t-level/science/pearson/worksheets/1786619643139-tlevel-chemistry-worksheets-a10-a15-pdf",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/t-level/science/pearson/worksheets/x",
  published: true,
};

assert.equal(looksLikeTLevelResource(tLevelWorksheet), true);
assert.equal(inferResourceLevel(tLevelWorksheet), "T-Level");
assert.equal(inferResourceSubject(tLevelWorksheet), "Science");
assert.equal(resourceMatchesPageContext(tLevelWorksheet, { level: "GCSE/IGCSE", subject: "Chemistry" }), false);
assert.equal(resourceMatchesPageContext(tLevelWorksheet, { level: "T-Level", subject: "Science" }), true);

const tLevelMisfiledAsGcse = {
  ...tLevelWorksheet,
  id: 99901,
  level: "GCSE/IGCSE",
  subject: "Chemistry",
  exam_board: "AQA",
};
const fixedTLevel = canonicalizeResource(tLevelMisfiledAsGcse);
assert.equal(fixedTLevel.level, "T-Level");
assert.equal(fixedTLevel.subject, "Science");
assert.doesNotMatch(fixedTLevel.title, /^JDScience Science:/i);
assert.match(fixedTLevel.title, /T-Level Science Core Chemistry/i);
assert.equal(resourceMatchesPageContext(fixedTLevel, { level: "GCSE/IGCSE", subject: "Chemistry" }), false);

// --- Generic timestamped upload must NOT become "JDScience Worksheet" ---
const genericUpload = {
  id: 99902,
  level: "GCSE/IGCSE",
  subject: "Chemistry",
  exam_board: "AQA",
  resource_category: "Worksheets",
  title: "Teacher_handout_rates",
  file_name: "Teacher_handout_rates.pdf",
  storage_path: "gcse-igcse/chemistry/aqa/worksheets/1786560000000-teacher-handout-rates-pdf",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/gcse-igcse/chemistry/aqa/worksheets/1786560000000-teacher-handout-rates-pdf",
  published: true,
};
assert.equal(isJdScienceAuthored(genericUpload), false);
assert.doesNotMatch(tidyResourceTitle(genericUpload), /JDScience/i);
assert.doesNotMatch(tidyResourceTitle(genericUpload), /JDScience Worksheet/i);
const genericCanonical = canonicalizeResource(genericUpload);
assert.doesNotMatch(genericCanonical.title, /JDScience/i);

// --- Edexcel GCSE Chemistry topic worksheets misfiled under A-Level ---
const gcseChemUnderAlevel = {
  id: 425,
  level: "A-Level",
  subject: "Chemistry",
  exam_board: "AQA",
  resource_category: "Worksheets",
  title: "jdscience_worksheet_topic1_key_concepts",
  file_name: "jdscience_worksheet_topic1_key_concepts.pdf",
  storage_path: "a-level/chemistry/aqa/worksheets/x",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/a-level/chemistry/aqa/worksheets/x",
  published: true,
};
assert.equal(looksLikeEdexcelGcseChemistryTopic(gcseChemUnderAlevel), true);
assert.equal(inferResourceLevel(gcseChemUnderAlevel), "GCSE/IGCSE");
assert.equal(inferResourceExamBoard(gcseChemUnderAlevel), "Edexcel");
const moved = canonicalizeResource(gcseChemUnderAlevel);
assert.equal(moved.level, "GCSE/IGCSE");
assert.equal(moved.exam_board, "Edexcel");
assert.equal(moved.subject, "Chemistry");
assert.match(moved.title, /JDScience worksheet/i);
assert.match(moved.title, /Topic 1/i);

// --- Wrong board copies of Edexcel GCSE chem worksheets ---
const aqaCopyOfEdexcel = {
  id: 290,
  level: "GCSE/IGCSE",
  subject: "Chemistry",
  exam_board: "AQA",
  resource_category: "Worksheets",
  title: "Topic9_Separate_Chemistry_2_Worksheet",
  file_name: "Topic9_Separate_Chemistry_2_Worksheet.pdf",
  storage_path: "gcse-igcse/chemistry/aqa/worksheets/1786563485515-topic9-separate-chemistry-2-worksheet-pdf",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/gcse-igcse/chemistry/aqa/worksheets/x",
  published: true,
};
assert.equal(inferResourceExamBoard(aqaCopyOfEdexcel), "Edexcel");
assert.equal(canonicalizeResource(aqaCopyOfEdexcel).exam_board, "Edexcel");
// No JDScience brand from filename alone
assert.equal(isJdScienceAuthored(aqaCopyOfEdexcel), false);
assert.doesNotMatch(canonicalizeResource(aqaCopyOfEdexcel).title, /^JDScience Worksheet/i);

// --- A-Level topic notes must not be remapped via GCSE chemistry topic regex ---
const alevelRedox = {
  id: 389,
  level: "A-Level",
  subject: "Chemistry",
  exam_board: "AQA",
  resource_category: "Revision Notes",
  title: "Topic 3 Redox",
  file_name: "Topic 3 Redox.pptx",
  storage_path: "a-level/chemistry/aqa/revision-notes/x",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/a-level/chemistry/aqa/revision-notes/x",
  published: true,
};
assert.equal(looksLikeEdexcelGcseChemistryTopic(alevelRedox), false);
assert.equal(inferResourceLevel(alevelRedox), "A-Level");
assert.doesNotMatch(tidyResourceTitle(alevelRedox), /Separate chemistry|Chemical changes/i);

// --- Upload validation blocks cross-level contamination without confirmation ---
const blocked = validateResourceUploadMeta({
  level: "GCSE/IGCSE",
  subject: "Chemistry",
  exam_board: "AQA",
  resource_category: "Worksheets",
  title: "TLevel Chemistry Worksheets A10-A15",
  file_name: "TLevel_Chemistry_Worksheets_A10-A15.pdf",
  contentType: "application/pdf",
  fileSize: 1024,
});
assert.equal(blocked.ok, false);
assert.equal(blocked.needsConfirmation, true);
assert.ok(blocked.reasons.some((r) => /T-Level/i.test(r)));

const confirmed = validateResourceUploadMeta({
  ...blocked,
  level: "T-Level",
  subject: "Science",
  exam_board: "Pearson",
  resource_category: "Worksheets",
  title: "TLevel Chemistry Worksheets A10-A15",
  file_name: "TLevel_Chemistry_Worksheets_A10-A15.pdf",
  contentType: "application/pdf",
  fileSize: 1024,
  confirm_classification: true,
});
// Still may need confirm if uncertain flags remain — with matching metadata should be ok
assert.equal(
  validateResourceUploadMeta({
    level: "T-Level",
    subject: "Science",
    exam_board: "Pearson",
    resource_category: "Worksheets",
    title: "TLevel Chemistry Worksheets A10-A15",
    file_name: "TLevel_Chemistry_Worksheets_A10-A15.pdf",
    contentType: "application/pdf",
    fileSize: 1024,
  }).ok,
  true,
);

const wrongBoardUpload = validateResourceUploadMeta({
  level: "GCSE/IGCSE",
  subject: "Chemistry",
  exam_board: "AQA",
  resource_category: "Worksheets",
  title: "Topic2_States_of_Matter_and_Mixtures_Worksheet",
  file_name: "Topic2_States_of_Matter_and_Mixtures_Worksheet.pdf",
  contentType: "application/pdf",
  fileSize: 1024,
});
assert.equal(wrongBoardUpload.ok, false);
assert.equal(wrongBoardUpload.needsConfirmation, true);

// Neutral category without confirmation
const neutral = validateResourceUploadMeta({
  level: "GCSE/IGCSE",
  subject: "Chemistry",
  exam_board: "AQA",
  resource_category: "Resource",
  title: "Untitled pack",
  file_name: "untitled-pack.pdf",
  contentType: "application/pdf",
  fileSize: 1024,
});
assert.equal(neutral.ok, false);
assert.equal(neutral.needsConfirmation, true);

// Merge: T-Level chemistry worksheet must not land in GCSE Chemistry list
const merged = mergeResourceCatalog([tLevelMisfiledAsGcse, aqaCopyOfEdexcel, gcseChemUnderAlevel], []);
assert.equal(
  merged.filter((item) => item.level === "GCSE/IGCSE" && item.subject === "Chemistry" && looksLikeTLevelResource(item)).length,
  0,
);
assert.ok(merged.some((item) => item.level === "T-Level" && item.subject === "Science"));
assert.ok(merged.some((item) => item.level === "GCSE/IGCSE" && item.exam_board === "Edexcel" && /Topic 1/i.test(item.title)));

const assessment = assessResourceClassification(tLevelMisfiledAsGcse);
assert.equal(assessment.uncertain, true);
assert.ok(assessment.reasons.length > 0);

console.log("resource-classification-audit tests passed");
