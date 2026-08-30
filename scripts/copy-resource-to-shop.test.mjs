import assert from "node:assert/strict";
import {
  buildCopyProductFields,
  classifyResourceProductType,
  cleanShopTitle,
  isCopyableTeachingResource,
  shopLevelFromResource,
} from "../api/_lib/copyResourceToShop.js";

const ppt = {
  id: 57,
  title: "JDScience_C6_Rate_and_Extent",
  file_name: "JDScience_C6_Rate_and_Extent.pptx",
  file_type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  resource_category: "Revision Notes",
  level: "GCSE",
  subject: "Chemistry",
  exam_board: "AQA",
  storage_path: "gcse/chemistry/aqa/revision-notes/file.pptx",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/gcse/chemistry/aqa/revision-notes/file.pptx",
};

const worksheet = {
  id: 108,
  title: "JDScience_GCSE_Physics_Forces_Modules_10_11",
  file_name: "JDScience_GCSE_Physics_Forces_Modules_10_11.pdf",
  file_type: "application/pdf",
  resource_category: "Worksheets",
  level: "GCSE/IGCSE",
  subject: "Physics",
  exam_board: "AQA",
  storage_path: "gcse-igcse/physics/aqa/worksheets/file.pdf",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/x.pdf",
};

const pastPaper = {
  id: 2,
  title: "AQA June 2024",
  file_name: "AQA-84621H-QP-JUN24.PDF",
  file_type: "application/pdf",
  resource_category: "Past Questions",
  level: "GCSE/IGCSE",
  subject: "Chemistry",
  exam_board: "AQA",
  storage_path: "x",
  file_url: "https://example.com/x.pdf",
};

assert.equal(classifyResourceProductType(ppt), "powerpoint");
assert.equal(classifyResourceProductType(worksheet), "worksheet");
assert.equal(classifyResourceProductType({
  ...worksheet,
  title: "Topic answers sheet",
  file_name: "topic-answer-sheet.pdf",
  resource_category: "Worksheets",
}), "answer_sheet");
assert.equal(isCopyableTeachingResource(ppt), true);
assert.equal(isCopyableTeachingResource(worksheet), true);
assert.equal(isCopyableTeachingResource(pastPaper), false);
assert.equal(shopLevelFromResource("GCSE"), "GCSE/IGCSE");
assert.equal(shopLevelFromResource("A-Level"), "A Level");
assert.equal(cleanShopTitle(ppt), "JDScience C6 Rate and Extent");

const missingPrice = buildCopyProductFields(ppt, {
  price_pence: null,
  download_path: "downloads/x.pptx",
});
assert.equal(missingPrice.ok, false);
assert.match(missingPrice.error, /price/i);

const built = buildCopyProductFields(ppt, {
  price_pence: 500,
  download_path: "downloads/x.pptx",
});
assert.equal(built.ok, true);
assert.equal(built.fields.product_type, "powerpoint");
assert.equal(built.fields.product_kind, "digital");
assert.equal(built.fields.price_pence, 500);
assert.equal(built.fields.stock_quantity, null);
assert.equal(built.fields.is_published, true);
assert.equal(built.fields.published, true);
assert.equal(built.fields.source_resource_id, 57);
assert.equal(built.fields.download_path, "downloads/x.pptx");
assert.equal(built.fields.subject, "Chemistry");
assert.ok(built.fields.slug.includes("57"));

const wsBuilt = buildCopyProductFields(worksheet, {
  price_pence: 200,
  download_path: "downloads/ws.pdf",
});
assert.equal(wsBuilt.fields.product_type, "worksheet");
assert.equal(wsBuilt.fields.level, "GCSE/IGCSE");

console.log("copy-resource-to-shop.test.mjs: ok");
