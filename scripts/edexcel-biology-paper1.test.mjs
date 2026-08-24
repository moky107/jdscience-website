import assert from "node:assert/strict";
import { EDEXCEL_SCIENCE_MATHS_RESOURCES } from "../src/edexcelScienceMathsResources.js";

const biologyPaper1 = EDEXCEL_SCIENCE_MATHS_RESOURCES.filter(
  (item) =>
    item.level === "GCSE/IGCSE" &&
    item.subject === "Biology" &&
    item.exam_board === "Edexcel" &&
    /^Paper 1 /.test(item.title),
);

function find(category, series, title) {
  return biologyPaper1.find(
    (item) =>
      item.resource_category === category &&
      item.series_label === series &&
      item.title === title,
  );
}

for (const series of ["June 2022", "June 2023", "June 2024", "June 2025", "November 2020"]) {
  for (const tier of ["Paper 1 Foundation (1BI0/1F)", "Paper 1 Higher (1BI0/1H)"]) {
    for (const category of ["Past Questions", "Mark Schemes", "Examiner Reports"]) {
      assert.ok(find(category, series, tier), `expected existing ${series} ${tier} ${category}`);
    }
  }
}

for (const tier of ["Paper 1 Foundation (1BI0/1F)", "Paper 1 Higher (1BI0/1H)"]) {
  for (const category of ["Past Questions", "Mark Schemes", "Examiner Reports"]) {
    const item = find(category, "November 2021", tier);
    assert.ok(item, `missing November 2021 ${tier} ${category}`);
    assert.match(item.file_url_override, /^https:\/\/qualifications\.pearson\.com\/content\/dam\/pdf\//);
  }
}

for (const tier of ["Paper 1 Foundation (1BI0/1F)", "Paper 1 Higher (1BI0/1H)"]) {
  for (const category of ["Past Questions", "Mark Schemes"]) {
    const item = find(category, "Sample assessment", tier);
    assert.ok(item, `missing sample ${tier} ${category}`);
    assert.equal(
      item.file_url_override,
      "https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/SAMs_GCSE_L1-L2_in_Biology.pdf",
    );
  }
}

const keys = biologyPaper1.map(
  (item) => `${item.resource_category}|${item.series_label}|${item.title}`,
);
assert.equal(keys.length, new Set(keys).size, "duplicate Paper 1 catalogue entries");

console.log("edexcel biology paper 1 catalogue tests passed");
