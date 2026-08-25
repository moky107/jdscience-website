import assert from "node:assert/strict";
import { NCFE_TLEVEL_RESOURCES } from "../src/ncfeTLevelResources.js";

assert.ok(NCFE_TLEVEL_RESOURCES.length > 0, "expected T-Level catalogue entries");

for (const item of NCFE_TLEVEL_RESOURCES) {
  assert.equal(item.level, "T-Level");
  assert.match(item.subject, /^(Science|Laboratory Sciences|Food Sciences|Healthcare Science)$/);
  assert.match(item.exam_board, /^(NCFE|Pearson)$/);
  assert.match(
    item.resource_category,
    /^(Specifications|Revision Notes|Past Questions|Mark Schemes|Examiner Reports|Worksheets)$/,
  );
  assert.ok(item.title, "missing title");
  assert.doesNotMatch(item.title, /^\d/, `title must not start with a number: ${item.title}`);
  assert.doesNotMatch(item.title, /^\d+\.\s/, `title must not be numbered: ${item.title}`);
  assert.ok(item.file_name, `missing file_name for ${item.title}`);
  assert.ok(item.series_label, `missing series folder for ${item.title}`);
  assert.match(
    item.file_url_override,
    /^(https:\/\/www\.ncfe\.org\.uk\/media\/|https:\/\/qualifications\.pearson\.com\/content\/dam\/pdf\/)/,
    item.title,
  );
}

const keys = NCFE_TLEVEL_RESOURCES.map(
  (item) => `${item.exam_board}|${item.subject}|${item.resource_category}|${item.series_label}|${item.title}`,
);
assert.equal(keys.length, new Set(keys).size, "duplicate T-Level catalogue titles");

const urls = NCFE_TLEVEL_RESOURCES.map((item) => item.file_url_override);
assert.equal(urls.length, new Set(urls).size, "duplicate T-Level catalogue URLs");

const files = NCFE_TLEVEL_RESOURCES.map((item) => item.file_name);
assert.equal(files.length, new Set(files).size, "duplicate T-Level catalogue file names");

function find(subject, category, series, title) {
  return NCFE_TLEVEL_RESOURCES.find(
    (item) =>
      item.subject === subject &&
      item.resource_category === category &&
      item.series_label === series &&
      item.title === title,
  );
}

assert.ok(find("Science", "Specifications", "Specification", "T Level Science specification (first teaching September 2026)"));
assert.equal(
  find("Science", "Specifications", "Specification", "T Level Science specification (first teaching September 2026)").exam_board,
  "Pearson",
);
assert.ok(find("Science", "Examiner Reports", "Summer 2025", "Chief examiner report — Core Paper A and B"));
assert.ok(find("Science", "Past Questions", "Summer 2023", "Core Paper A"));
assert.ok(find("Science", "Mark Schemes", "Summer 2023", "Core Paper A mark scheme"));
assert.ok(find("Science", "Past Questions", "Autumn 2023", "Core Paper B"));
assert.ok(find("Science", "Mark Schemes", "Autumn 2023", "Core Paper B mark scheme"));
assert.ok(find("Science", "Past Questions", "Specimen assessment", "Core Paper A"));

assert.ok(find("Laboratory Sciences", "Past Questions", "Summer 2023", "Employer-set project brief"));
assert.ok(find("Laboratory Sciences", "Revision Notes", "Summer 2023", "Employer-set project provider guide"));
assert.ok(find("Laboratory Sciences", "Examiner Reports", "Summer 2023", "Chief examiner report — employer-set project"));
assert.ok(find("Laboratory Sciences", "Revision Notes", "Summer 2023", "Guidance on capturing browsing history"));
assert.ok(find("Laboratory Sciences", "Revision Notes", "Summer 2023", "Statistical techniques"));
assert.ok(find("Laboratory Sciences", "Worksheets", "Summer 2023", "Employer-set project pro-formas"));

assert.ok(find("Healthcare Science", "Past Questions", "Autumn 2023", "Core Paper A"));
assert.ok(find("Healthcare Science", "Past Questions", "Autumn 2023", "Core Paper B"));
assert.ok(find("Healthcare Science", "Mark Schemes", "Autumn 2023", "Core Paper B mark scheme"));
assert.ok(find("Healthcare Science", "Mark Schemes", "Summer 2023", "Core Paper A mark scheme"));
assert.ok(find("Healthcare Science", "Past Questions", "Summer 2023", "Core Paper B"));
assert.ok(find("Healthcare Science", "Mark Schemes", "Employer-set project", "Employer-set project mark scheme"));
assert.ok(find("Healthcare Science", "Examiner Reports", "Autumn 2023", "Chief examiner report — Core Paper A and B"));

assert.equal(
  NCFE_TLEVEL_RESOURCES.filter((item) => /assessment in t levels|southwark college/i.test(item.title)).length,
  0,
  "staff CPD must not be listed",
);

const scienceSummer2025Papers = NCFE_TLEVEL_RESOURCES.filter(
  (item) =>
    item.subject === "Science" &&
    item.series_label === "Summer 2025" &&
    (item.resource_category === "Past Questions" || item.resource_category === "Mark Schemes"),
);
assert.equal(scienceSummer2025Papers.length, 0, "portal-locked Summer 2025 papers must stay omitted");

console.log(`t-level resources catalogue tests passed (${NCFE_TLEVEL_RESOURCES.length} items)`);
