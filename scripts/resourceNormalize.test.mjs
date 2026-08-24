import assert from "node:assert/strict";
import {
  canonicalizeResource,
  inferResourceCategory,
  inferResourceSubject,
  isDeadResource,
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
assert.equal(merged.find((item) => item.id === 151).subject, "Chemistry");
assert.equal(merged.some((item) => item.title === "Biology 1 - Cell Biology"), false);
assert.ok(merged.some((item) => item.subject === "Biology" && item.exam_board === "Edexcel" && item.title === "Cell Biology"));
assert.ok(merged.some((item) => item.subject === "Biology" && item.exam_board === "Edexcel" && item.id === 56));
assert.equal(
  merged.filter((item) => item.subject === "Biology" && /physics/i.test(`${item.title} ${item.file_name}`)).length,
  0,
);

console.log("resourceNormalize tests passed");
