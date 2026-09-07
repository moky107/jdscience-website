import assert from "node:assert/strict";
import {
  canonicalizeResource,
  hasAwardingBodyUrl,
  inferResourceCategory,
  inferResourceSubject,
  isDeadResource,
  isHostedOfficialExamCopy,
  looksLikeOfficialPaper,
  mergeResourceCatalog,
  resourceOpenHref,
  tidyDownloadFilename,
  tidyResourceTitle,
} from "../src/resourceNormalize.js";
import { hostedRevisionNotesForCatalog } from "../src/hostedRevisionNotes.js";

const physicsInBiology = {
  id: 65,
  title: "JDScience_AQA_GCSE_Physics_1_Energy (1)",
  subject: "Biology",
  level: "GCSE/IGCSE",
  exam_board: "AQA",
  resource_category: "Revision Notes",
  file_name: "JDScience_AQA_GCSE_Physics_1_Energy (1).pptx",
  storage_path: "gcse-igcse/biology/aqa/revision-notes/1786376927797-jdscience-aqa-gcse-physics-1-energy-1-pptx",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/gcse-igcse/biology/aqa/revision-notes/1786376927797-jdscience-aqa-gcse-physics-1-energy-1-pptx",
  published: true,
};

assert.equal(inferResourceSubject(physicsInBiology), "Physics");
assert.equal(isDeadResource(physicsInBiology), true);
assert.equal(canonicalizeResource(physicsInBiology), null);

const workingPhysics = {
  ...physicsInBiology,
  id: 70,
  subject: "Physics",
  storage_path: "gcse-igcse/physics/aqa/revision-notes/1786377466711-jdscience-aqa-gcse-physics-1-energy-1-pptx",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/gcse-igcse/physics/aqa/revision-notes/1786377466711-jdscience-aqa-gcse-physics-1-energy-1-pptx",
};
assert.equal(isDeadResource(workingPhysics), false);
assert.equal(canonicalizeResource(workingPhysics).subject, "Physics");
assert.equal(tidyResourceTitle(workingPhysics), "JDScience Physics topic 1: Energy");
assert.equal(tidyDownloadFilename(workingPhysics), "jdscience-physics-energy.pptx");
assert.equal(resourceOpenHref(workingPhysics), "/api/education-posts?kind=file&id=70");

const chemistryAsPhysics = {
  id: 151,
  title: "AQA-84621H-QP-JUN23",
  subject: "Physics",
  level: "GCSE/IGCSE",
  exam_board: "AQA",
  resource_category: "Past Questions",
  file_name: "AQA-84621H-QP-JUN23.PDF",
  storage_path: "gcse-igcse/physics/aqa/past-questions/x",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/gcse-igcse/physics/aqa/past-questions/x",
  published: true,
};
assert.equal(inferResourceSubject(chemistryAsPhysics), "Chemistry");
assert.equal(isHostedOfficialExamCopy(chemistryAsPhysics), false);
assert.equal(isDeadResource(chemistryAsPhysics), false);
assert.equal(canonicalizeResource(chemistryAsPhysics).subject, "Chemistry");
assert.equal(resourceOpenHref(chemistryAsPhysics), "/api/education-posts?kind=file&id=151");

const mathsPaperInNotes = {
  id: 438,
  title: "1MA1_1F_1119_QU",
  subject: "Maths",
  resource_category: "Revision Notes",
  file_name: "1MA1_1F_1119_QU.pdf",
};
assert.equal(inferResourceCategory(mathsPaperInNotes), "Past Questions");

const encoded = canonicalizeResource({
  id: 91,
  title: "JDScience%20GCSE%20Physics%20-%20Electricity(2)",
  subject: "Physics",
  level: "GCSE/IGCSE",
  exam_board: "Edexcel",
  resource_category: "Revision Notes",
  file_name: "JDScience%20GCSE%20Physics%20-%20Electricity(2).pptx",
  storage_path: "gcse-igcse/physics/edexcel/revision-notes/x",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/gcse-igcse/physics/edexcel/revision-notes/x",
  published: true,
});
assert.equal(encoded.title, "JDScience Physics topic 2: Electricity");

const timestamped = {
  title: "1786377538003-jdscience-aqa-physics-1-energy-1-ppt",
  file_name: "1786377538003-jdscience-aqa-physics-1-energy-1-ppt.pptx",
  subject: "Physics",
  resource_category: "Revision Notes",
};
assert.equal(tidyResourceTitle(timestamped), "JDScience Physics topic 1: Energy");
assert.equal(tidyDownloadFilename(timestamped), "jdscience-physics-energy.pptx");

const quantitative = {
  title: "JDScience_C3_Quantitative_Chemistry",
  subject: "Chemistry",
  resource_category: "Revision Notes",
  file_name: "JDScience_C3_Quantitative_Chemistry.pptx",
};
assert.equal(inferResourceCategory(quantitative), "Revision Notes");
assert.match(tidyResourceTitle(quantitative), /Quantitative chemistry/i);
assert.equal(tidyDownloadFilename({
  title: "AQA-84621H-QP-JUN23",
  file_name: "AQA-84621H-QP-JUN23.PDF",
  subject: "Chemistry",
  resource_category: "Past Questions",
}), "AQA-84621H-QP-JUN23.PDF");
assert.equal(
  tidyResourceTitle({
    title: "AQA-84621H-QP-JUN23",
    file_name: "AQA-84621H-QP-JUN23.PDF",
    subject: "Chemistry",
    resource_category: "Past Questions",
  }),
  "AQA-84621H-QP-JUN23",
);

const officialLinkedPaper = {
  id: "static-aqa-maths",
  title: "Paper 1 Non-Calculator (Foundation)",
  file_name: "AQA-83001F-QP-JUN22.PDF",
  file_url: "https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-83001F-QP-JUN22.PDF",
  resource_category: "Past Questions",
  subject: "Maths",
  exam_board: "AQA",
  published: true,
};
assert.equal(looksLikeOfficialPaper(officialLinkedPaper), true);
assert.equal(hasAwardingBodyUrl(officialLinkedPaper), true);
assert.equal(isHostedOfficialExamCopy(officialLinkedPaper), false);
assert.equal(isDeadResource(officialLinkedPaper), false);
assert.equal(resourceOpenHref(officialLinkedPaper), officialLinkedPaper.file_url);

const hostedBtecCopy = {
  id: 900,
  title: "Unit 1 Biology — January 2019 question paper",
  file_name: "unit1-biology-january-2019-question-paper.pdf",
  file_url: "/resources/pearson/btec/applied-science/past-questions/unit1-biology-january-2019-question-paper.pdf",
  resource_category: "Past Questions",
  subject: "Applied Science",
  exam_board: "Pearson",
  published: true,
};
assert.equal(looksLikeOfficialPaper(hostedBtecCopy), true);
assert.equal(isHostedOfficialExamCopy(hostedBtecCopy), true);
assert.equal(isDeadResource(hostedBtecCopy), true);
assert.equal(resourceOpenHref(hostedBtecCopy), "#");

const edexcelBiologyPptx = {
  id: "static-old",
  title: "Biology 1 - Cell Biology",
  subject: "Biology",
  level: "GCSE/IGCSE",
  exam_board: "Edexcel",
  resource_category: "Revision Notes",
  file_name: "Biology 1 - Cell Biology.pptx",
  file_url: "/resources/edexcel/gcse/biology/revision-notes/Biology%201%20-%20Cell%20Biology.pptx",
  published: true,
};
assert.equal(isDeadResource(edexcelBiologyPptx), true);
assert.equal(canonicalizeResource(edexcelBiologyPptx), null);

const workingBioTopic1 = {
  id: 56,
  title: "JDScience_GCSE_Biology_Topic1_FINAL",
  subject: "Biology",
  level: "GCSE/IGCSE",
  exam_board: "Edexcel",
  resource_category: "Revision Notes",
  file_name: "JDScience_GCSE_Biology_Topic1_FINAL.pptx",
  storage_path: "gcse-igcse/biology/edexcel/revision-notes/1785700782822-jdscience-gcse-biology-topic1-final-pptx",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/gcse-igcse/biology/edexcel/revision-notes/1785700782822-jdscience-gcse-biology-topic1-final-pptx",
  published: true,
};
assert.equal(isDeadResource(workingBioTopic1), false);
assert.equal(canonicalizeResource(workingBioTopic1).title, "JDScience Biology topic 1: Cell biology");

const catalogNotes = hostedRevisionNotesForCatalog();
assert.ok(catalogNotes.some((item) => item.subject === "Biology" && item.exam_board === "Edexcel" && item.title === "Cell Biology"));
assert.ok(catalogNotes.every((item) => item.file_url_override && item.file_url_override.endsWith("/")));
assert.ok(catalogNotes.every((item) => !item.notesHtml));

const merged = mergeResourceCatalog([
  physicsInBiology,
  workingPhysics,
  chemistryAsPhysics,
  workingBioTopic1,
  edexcelBiologyPptx,
], catalogNotes);

assert.equal(merged.some((item) => item.id === 65), false);
assert.equal(merged.some((item) => item.id === 70), true);
assert.equal(merged.some((item) => item.id === 151), true);
assert.equal(merged.some((item) => item.title === "Biology 1 - Cell Biology"), false);
assert.ok(merged.some((item) => item.subject === "Biology" && item.exam_board === "Edexcel" && item.title === "Cell Biology"));
assert.ok(merged.some((item) => item.subject === "Biology" && item.exam_board === "Edexcel" && item.id === 56));
assert.equal(
  merged.filter((item) => item.subject === "Biology" && /physics/i.test(`${item.title} ${item.file_name}`)).length,
  0,
);

const elevenPlusPaper = {
  level: "11+",
  subject: "Maths",
  exam_board: "Grammar Schools",
  resource_category: "Worksheets",
  title: "11+ GL-Style Maths Practice Paper 1",
  file_name: "JDScience_11Plus_GL_Style_Maths_Practice_Paper_1.pdf",
  file_url: "/resources/11-plus/maths/JDScience_11Plus_GL_Style_Maths_Practice_Paper_1.pdf",
  file_url_override: "/resources/11-plus/maths/JDScience_11Plus_GL_Style_Maths_Practice_Paper_1.pdf",
  published: true,
};
assert.equal(tidyResourceTitle(elevenPlusPaper), "11+ GL-Style Maths Practice Paper 1");
assert.equal(canonicalizeResource(elevenPlusPaper).title, "11+ GL-Style Maths Practice Paper 1");

console.log("resourceNormalize tests passed");
