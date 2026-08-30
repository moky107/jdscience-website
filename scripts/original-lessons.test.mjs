import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lessons = [
  ["atomic-structure", "btec-unit-1-chemistry-atomic-structure.pptx", "BTEC Unit 1 Chemistry: Atomic Structure"],
  ["electron-configuration", "btec-unit-1-chemistry-electron-configuration.pptx", "BTEC Unit 1 Chemistry: Electron Configuration"],
  ["ionic-bonding", "btec-unit-1-chemistry-ionic-bonding.pptx", "BTEC Unit 1 Chemistry: Ionic Bonding"],
  ["covalent-bonding", "btec-unit-1-chemistry-covalent-bonding.pptx", "BTEC Unit 1 Chemistry: Covalent Bonding"],
  ["metallic-bonding", "btec-unit-1-chemistry-metallic-bonding.pptx", "BTEC Unit 1 Chemistry: Metallic Bonding"],
  ["cell-structure", "btec-unit-1-biology-cell-structure.pptx", "BTEC Unit 1 Biology: Cell Structure"],
  ["prokaryotic-and-eukaryotic-cells", "btec-unit-1-biology-prokaryotic-and-eukaryotic-cells.pptx", "BTEC Unit 1 Biology: Prokaryotic and Eukaryotic Cells"],
  ["microscopy", "btec-unit-1-biology-microscopy.pptx", "BTEC Unit 1 Biology: Microscopy"],
  ["progressive-waves", "btec-unit-1-physics-progressive-waves.pptx", "BTEC Unit 1 Physics: Progressive Waves"],
  ["wave-properties", "btec-unit-1-physics-wave-properties.pptx", "BTEC Unit 1 Physics: Wave Properties"],
];

for (const [slug, ppt, title] of lessons) {
  const folder = path.join(root, "content/lessons", slug);
  const pptx = path.join(folder, ppt);
  const worksheet = path.join(folder, `btec-unit-1-${slug}-worksheet.pdf`);
  const answers = path.join(folder, `btec-unit-1-${slug}-answers.pdf`);
  const cover = path.join(folder, "cover.png");
  const worksheetCover = path.join(folder, "cover-worksheet.png");
  const pack = path.join(folder, `btec-unit-1-${slug}-worksheet-pack.zip`);
  assert.ok(existsSync(pptx), `missing ${pptx}`);
  assert.ok(existsSync(worksheet), `missing ${worksheet}`);
  assert.ok(existsSync(answers), `missing ${answers}`);
  assert.ok(existsSync(cover), `missing ${cover}`);
  assert.ok(existsSync(worksheetCover), `missing ${worksheetCover}`);
  assert.ok(existsSync(pack), `missing ${pack}`);
  assert.doesNotMatch(title, /JDScience/i);
  assert.ok(readFileSync(pptx).subarray(0, 2).toString() === "PK", `${ppt} is not a zip pptx`);
  assert.ok(readFileSync(worksheet).subarray(0, 4).toString() === "%PDF");
  assert.ok(readFileSync(answers).subarray(0, 4).toString() === "%PDF");
  assert.ok(readFileSync(pack).subarray(0, 2).toString() === "PK", `${pack} is not a zip`);
}

const shopHandlers = readFileSync(path.join(root, "api/_lib/shopHandlers.js"), "utf8");
assert.doesNotMatch(shopHandlers, /ensureUnit1SpecialiseCellsProduct/);
assert.match(shopHandlers, /deleteObsoleteSeededUnit1Products/);

console.log("original unit 1 lesson batch files ok");
