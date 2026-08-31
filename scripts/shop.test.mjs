import fs from "node:fs";
import assert from "node:assert/strict";

const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => { memory.set(key, String(value)); },
  removeItem: (key) => { memory.delete(key); },
};

import {
  applyShopProductUpdate,
  buildOrderLineItems,
  checkoutRejectionForProduct,
  EXTERNAL_CHECKOUT_ERROR,
  isMissingShopTable,
  isShopColumnMismatch,
  isShopSchemaCacheStale,
  isValidExternalUrl,
  missingShopColumnName,
  normalizeProductInput,
  normalizeShopProductRow,
  productIsFeatured,
  productIsPublished,
  purchaseMethod,
  toAdminProduct,
  toPublicProduct,
  specialisedCellsNeedsClassificationFix,
  SPECIALISED_CELLS_LEVEL,
  SPECIALISED_CELLS_EXAM_BOARD,
  PROTECTED_BTEC_SPECIALISED_CELLS_ID,
} from "../api/_lib/shop.js";
import {
  externalButtonLabel as purchaseCta,
  isValidExternalUrl as purchaseUrlOk,
  retailerPriceHint,
} from "../src/shopPurchase.js";
import {
  effectivePricePence,
  formatPricePence,
  penceToPoundsInput,
  poundsInputToPence,
  productOnSale,
} from "../src/shopFormat.js";
import {
  addToBasket,
  basketCount,
  basketSubtotalPence,
  clearBasket,
  readBasket,
  removeFromBasket,
  updateBasketQuantity,
} from "../src/shopBasket.js";
import {
  externalButtonLabel,
  isExternalProduct,
  isValidExternalUrl as isValidExternalUrlClient,
  normalizeShopProduct,
} from "../src/shopProductHelpers.js";
import {
  featuredTutorWindow,
  FEATURED_ROTATION_MS,
  homepageTutorFallback,
  isFounderTutor,
  ROTATION_INTERVAL_MS,
  shouldRotateTutorProfiles,
  tutorCarouselPageCount,
  tutorCarouselPageIndex,
  tutorSlotCount,
  tutorsForHomepage,
} from "../src/tutorRotation.js";
import {
  ROTATION_INTERVAL_MS as SHOP_ROTATION_INTERVAL_MS,
  shopCarouselPageCount,
  shopCarouselPageIndex,
  shopProductsForPage,
  shopSlotCount,
  shouldRotateShopProducts,
  sortShopProductsForHomepage,
} from "../src/shopCarousel.js";
import { pageFromPathname, pathForPage, shopSlugFromPathname } from "../src/seo.js";
import { productCardImageHeight, isValidProductImageFile } from "../src/shopProductHelpers.js";

assert.equal(SHOP_ROTATION_INTERVAL_MS, 300000);
assert.equal(shopSlotCount({ isMobile: true }), 1);
assert.equal(shopSlotCount({ isMobile: false, isTablet: true }), 2);
assert.equal(shopSlotCount({ isMobile: false, isTablet: false }), 4);
const shopSample = [
  { id: "1", title: "B", featured: false, sort_order: 2 },
  { id: "2", title: "A", is_featured: true, sort_order: 1 },
  { id: "3", title: "C", featured: true, sort_order: 3 },
  { id: "4", title: "D", sort_order: 4 },
  { id: "5", title: "E", sort_order: 5 },
];
assert.deepEqual(sortShopProductsForHomepage(shopSample).map((p) => p.id), ["2", "3", "1", "4", "5"]);
assert.equal(shopCarouselPageCount(5, 4), 2);
assert.equal(shopCarouselPageCount(4, 4), 1);
assert.equal(shopCarouselPageCount(1, 4), 1);
assert.equal(shopCarouselPageIndex(2, 2), 0);
assert.deepEqual(shopProductsForPage(sortShopProductsForHomepage(shopSample), 4, 0).map((p) => p.id), ["2", "3", "1", "4"]);
assert.deepEqual(shopProductsForPage(sortShopProductsForHomepage(shopSample), 4, 1).map((p) => p.id), ["5"]);
assert.equal(shouldRotateShopProducts(shopSample, 4), true);
assert.equal(shouldRotateShopProducts(shopSample.slice(0, 3), 4), false);

assert.equal(pageFromPathname("/shop"), "shop");
assert.equal(pageFromPathname("/shop/"), "shop");
assert.equal(pageFromPathname("/shop/aqa-chemistry-pack"), "shop-product");
assert.equal(shopSlugFromPathname("/shop/aqa-chemistry-pack"), "aqa-chemistry-pack");
assert.equal(pathForPage("shop"), "/shop");
assert.equal(pathForPage("shop-product", { shopSlug: "sample-pack" }), "/shop/sample-pack");

assert.equal(formatPricePence(499), "£4.99");
assert.equal(effectivePricePence({ price_pence: 1000, sale_price_pence: 750 }), 750);
assert.equal(productOnSale({ price_pence: 1000, sale_price_pence: 750 }), true);

assert.equal(isMissingShopTable({ message: 'relation "public.shop_products" does not exist' }), true);
assert.equal(isMissingShopTable({ message: "Could not find the table 'public.shop_products' in the schema cache" }), true);
assert.equal(isMissingShopTable({ message: 'column shop_products.preview_path does not exist' }), false);
assert.equal(isShopColumnMismatch({ message: 'column shop_products.preview_path does not exist' }), true);
assert.equal(missingShopColumnName({ message: 'column shop_products.preview_path does not exist' }), 'preview_path');
assert.equal(isShopSchemaCacheStale({ message: "Could not find the table 'public.shop_products' in the schema cache" }), true);

const sampleProduct = {
  id: "prod-1",
  slug: "gcse-chemistry-notes",
  title: "GCSE Chemistry Notes",
  price_pence: 500,
  effective_price_pence: 500,
  product_kind: "digital",
};

clearBasket();
addToBasket(sampleProduct, 1);
assert.equal(basketCount(readBasket()), 1);
assert.equal(basketSubtotalPence(readBasket()), 500);
updateBasketQuantity("prod-1", 2);
assert.equal(basketCount(readBasket()), 2);
removeFromBasket("prod-1");
assert.equal(basketCount(readBasket()), 0);

const externalProduct = {
  id: "prod-ext",
  slug: "chemistry-companion",
  title: "My Chemistry Companion",
  price_pence: 1299,
  effective_price_pence: 1299,
  product_kind: "digital",
  opens_external: true,
  external_url: "https://www.amazon.co.uk/dp/example",
  external_button_label: "Buy on Amazon",
};

assert.equal(isValidExternalUrl("https://www.amazon.co.uk/dp/example"), true);
assert.equal(isValidExternalUrl("http://example.com"), false);
assert.equal(isValidExternalUrl("javascript:alert(1)"), false);
assert.equal(isValidExternalUrl("data:text/html,hi"), false);
assert.equal(isValidExternalUrlClient("https://www.amazon.co.uk/dp/example"), true);
assert.equal(isExternalProduct(externalProduct), true);
assert.equal(externalButtonLabel(externalProduct), "Buy on Amazon");
assert.equal(externalButtonLabel({ opens_external: true, retailer_name: "Amazon", external_url: "https://www.amazon.co.uk/dp/example" }), "Buy on Amazon");
assert.equal(externalButtonLabel({ purchase_method: "external", retailer_name: "Waterstones" }), "Buy at Waterstones");
assert.equal(externalButtonLabel({ purchase_method: "external", retailer_name: "Pearson" }), "Buy from Pearson");
assert.equal(externalButtonLabel({ opens_external: true, external_url: "https://example.com" }), "Visit retailer");
assert.equal(purchaseMethod({ opens_external: false }), "jdscience");
assert.equal(purchaseMethod({ purchase_method: "external" }), "external");
assert.equal(checkoutRejectionForProduct(externalProduct), EXTERNAL_CHECKOUT_ERROR);
assert.equal(checkoutRejectionForProduct({ purchase_method: "jdscience" }), null);
assert.equal(purchaseUrlOk("https://www.waterstones.com/book/x"), true);
assert.match(retailerPriceHint({ purchase_method: "external", retailer_name: "Amazon", show_price: false }), /Check price at Amazon/);

clearBasket();
addToBasket(externalProduct, 1);
assert.equal(basketCount(readBasket()), 0);

const checkoutOrder = buildOrderLineItems([externalProduct, sampleProduct], [
  { product_id: "prod-ext", quantity: 1 },
]);
assert.equal(checkoutOrder.ok, false);
assert.equal(checkoutOrder.error, EXTERNAL_CHECKOUT_ERROR);

const normalOrder = buildOrderLineItems([sampleProduct], [
  { product_id: "prod-1", quantity: 1 },
]);
assert.equal(normalOrder.ok, false);
assert.match(normalOrder.error, /download file/i);

const digitalProduct = {
  ...sampleProduct,
  download_path: "downloads/sample.pdf",
};
const checkoutReady = buildOrderLineItems([digitalProduct], [
  { product_id: "prod-1", quantity: 1 },
]);
assert.equal(checkoutReady.ok, true);
assert.equal(checkoutReady.lines.length, 1);

assert.equal(productIsPublished({ is_published: true }), true);
assert.equal(productIsPublished({ published: true }), true);
assert.equal(productIsPublished({ is_published: false, published: true }), true);
assert.equal(productIsPublished({ is_published: false, published: false }), false);
assert.equal(productIsPublished({ is_featured: true, is_published: false, published: false }), true);

const publishedCatalog = [{ title: "GCSE Notes", slug: "gcse-notes", featured: true, published: true, product_kind: "digital", product_type: "revision_notes", price_pence: 299 }]
  .map(normalizeShopProductRow)
  .filter(productIsPublished);
assert.equal(publishedCatalog.length, 1);
assert.equal(publishedCatalog[0].slug, "gcse-notes");
assert.equal(productIsFeatured({ featured: true }), true);
assert.equal(productIsFeatured({ is_featured: true }), true);

const legacyPublished = normalizeShopProductRow({ title: "Legacy book", published: true, featured: true });
assert.equal(legacyPublished.is_published, true);
assert.equal(legacyPublished.published, true);
assert.equal(legacyPublished.is_featured, true);
assert.equal(legacyPublished.featured, true);
assert.equal(legacyPublished.external_url, "");
assert.equal(legacyPublished.external_button_label, "Buy now");
assert.equal(legacyPublished.opens_external, false);
assert.equal(legacyPublished.product_kind, "digital");

assert.equal(productCardImageHeight(true, 1200), 180);
assert.equal(productCardImageHeight(true, 500), 160);
assert.equal(productCardImageHeight(false, 1200), 200);
assert.equal(productCardImageHeight(false, 500), 180);

assert.equal(isValidProductImageFile({ type: "image/png", name: "cover.png" }).ok, true);
assert.equal(isValidProductImageFile({ type: "image/jpeg", name: "cover.jpg" }).ok, true);
assert.equal(isValidProductImageFile({ type: "image/webp", name: "cover.webp" }).ok, true);
assert.equal(isValidProductImageFile({ type: "application/pdf", name: "cover.pdf" }).ok, false);
assert.match(isValidProductImageFile({ type: "application/pdf", name: "cover.pdf" }).error, /JPG, PNG or WebP/i);

assert.equal(penceToPoundsInput(500), "5.00");
assert.equal(penceToPoundsInput(299), "2.99");
assert.equal(poundsInputToPence("5.00"), 500);
assert.equal(poundsInputToPence("£5.00"), 500);
assert.equal(poundsInputToPence("4.99"), 499);
assert.equal(poundsInputToPence("5"), 500);
assert.equal(Number.isNaN(poundsInputToPence("5.999")), true);

const existingProduct = {
  id: "53fa4258-a265-44f9-b605-a6bf512a2f03",
  slug: "unit-1-specialise-cells",
  title: "Unit 1 specialise cells",
  short_description: "Short",
  description: "Full",
  price_pence: 500,
  sale_price_pence: null,
  product_type: "powerpoint",
  product_kind: "digital",
  level: "T Level",
  subject: "Biology",
  exam_board: "N/A",
  image_path: "images/unit1.png",
  preview_path: "previews/unit1.pdf",
  download_path: "downloads/unit1.pptx",
  is_featured: true,
  featured: true,
  is_published: true,
  published: true,
  sort_order: 0,
};

const titleOnly = applyShopProductUpdate(existingProduct, {
  title: "Unit 1 Specialised Cells",
  image_path: "",
  preview_path: "",
  download_path: "",
});
assert.equal(titleOnly.ok, true);
assert.equal(titleOnly.fields.title, "Unit 1 Specialised Cells");
assert.equal(titleOnly.fields.slug, "unit-1-specialise-cells");
assert.equal(titleOnly.fields.price_pence, 500);
assert.equal(titleOnly.fields.image_path, "images/unit1.png");
assert.equal(titleOnly.fields.preview_path, "previews/unit1.pdf");
assert.equal(titleOnly.fields.download_path, "downloads/unit1.pptx");
assert.equal(titleOnly.fields.is_published, true);
assert.equal(titleOnly.fields.is_featured, true);
assert.equal(titleOnly.slugChanged, false);

const priceOnly = applyShopProductUpdate(existingProduct, { price_pence: 799 });
assert.equal(priceOnly.fields.price_pence, 799);
assert.equal(priceOnly.fields.download_path, "downloads/unit1.pptx");
assert.equal(priceOnly.fields.title, existingProduct.title);

const coverOnly = applyShopProductUpdate(existingProduct, { image_path: "images/new-cover.png" });
assert.equal(coverOnly.fields.image_path, "images/new-cover.png");
assert.equal(coverOnly.fields.download_path, "downloads/unit1.pptx");
assert.equal(coverOnly.fields.preview_path, "previews/unit1.pdf");

const downloadOnly = applyShopProductUpdate(existingProduct, { download_path: "downloads/new.pptx" });
assert.equal(downloadOnly.fields.download_path, "downloads/new.pptx");
assert.equal(downloadOnly.fields.image_path, "images/unit1.png");

const clearedPreview = applyShopProductUpdate(existingProduct, {}, { clear_preview: true });
assert.equal(clearedPreview.fields.preview_path, null);
assert.equal(clearedPreview.fields.download_path, "downloads/unit1.pptx");

const publishNeedsDownload = applyShopProductUpdate({ ...existingProduct, download_path: null }, { is_published: true }, { clear_download: true });
assert.equal(publishNeedsDownload.ok, false);

assert.equal(titleOnly.fields.purchase_method, "jdscience");
assert.equal(titleOnly.fields.opens_external, false);

const externalised = applyShopProductUpdate(existingProduct, {
  purchase_method: "external",
  retailer_name: "Amazon",
  external_url: "https://www.amazon.co.uk/dp/example",
  show_price: false,
});
assert.equal(externalised.ok, true);
assert.equal(externalised.fields.purchase_method, "external");
assert.equal(externalised.fields.opens_external, true);
assert.equal(externalised.fields.retailer_name, "Amazon");
assert.equal(externalised.fields.download_path, "downloads/unit1.pptx");
assert.equal(externalised.fields.image_path, "images/unit1.png");
assert.equal(externalised.fields.external_button_label, "Buy on Amazon");

const missingRetailer = applyShopProductUpdate(existingProduct, {
  purchase_method: "external",
  retailer_name: "",
  external_url: "https://www.amazon.co.uk/dp/example",
});
assert.equal(missingRetailer.ok, false);

const badScheme = applyShopProductUpdate(existingProduct, {
  purchase_method: "external",
  retailer_name: "Amazon",
  external_url: "javascript:alert(1)",
});
assert.equal(badScheme.ok, false);

const createdExternal = normalizeProductInput({
  title: "My Chemistry Companion: Your Ultimate GCSE Chemistry Revision Book",
  short_description: "GCSE Chemistry revision book",
  description: "Sold on Amazon",
  product_type: "book",
  purchase_method: "external",
  retailer_name: "Amazon",
  external_url: "https://www.amazon.co.uk/dp/example",
  show_price: false,
  price_pence: "",
});
assert.equal(createdExternal.ok, true);
assert.equal(createdExternal.fields.purchase_method, "external");
assert.equal(createdExternal.fields.download_path, null);

const publicView = toPublicProduct({ ...existingProduct, download_url: "https://example.test/secret" });
assert.equal("download_path" in publicView, false);
const adminView = toAdminProduct(existingProduct);
assert.equal(adminView.download_path, "downloads/unit1.pptx");

const adminSource = fs.readFileSync(new URL("../src/AdminShopEditor.jsx", import.meta.url), "utf8");
assert.match(adminSource, /ShopFileUploadBox/, "AdminShopEditor must use ShopFileUploadBox");
assert.match(adminSource, /Drag and drop a cover image here/);
assert.match(adminSource, /Choose image file/);
assert.match(adminSource, /Product title/);
assert.match(adminSource, /Purchase method/);
assert.match(adminSource, /Sell directly on JDScience/);
assert.match(adminSource, /External retailer/);
assert.match(adminSource, /Retailer name/);
assert.match(adminSource, /Price \(£\)/);
assert.match(adminSource, /Cover image/);
assert.match(adminSource, /Customer download/);
assert.match(adminSource, /Update product/);
assert.match(adminSource, /Product updated successfully/);
assert.match(adminSource, /Are you sure you want to delete this product/);
assert.match(adminSource, /shop-update/);
assert.doesNotMatch(adminSource, /showDebug=\{true\}/);

const uploadSource = fs.readFileSync(new URL("../src/AdminShopFileUpload.jsx", import.meta.url), "utf8");
assert.match(uploadSource, /type="file"/, "ShopFileUploadBox must render a native file input");
assert.match(uploadSource, /Leave as “No file chosen” to keep the current file/);
assert.match(uploadSource, /onDragOver/, "ShopFileUploadBox must wire drag-and-drop handlers");
assert.doesNotMatch(uploadSource, /inputRef\.current\?\.click|input\.click\(\)/, "Must not rely on programmatic input.click()");
assert.doesNotMatch(uploadSource, /display:\s*[\"']none[\"']/, "Must not hide file input with display:none");
assert.match(uploadSource, /import\.meta\.env\.DEV/, "Upload debug must stay behind development mode");
assert.match(adminSource, /shop-product-form/, "Shop uploads must sit outside the product form");
assert.match(adminSource, /SHOP_SUBJECTS/, "AdminShopEditor must import SHOP_SUBJECTS");

const tutors = [
  { public_slug: "joseph-danso", tutor_name: "Joseph Danso", is_published: true, profile_status: "approved" },
  { public_slug: "joseph-danso-4qy75y", tutor_name: "Joseph Danso", is_published: true, profile_status: "approved" },
  { public_slug: "amina-khan", tutor_name: "Amina Khan", is_published: true, profile_status: "approved" },
  { public_slug: "sam-reed", tutor_name: "Sam Reed", is_published: true, profile_status: "approved" },
  { public_slug: "lee-okonkwo", tutor_name: "Lee Okonkwo", is_published: true, profile_status: "approved" },
  { public_slug: "pending-tutor", tutor_name: "Pending Tutor", is_published: false, profile_status: "pending" },
];
assert.equal(isFounderTutor({ public_slug: "joseph-danso-4qy75y" }), true);
assert.equal(
  tutorsForHomepage(tutors).map((item) => item.public_slug).join(","),
  "joseph-danso,joseph-danso-4qy75y,amina-khan,sam-reed,lee-okonkwo",
  "Homepage carousel must include published founder profiles",
);
assert.deepEqual(homepageTutorFallback(tutors).map((item) => item.public_slug), ["joseph-danso", "joseph-danso-4qy75y", "amina-khan", "sam-reed", "lee-okonkwo"]);
assert.deepEqual(homepageTutorFallback([{ public_slug: "joseph-danso-4qy75y", tutor_name: "Joseph Danso" }]).map((item) => item.public_slug), ["joseph-danso-4qy75y"]);
const homepage = tutorsForHomepage(tutors);
assert.equal(FEATURED_ROTATION_MS, 300000);
assert.equal(ROTATION_INTERVAL_MS, 300000);
assert.equal(FEATURED_ROTATION_MS, ROTATION_INTERVAL_MS);
assert.equal(tutorSlotCount({ isMobile: true }), 1);
assert.equal(tutorSlotCount({ isMobile: false, isTablet: true }), 2);
assert.equal(tutorSlotCount({ isMobile: false, isTablet: false }), 3);
assert.equal(shouldRotateTutorProfiles(tutors), true);
assert.equal(shouldRotateTutorProfiles([{ public_slug: "amina-khan", is_published: true }]), false);
assert.equal(tutorCarouselPageCount(homepage), homepage.length);
assert.equal(tutorCarouselPageIndex(4, homepage.length), 4 % homepage.length);
assert.deepEqual(featuredTutorWindow(homepage, 1, 1).map((item) => item.public_slug), ["joseph-danso-4qy75y"]);
assert.deepEqual(featuredTutorWindow(homepage, 3, 1).map((item) => item.public_slug), ["joseph-danso-4qy75y", "amina-khan", "sam-reed"]);

assert.equal(SPECIALISED_CELLS_LEVEL, "BTEC Level 3");
assert.equal(SPECIALISED_CELLS_EXAM_BOARD, "Pearson");
assert.equal(specialisedCellsNeedsClassificationFix({
  id: PROTECTED_BTEC_SPECIALISED_CELLS_ID,
  level: "T Level",
  exam_board: "N/A",
}), true);
assert.equal(specialisedCellsNeedsClassificationFix({
  id: PROTECTED_BTEC_SPECIALISED_CELLS_ID,
  level: "BTEC Level 3",
  exam_board: "Pearson",
}), false);

console.log("shop.test.mjs: ok");
