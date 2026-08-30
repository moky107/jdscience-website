import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import {
  deleteObsoleteSeededUnit1Products,
  isObsoleteSeededUnit1Product,
  OBSOLETE_SEEDED_UNIT1_SLUG,
  OBSOLETE_SEEDED_UNIT1_TITLE,
  PROTECTED_BTEC_SPECIALISED_CELLS_ID,
  PROTECTED_CHEMISTRY_COMPANION_ID,
} from "../api/_lib/shop.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");
const shopHandlers = fs.readFileSync(new URL("../api/_lib/shopHandlers.js", import.meta.url), "utf8");
const adminSource = fs.readFileSync(new URL("../src/AdminShopEditor.jsx", import.meta.url), "utf8");

assert.doesNotMatch(shopHandlers, /ensureUnit1SpecialiseCellsProduct/);
assert.doesNotMatch(shopHandlers, /publishUnit1SpecialiseCells/);
assert.match(shopHandlers, /deleteObsoleteSeededUnit1Products/);
assert.match(shopHandlers, /delete\(\)\.eq\('id', id\)/);
assert.match(adminSource, /action: "shop-delete", id/);
assert.match(adminSource, /removeProduct\(product\.id\)/);

assert.doesNotMatch(pkg.scripts.build, /publish-unit1-specialise-cells/);
assert.doesNotMatch(pkg.scripts["seo:build"] || "", /publish-unit1-specialise-cells/);

assert.equal(isObsoleteSeededUnit1Product({
  id: "dfd172d3-c8c9-4209-bed7-1e0b2ec85079",
  title: OBSOLETE_SEEDED_UNIT1_TITLE,
  slug: OBSOLETE_SEEDED_UNIT1_SLUG,
}), true);
assert.equal(isObsoleteSeededUnit1Product({
  id: PROTECTED_BTEC_SPECIALISED_CELLS_ID,
  title: OBSOLETE_SEEDED_UNIT1_TITLE,
  slug: OBSOLETE_SEEDED_UNIT1_SLUG,
}), false);
assert.equal(isObsoleteSeededUnit1Product({
  id: PROTECTED_CHEMISTRY_COMPANION_ID,
  title: "My Chemistry Companion: Your Ultimate GCSE Chemistry Revision Book",
  slug: "my-chemistry-companion",
}), false);
assert.equal(isObsoleteSeededUnit1Product({
  id: PROTECTED_BTEC_SPECIALISED_CELLS_ID,
  title: "BTEC Unit 1 Biology: Specialised Cells",
  slug: "specialise-cells",
}), false);

const deleted = [];
const fake = {
  from() {
    return {
      select() {
        return {
          eq() {
            return {
              eq: async () => ({
                data: [
                  { id: "dfd172d3-c8c9-4209-bed7-1e0b2ec85079", title: OBSOLETE_SEEDED_UNIT1_TITLE, slug: OBSOLETE_SEEDED_UNIT1_SLUG },
                  { id: PROTECTED_BTEC_SPECIALISED_CELLS_ID, title: OBSOLETE_SEEDED_UNIT1_TITLE, slug: OBSOLETE_SEEDED_UNIT1_SLUG },
                ],
                error: null,
              }),
              maybeSingle: async () => ({ data: null, error: null }),
            };
          },
        };
      },
      delete() {
        return {
          eq: async (_col, id) => {
            deleted.push(id);
            return { error: null };
          },
        };
      },
    };
  },
};

const result = await deleteObsoleteSeededUnit1Products(fake);
assert.deepEqual(result.deletedIds, ["dfd172d3-c8c9-4209-bed7-1e0b2ec85079"]);
assert.equal(deleted.includes(PROTECTED_BTEC_SPECIALISED_CELLS_ID), false);
assert.equal(deleted.includes(PROTECTED_CHEMISTRY_COMPANION_ID), false);

console.log("unit 1 specialise cells obsolete-seed cleanup ok");
