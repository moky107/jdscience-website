import assert from "node:assert/strict";
import {
  canonicalizeResource,
  inferResourceCategory,
  inferResourceSubject,
  isDeadResource,
  mergeResourceCatalog,
} from "../src/resourceNormalize.js";

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
assert.equal(encoded.title, "JDScience GCSE Physics - Electricity(2)");

const quantitative = {
  title: "JDScience_C3_Quantitative_Chemistry",
  subject: "Chemistry",
  resource_category: "Revision Notes",
  file_name: "JDScience_C3_Quantitative_Chemistry.pptx",
};
assert.equal(inferResourceCategory(quantitative), "Revision Notes");

const merged = mergeResourceCatalog([physicsInBiology, workingPhysics, chemistryAsPhysics], [{
  id: "static-1",
  title: "Cell Biology",
  subject: "Biology",
  level: "GCSE/IGCSE",
  exam_board: "AQA",
  resource_category: "Revision Notes",
  file_name: "cell-biology.html",
  file_url: "/resources/gcse/biology/revision-notes/cell-biology/",
  all_boards: true,
  published: true,
}]);
assert.equal(merged.some((item) => item.id === 65), false);
assert.equal(merged.some((item) => item.id === 70), true);
assert.equal(merged.find((item) => item.id === 151).subject, "Chemistry");
assert.equal(merged.some((item) => item.title === "Cell Biology"), true);

console.log("resourceNormalize tests passed");
