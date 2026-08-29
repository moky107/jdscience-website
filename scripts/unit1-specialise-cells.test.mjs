import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { productFields, unit1AssetPaths } from "../api/_lib/publishUnit1SpecialiseCells.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ppt = path.join(root, "content/shop/Unit 1 specialise cells.pptx");
const cover = path.join(root, "content/shop/unit-1-specialise-cells/cover.png");

await access(ppt);
await access(cover);
const assets = await unit1AssetPaths();
assert.ok(assets.ppt, "PowerPoint file must be resolvable");
assert.ok(assets.cover, "Cover image must be resolvable");

const fields = productFields({
  download_path: "downloads/demo.pptx",
  image_path: "images/demo.png",
});

assert.equal(fields.title, "Unit 1 specialise cells");
assert.equal(fields.price_pence, 500);
assert.equal(fields.product_type, "powerpoint");
assert.equal(fields.product_kind, "digital");
assert.equal(fields.is_published, true);
assert.equal(fields.slug, "unit-1-specialise-cells");
assert.match(path.basename(ppt), /^Unit 1 specialise cells\.pptx$/);

console.log("unit 1 specialise cells shop payload ok");
