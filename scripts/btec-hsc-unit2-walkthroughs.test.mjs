import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { SHOP_SUBJECTS } from "../src/shopConstants.js";
import {
  UNIT2_WALKTHROUGH_EXAM_BOARD,
  UNIT2_WALKTHROUGH_LEVEL,
  UNIT2_WALKTHROUGH_PRICE_PENCE,
  UNIT2_WALKTHROUGH_SUBJECT,
  btecHscUnit2WalkthroughProductSpecs,
} from "../api/_lib/btecHscUnit2WalkthroughCatalog.js";
import {
  isProtectedShopRow,
  localWalkthroughPaths,
  productFields,
  verifyLocalWalkthroughAssets,
} from "../api/_lib/publishBtecHscUnit2Walkthroughs.js";
import {
  OBSOLETE_SEEDED_UNIT1_SLUG,
  PROTECTED_BTEC_SPECIALISED_CELLS_ID,
  PROTECTED_CHEMISTRY_COMPANION_ID,
} from "../api/_lib/shop.js";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = require("../package.json");
const shopHandlers = fs.readFileSync(path.join(root, "api/_lib/shopHandlers.js"), "utf8");
const shopConstants = fs.readFileSync(path.join(root, "src/shopConstants.js"), "utf8");
const shopLib = fs.readFileSync(path.join(root, "api/_lib/shop.js"), "utf8");

assert.ok(SHOP_SUBJECTS.includes("Health and Social Care"));

const specs = btecHscUnit2WalkthroughProductSpecs();
assert.equal(specs.length, 9);
assert.equal(specs.filter((s) => s.product_type === "exam_walkthrough").length, 8);
assert.equal(specs.filter((s) => s.product_type === "practice_questions").length, 1);
assert.ok(specs.every((s) => s.price_pence === UNIT2_WALKTHROUGH_PRICE_PENCE));
assert.ok(specs.every((s) => s.price_pence === 1000));
assert.ok(specs.every((s) => !/^JDScience/i.test(s.title)));
assert.ok(specs.every((s) => /JDScience/i.test(s.description)));
assert.ok(specs.every((s) => /Health and Social Care/.test(s.title)));
assert.ok(specs.every((s) => s.subject === UNIT2_WALKTHROUGH_SUBJECT));
assert.equal(new Set(specs.map((s) => s.slug)).size, 9);
assert.ok(specs.every((s) => s.slug !== OBSOLETE_SEEDED_UNIT1_SLUG));
assert.ok(specs.every((s) => s.slug !== "specialise-cells"));
assert.ok(specs.every((s) => s.slug !== "my-chemistry-companion"));

assert.match(shopConstants, /exam_walkthrough/);
assert.match(shopConstants, /Health and Social Care/);
assert.match(shopLib, /exam_walkthrough/);
assert.match(shopHandlers, /ensureMissingBtecHscUnit2Walkthroughs/);
assert.match(shopHandlers, /missingHscUnit2 === 9/);
assert.match(
  fs.readFileSync(path.join(root, "vercel.json"), "utf8"),
  /btec-hsc-unit2-walkthroughs/,
);
assert.doesNotMatch(pkg.scripts.build, /publish-btec-hsc-unit2-walkthroughs/);
assert.equal(pkg.scripts.build, "vite build");

const sample = productFields(specs[0], {
  download_path: "downloads/btec-hsc-unit-2-exam-walkthrough-june-2017.pdf",
  image_path: "images/btec-hsc-unit-2-exam-walkthrough-june-2017-cover.png",
});
assert.equal(sample.level, UNIT2_WALKTHROUGH_LEVEL);
assert.equal(sample.exam_board, UNIT2_WALKTHROUGH_EXAM_BOARD);
assert.equal(sample.product_kind, "digital");
assert.equal(sample.purchase_method, "jdscience");
assert.equal(sample.is_published, true);
assert.equal(sample.price_pence, 1000);

assert.equal(isProtectedShopRow({ id: PROTECTED_BTEC_SPECIALISED_CELLS_ID, slug: "specialise-cells" }), true);
assert.equal(isProtectedShopRow({ id: PROTECTED_CHEMISTRY_COMPANION_ID, slug: "my-chemistry-companion" }), true);
assert.equal(isProtectedShopRow({ id: "new-id", slug: specs[0].slug }), false);

const publicResources = path.join(root, "public/resources");
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260901_btec_hsc_unit2_walkthrough_shop.sql"),
  "utf8",
);
assert.match(migration, /1000/);
assert.doesNotMatch(migration, /specialise-cells/);
assert.doesNotMatch(migration, /my-chemistry-companion/);
assert.doesNotMatch(migration, /unit-1-specialise-cells/);

for (const spec of specs) {
  const paths = localWalkthroughPaths(spec, root);
  assert.ok(paths.download.includes("content/shop/btec-hsc-unit2-walkthroughs"));
  assert.ok(!paths.download.includes("public/resources"));
  assert.ok(!paths.download.startsWith(publicResources));
  const verified = await verifyLocalWalkthroughAssets(spec, root);
  assert.equal(verified.ok, true, verified.error || spec.slug);
  assert.match(migration, new RegExp(spec.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(migration, new RegExp(spec.localDownloadName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  const priceBlock = migration.split(spec.slug)[1]?.slice(0, 800) || "";
  assert.match(priceBlock, /\n\s*1000,/);
}

console.log("btec-hsc-unit2-walkthroughs.test.mjs OK");
