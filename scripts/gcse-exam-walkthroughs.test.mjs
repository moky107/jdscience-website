import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BUNDLE_PRICE_PENCE,
  GCSE_WALKTHROUGH_LEVEL,
  SUBJECT_PRICE_PENCE,
  gcseWalkthroughProductSpecs,
} from "../api/_lib/gcseExamWalkthroughCatalog.js";
import {
  localWalkthroughPaths,
  productFields,
  verifyLocalWalkthroughAssets,
} from "../api/_lib/publishGcseExamWalkthroughs.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shopHandlers = fs.readFileSync(path.join(root, "api/_lib/shopHandlers.js"), "utf8");
const shopConstants = fs.readFileSync(path.join(root, "src/shopConstants.js"), "utf8");
const shopLib = fs.readFileSync(path.join(root, "api/_lib/shop.js"), "utf8");

const specs = gcseWalkthroughProductSpecs();
assert.equal(specs.length, 4);
assert.equal(specs.filter((s) => s.product_type === "exam_walkthrough").length, 3);
assert.equal(specs.filter((s) => s.product_type === "bundle").length, 1);
assert.ok(specs.every((s) => !/^JDScience/i.test(s.title)));
assert.ok(specs.every((s) => /JDScience/i.test(s.description)));
assert.equal(specs.find((s) => s.slug.includes("chemistry")).price_pence, SUBJECT_PRICE_PENCE);
assert.equal(specs.find((s) => s.slug.includes("bundle")).price_pence, BUNDLE_PRICE_PENCE);
assert.equal(new Set(specs.map((s) => s.slug)).size, 4);

assert.match(shopConstants, /exam_walkthrough/);
assert.match(shopLib, /exam_walkthrough/);
assert.doesNotMatch(shopHandlers, /publishGcseExamWalkthroughs/);

const chem = specs[0];
const fields = productFields(chem, {
  download_path: "downloads/gcse-chemistry-exam-walkthrough-pack.pdf",
  image_path: "images/gcse-chemistry-exam-walkthrough-pack-cover.png",
  preview_path: "previews/gcse-chemistry-exam-walkthrough-preview.pdf",
});
assert.equal(fields.level, GCSE_WALKTHROUGH_LEVEL);
assert.equal(fields.product_kind, "digital");
assert.equal(fields.purchase_method, "jdscience");
assert.equal(fields.is_published, true);

for (const spec of specs) {
  const paths = localWalkthroughPaths(spec, root);
  assert.ok(paths.download.includes("content/shop/gcse-exam-walkthroughs"));
  assert.ok(!paths.download.includes("public/resources"));
}

const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260831_gcse_exam_walkthrough_shop.sql"),
  "utf8",
);
assert.match(migration, /gcse-chemistry-exam-walkthrough-cover\.png/);
assert.match(migration, /previews\/gcse-chemistry-exam-walkthrough-preview\.pdf/);
assert.match(migration, /exam_walkthrough/);
assert.match(migration, /ARRAY\[.*\]::text\[\]/);

const verified = await verifyLocalWalkthroughAssets(specs[0], root);
assert.equal(verified.ok, true, verified.error || "");

const publicResources = path.join(root, "public/resources");
for (const spec of specs) {
  const dl = localWalkthroughPaths(spec, root).download;
  assert.ok(!dl.startsWith(publicResources), `Paid file must not live in public/resources: ${dl}`);
}

console.log("gcse-exam-walkthroughs.test.mjs OK");
