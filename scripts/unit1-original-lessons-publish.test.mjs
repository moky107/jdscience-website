import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { SHOP_LEVELS } from "../src/shopConstants.js";
import {
  FEATURED_PPT_SLUGS,
  PPT_PRICE_PENCE,
  UNIT1_LEVEL,
  WORKSHEET_PRICE_PENCE,
  unit1ProductSpecs,
} from "../api/_lib/unit1OriginalLessonCatalog.js";
import {
  findExistingUnit1Product,
  isProtectedShopRow,
  productFields,
} from "../api/_lib/publishUnit1OriginalLessons.js";
import {
  OBSOLETE_SEEDED_UNIT1_SLUG,
  PROTECTED_BTEC_SPECIALISED_CELLS_ID,
  PROTECTED_CHEMISTRY_COMPANION_ID,
} from "../api/_lib/shop.js";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = require("../package.json");
const shopHandlers = fs.readFileSync(path.join(root, "api/_lib/shopHandlers.js"), "utf8");

assert.ok(SHOP_LEVELS.includes("BTEC Level 3"));
assert.equal(UNIT1_LEVEL, "BTEC Level 3");

const specs = unit1ProductSpecs();
assert.equal(specs.length, 20);
assert.equal(specs.filter((item) => item.product_type === "powerpoint").length, 10);
assert.equal(specs.filter((item) => item.product_type === "worksheet").length, 10);
assert.ok(specs.every((item) => item.price_pence === (item.product_type === "powerpoint" ? PPT_PRICE_PENCE : WORKSHEET_PRICE_PENCE)));
assert.ok(specs.every((item) => !/JDScience/i.test(item.title)));
assert.equal(new Set(specs.map((item) => item.slug)).size, 20);
assert.equal(new Set(specs.map((item) => item.description)).size, 20);
assert.ok(specs.every((item) => item.slug !== OBSOLETE_SEEDED_UNIT1_SLUG));
assert.ok(specs.every((item) => item.slug !== "specialise-cells"));
assert.equal(specs.filter((item) => item.is_featured).length, FEATURED_PPT_SLUGS.length);

const sample = productFields(specs[0], {
  download_path: "downloads/atomic.pptx",
  image_path: "images/atomic.png",
});
assert.equal(sample.purchase_method, "jdscience");
assert.equal(sample.level, "BTEC Level 3");
assert.equal(sample.product_kind, "digital");
assert.equal(sample.is_published, true);

assert.equal(isProtectedShopRow({ id: PROTECTED_BTEC_SPECIALISED_CELLS_ID, slug: "specialise-cells" }), true);
assert.equal(isProtectedShopRow({ id: PROTECTED_CHEMISTRY_COMPANION_ID, slug: "my-chemistry-companion" }), true);
assert.equal(isProtectedShopRow({ id: "new-id", slug: "btec-unit-1-chemistry-atomic-structure" }), false);

const existing = findExistingUnit1Product([
  { id: "abc", slug: "btec-unit-1-chemistry-atomic-structure", title: "BTEC Unit 1 Chemistry: Atomic Structure", product_type: "powerpoint" },
], specs[0]);
assert.equal(existing.id, "abc");

assert.match(shopHandlers, /ensureMissingUnit1ShopProducts/);
assert.match(shopHandlers, /correctSpecialisedCellsClassification/);
assert.doesNotMatch(pkg.scripts.build, /publish-unit1-original-lessons/);

console.log("unit 1 original lesson publish catalogue ok");
