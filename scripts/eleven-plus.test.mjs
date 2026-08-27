import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalizeResource, isDeadResource, resourceOpenHref } from "../src/resourceNormalize.js";
import { ELEVEN_PLUS_RESOURCES } from "../src/elevenPlusResources.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(ELEVEN_PLUS_RESOURCES.length, 26);

for (const item of ELEVEN_PLUS_RESOURCES) {
  assert.equal(item.level, "11+");
  assert.ok(item.file_url_override.startsWith("/resources/11-plus/"));
  assert.match(item.file_url_override, /\.pdf$/i);
  assert.ok(item.skill_area);
  assert.ok(item.description);
  assert.ok(item.title);
  const canonical = canonicalizeResource({
    ...item,
    file_url: item.file_url_override,
    published: true,
  });
  assert.ok(canonical, `${item.title} should stay in the catalog`);
  assert.equal(isDeadResource(canonical), false);
  assert.equal(resourceOpenHref({ ...canonical, file_url: item.file_url_override }), item.file_url_override);

  const pdfPath = path.join(root, "public", item.file_url_override.replace(/^\//, ""));
  assert.equal(fs.existsSync(pdfPath), true, `missing ${item.file_url_override}`);
  assert.ok(fs.statSync(pdfPath).size > 2000, `${item.file_name} is too small to be a real PDF`);
}

const expected = [
  "public/resources/11-plus/maths/JDScience_11Plus_Maths_Arithmetic_Practice.pdf",
  "public/resources/11-plus/maths/JDScience_11Plus_Maths_Word_Problems.pdf",
  "public/resources/11-plus/maths/JDScience_11Plus_Maths_Fractions_Decimals_Percentages.pdf",
  "public/resources/11-plus/maths/JDScience_11Plus_Maths_Geometry_and_Measures.pdf",
  "public/resources/11-plus/maths/JDScience_11Plus_Maths_Data_Handling.pdf",
  "public/resources/11-plus/english/JDScience_11Plus_English_Comprehension_Practice.pdf",
  "public/resources/11-plus/english/JDScience_11Plus_English_Grammar_Punctuation.pdf",
  "public/resources/11-plus/english/JDScience_11Plus_English_Vocabulary_and_Spelling.pdf",
  "public/resources/11-plus/english/JDScience_11Plus_English_Creative_Writing_Prompts.pdf",
  "public/resources/11-plus/verbal-reasoning/JDScience_11Plus_Verbal_Reasoning_Practice_1.pdf",
  "public/resources/11-plus/verbal-reasoning/JDScience_11Plus_Verbal_Reasoning_Practice_2.pdf",
  "public/resources/11-plus/non-verbal-reasoning/JDScience_11Plus_Non_Verbal_Reasoning_Practice_1.pdf",
  "public/resources/11-plus/non-verbal-reasoning/JDScience_11Plus_Non_Verbal_Reasoning_Practice_2.pdf",
  "public/resources/11-plus/mixed-practice/JDScience_11Plus_Mixed_Practice_Paper_1.pdf",
  "public/resources/11-plus/mixed-practice/JDScience_11Plus_Mixed_Practice_Paper_2.pdf",
  "public/resources/11-plus/mixed-practice/JDScience_11Plus_Parent_Guide.pdf",
  "public/resources/11-plus/maths/JDScience_11Plus_GL_Style_Maths_Practice_Paper_1.pdf",
  "public/resources/11-plus/maths/JDScience_11Plus_GL_Style_Maths_Answers_1.pdf",
  "public/resources/11-plus/english/JDScience_11Plus_GL_Style_English_Practice_Paper_1.pdf",
  "public/resources/11-plus/english/JDScience_11Plus_GL_Style_English_Answers_1.pdf",
  "public/resources/11-plus/verbal-reasoning/JDScience_11Plus_Verbal_Reasoning_Practice_Paper_3.pdf",
  "public/resources/11-plus/verbal-reasoning/JDScience_11Plus_Verbal_Reasoning_Answers_3.pdf",
  "public/resources/11-plus/non-verbal-reasoning/JDScience_11Plus_Non_Verbal_Reasoning_Practice_Paper_3.pdf",
  "public/resources/11-plus/non-verbal-reasoning/JDScience_11Plus_Non_Verbal_Reasoning_Answers_3.pdf",
  "public/resources/11-plus/mixed-practice/JDScience_11Plus_Mixed_Practice_Paper_3.pdf",
  "public/resources/11-plus/mixed-practice/JDScience_11Plus_Mixed_Practice_Answers_3.pdf",
];
assert.deepEqual(ELEVEN_PLUS_RESOURCES.map((item) => item.file_url_override.replace(/^\//, "")), expected.map((item) => item.replace(/^public\//, "")));

console.log("eleven-plus tests passed (26 original PDFs)");
