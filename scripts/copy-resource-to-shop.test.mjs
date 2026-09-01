import assert from "node:assert/strict";
import {
  buildCopyProductFields,
  classifyResourceProductType,
  cleanShopTitle,
  isCopyableTeachingResource,
  planResourceShopCopy,
  shopCopySkipReason,
  shopLevelFromResource,
} from "../api/_lib/copyResourceToShop.js";
import {
  APPROVED_SHOP_PRICE_PENCE,
  resolveCopyPricePence,
} from "../src/shopStandardPrices.js";

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

const notes = {
  id: 80,
  title: "JDScience GCSE Chemistry revision notes",
  file_name: "JDScience_GCSE_Chemistry_revision_notes.pdf",
  file_type: "application/pdf",
  resource_category: "Revision Notes",
  level: "GCSE",
  subject: "Chemistry",
  exam_board: "AQA",
  storage_path: "gcse/chemistry/aqa/revision-notes/notes.pdf",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/notes.pdf",
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
  file_url: "https://filestore.aqa.org.uk/x.pdf",
};

const thirdPartyWorksheet = {
  id: 11,
  title: "Cells worksheet pack",
  file_name: "cells-worksheet.pdf",
  file_type: "application/pdf",
  resource_category: "Worksheets",
  level: "GCSE/IGCSE",
  subject: "Biology",
  exam_board: "AQA",
  storage_path: "x",
  file_url: "https://example.supabase.co/storage/v1/object/public/resources/x.pdf",
};

const answerSheet = {
  ...worksheet,
  id: 109,
  title: "JDScience topic answer sheet",
  file_name: "JDScience-topic-answer-sheet.pdf",
};

assert.equal(classifyResourceProductType(ppt), "powerpoint");
assert.equal(classifyResourceProductType(worksheet), "worksheet");
assert.equal(classifyResourceProductType(notes), "revision_notes");
assert.equal(classifyResourceProductType(answerSheet), "answer_sheet");
assert.equal(isCopyableTeachingResource(ppt), true);
assert.equal(isCopyableTeachingResource(worksheet), true);
assert.equal(isCopyableTeachingResource(notes), true);
assert.equal(isCopyableTeachingResource(pastPaper), false);
assert.equal(isCopyableTeachingResource(thirdPartyWorksheet), false);
assert.equal(isCopyableTeachingResource(answerSheet), false);
assert.equal(shopCopySkipReason(pastPaper), "third_party_copyright");
assert.equal(shopCopySkipReason(thirdPartyWorksheet), "not_original_jdscience");
assert.equal(shopCopySkipReason(answerSheet), "answer_sheet_bundled_with_worksheet");
assert.equal(shopLevelFromResource("GCSE"), "GCSE/IGCSE");
assert.equal(shopLevelFromResource("A-Level"), "A Level");
assert.equal(cleanShopTitle(ppt), "JDScience C6 Rate and Extent");

assert.equal(APPROVED_SHOP_PRICE_PENCE.powerpoint, 500);
assert.equal(APPROVED_SHOP_PRICE_PENCE.worksheet, 200);
assert.equal(APPROVED_SHOP_PRICE_PENCE.revision_notes, 300);
assert.equal(resolveCopyPricePence("powerpoint", null).price_pence, 500);
assert.equal(resolveCopyPricePence("worksheet", null).price_pence, 200);
assert.equal(resolveCopyPricePence("revision_notes", null).price_pence, 300);
assert.equal(resolveCopyPricePence("book", null).ok, false);

const missingPrice = buildCopyProductFields(ppt, {
  price_pence: null,
  download_path: "downloads/x.pptx",
});
assert.equal(missingPrice.ok, true);
assert.equal(missingPrice.fields.price_pence, 500);

const notesBuilt = buildCopyProductFields(notes, {
  price_pence: null,
  download_path: "downloads/notes.pdf",
});
assert.equal(notesBuilt.ok, true);
assert.equal(notesBuilt.fields.product_type, "revision_notes");
assert.equal(notesBuilt.fields.price_pence, 300);

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

const unit1Existing = [{
  id: "existing-cell-structure",
  title: "BTEC Unit 1 Biology: Cell Structure",
  product_type: "powerpoint",
}];
const duplicatePlan = planResourceShopCopy({
  ...ppt,
  id: 401,
  title: "BTEC Unit 1 Biology: Cell Structure",
  file_name: "jdscience-btec-unit-1-biology-cell-structure.pptx",
}, unit1Existing);
assert.equal(duplicatePlan.ok, false);
assert.equal(duplicatePlan.skip, "already_in_shop");

const readyPlan = planResourceShopCopy(ppt, unit1Existing);
assert.equal(readyPlan.ok, true);
assert.equal(readyPlan.price_pence, 500);

console.log("copy-resource-to-shop.test.mjs: ok");
