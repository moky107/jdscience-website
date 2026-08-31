import assert from "node:assert/strict";
import {
  buildEduqasGcseMathematicsWalkthroughs,
} from "../scripts/eduqas-gcse-maths-walkthroughs-sync.mjs";
import { EDUQAS_GCSE_MATHEMATICS_WALKTHROUGHS } from "../src/eduqasGcseMathematicsWalkthroughs.js";

const SOURCE_PAGE = "https://resources.eduqas.co.uk/Pages/ResourceSingle.aspx?rIid=1537";

assert.equal(EDUQAS_GCSE_MATHEMATICS_WALKTHROUGHS.length, 6, "expected six Eduqas GCSE Maths exam walkthroughs");

for (const item of EDUQAS_GCSE_MATHEMATICS_WALKTHROUGHS) {
  assert.equal(item.level, "GCSE/IGCSE");
  assert.equal(item.subject, "Maths");
  assert.equal(item.exam_board, "Eduqas");
  assert.equal(item.resource_category, "Videos");
  assert.match(item.title, /^Eduqas GCSE Mathematics .* Exam Walkthrough — /);
  assert.match(item.file_url_override, /^https:\/\/resource\.download\.wjec\.co\.uk\/EWT\//);
  assert.match(item.file_url_override, /\.pptx$/i);
  assert.equal(item.source_attribution, "Official Eduqas/WJEC");
  assert.equal(item.source_page, SOURCE_PAGE);
  assert.match(item.description, /Official Eduqas\/WJEC exam walkthrough/);
}

const urls = EDUQAS_GCSE_MATHEMATICS_WALKTHROUGHS.map((item) => item.file_url_override);
assert.equal(urls.length, new Set(urls).size, "duplicate walkthrough URLs");

assert.ok(
  EDUQAS_GCSE_MATHEMATICS_WALKTHROUGHS.some((item) => item.title.includes("Summer 2019") && item.title.includes("Higher Component 1")),
);
assert.ok(
  EDUQAS_GCSE_MATHEMATICS_WALKTHROUGHS.some((item) => item.title.includes("Summer 2022") && item.title.includes("Foundation Component 2")),
);

const sample = buildEduqasGcseMathematicsWalkthroughs([
  {
    url: "https://resource.download.wjec.co.uk/EWT/19-20/Eduqas/Eduqas%20GCSE%20Maths%20C1%20EWT.pptx",
    label: "Component 1 - Foundation Tier (Summer 2019)",
  },
]);
assert.equal(sample.length, 1);
assert.equal(sample[0].title, "Eduqas GCSE Mathematics Foundation Component 1 Exam Walkthrough — Summer 2019");

console.log(`eduqas gcse maths walkthrough tests passed (${EDUQAS_GCSE_MATHEMATICS_WALKTHROUGHS.length} walkthroughs)`);
