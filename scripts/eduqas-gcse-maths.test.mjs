import assert from "node:assert/strict";
import {
  buildEduqasGcseMathematicsResources,
} from "../scripts/eduqas-gcse-maths-sync.mjs";
import { EDUQAS_GCSE_MATHEMATICS_RESOURCES } from "../src/eduqasGcseMathematicsResources.js";
import { EDUQAS_WJEC_SCIENCE_MATHS_RESOURCES } from "../src/eduqasWjecScienceMathsResources.js";

assert.ok(EDUQAS_GCSE_MATHEMATICS_RESOURCES.length > 0, "expected Eduqas GCSE Mathematics catalogue");

for (const item of EDUQAS_GCSE_MATHEMATICS_RESOURCES) {
  assert.equal(item.level, "GCSE/IGCSE");
  assert.equal(item.subject, "Maths");
  assert.equal(item.exam_board, "Eduqas");
  assert.match(item.resource_category, /^(Past Questions|Mark Schemes)$/);
  assert.match(item.title, /^Eduqas GCSE Mathematics /);
  assert.match(item.file_url_override, /^https:\/\/pastpapers\.download\.wjec\.co\.uk\//);
  assert.equal(item.source_attribution, "Official Eduqas/WJEC");
  assert.match(item.description, /Official Eduqas\/WJEC/);
  assert.doesNotMatch(item.file_url_override, /^\/resources\//);
}

const duplicateUrls = EDUQAS_GCSE_MATHEMATICS_RESOURCES.map((item) => item.file_url_override);
assert.equal(duplicateUrls.length, new Set(duplicateUrls).size, "duplicate Eduqas GCSE Mathematics URLs");

const legacyMaths = EDUQAS_WJEC_SCIENCE_MATHS_RESOURCES.filter(
  (item) => item.level === "GCSE/IGCSE" && item.subject === "Maths" && item.exam_board === "Eduqas",
);
assert.equal(legacyMaths.length, 0, "GCSE Mathematics must not remain in eduqasWjecScienceMathsResources.js");

const pq = EDUQAS_GCSE_MATHEMATICS_RESOURCES.filter((item) => item.resource_category === "Past Questions");
const ms = EDUQAS_GCSE_MATHEMATICS_RESOURCES.filter((item) => item.resource_category === "Mark Schemes");
const er = EDUQAS_GCSE_MATHEMATICS_RESOURCES.filter((item) => item.resource_category === "Examiner Reports");

assert.ok(pq.length >= 70, "expected GCSE Mathematics past papers");
assert.ok(ms.length >= 55, "expected GCSE Mathematics mark schemes");
assert.equal(er.length, 0, "Eduqas GCSE Mathematics examiner reports are not published on the official past-papers tab");

assert.ok(
  ms.some((item) => item.series_label === "Summer 2019" && item.title.includes("Foundation Component 1 Mark Scheme")),
  "Summer 2019 mark schemes should be listed",
);

const sample = buildEduqasGcseMathematicsResources([
  {
    ProductReference: "Past Paper",
    FileName: "Past Paper - Summer - Maths Component 1 Higher Noncalculat:Non-calculator Mathematics - Higher",
    Year: "2023",
    Series: "Summer",
    Url: "https://pastpapers.download.wjec.co.uk/s23-c300ua0-1.pdf",
  },
  {
    ProductReference: "Modified Paper",
    FileName: "Modified Paper - Summer - Maths Component 1 Higher",
    Year: "2023",
    Series: "Summer",
    Url: "https://pastpapers.download.wjec.co.uk/s23-c300ua0-1-mlp-a4-18.pdf",
  },
  {
    ProductReference: "Past Paper",
    FileName: "Past Paper - Summer - Maths Component 1 Higher [Braille Text]",
    Year: "2025",
    Series: "Summer",
    Url: "https://pastpapers.download.wjec.co.uk/S25/S25-C300UA0-1-BRL.pdf",
  },
]);

assert.equal(sample.length, 1);
assert.equal(sample[0].title, "Eduqas GCSE Mathematics Higher Component 1 Past Paper — 2023");
assert.equal(sample[0].resource_category, "Past Questions");

console.log(`eduqas gcse maths tests passed (${EDUQAS_GCSE_MATHEMATICS_RESOURCES.length} resources: ${pq.length} papers, ${ms.length} mark schemes)`);
