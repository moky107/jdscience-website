import fs from "node:fs";
import assert from "node:assert/strict";

const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => { memory.set(key, String(value)); },
  removeItem: (key) => { memory.delete(key); },
};

import {
  buildOrderLineItems,
  isMissingShopTable,
  isShopColumnMismatch,
  isShopSchemaCacheStale,
  isValidExternalUrl,
  missingShopColumnName,
  normalizeShopProductRow,
  productIsFeatured,
  productIsPublished,
} from "../api/_lib/shop.js";
import {
  effectivePricePence,
  formatPricePence,
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
  homepageTutorFallback,
  isFounderTutor,
  shouldRotateTutorProfiles,
  tutorCarouselPageCount,
  tutorCarouselPageIndex,
  tutorSlotCount,
  tutorsForHomepage,
} from "../src/tutorRotation.js";
import { pageFromPathname, pathForPage, shopSlugFromPathname } from "../src/seo.js";
import { productCardImageHeight, isValidProductImageFile } from "../src/shopProductHelpers.js";

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
assert.equal(isValidExternalUrlClient("https://www.amazon.co.uk/dp/example"), true);
assert.equal(isExternalProduct(externalProduct), true);
assert.equal(externalButtonLabel(externalProduct), "Buy on Amazon");
assert.equal(externalButtonLabel({ opens_external: true, external_url: "https://example.com" }), "Buy now");

clearBasket();
addToBasket(externalProduct, 1);
assert.equal(basketCount(readBasket()), 0);

const checkoutOrder = buildOrderLineItems([externalProduct, sampleProduct], [
  { product_id: "prod-ext", quantity: 1 },
]);
assert.equal(checkoutOrder.ok, false);
assert.match(checkoutOrder.error, /external website/i);

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

const adminSource = fs.readFileSync(new URL("../src/AdminShopEditor.jsx", import.meta.url), "utf8");
assert.match(adminSource, /ShopFileUploadBox/, "AdminShopEditor must use ShopFileUploadBox");
assert.match(adminSource, /Click to upload or drag and drop product image/);
assert.match(adminSource, /SHOP_SUBJECTS/, "AdminShopEditor must import SHOP_SUBJECTS");

const tutors = [
  { public_slug: "joseph-danso", tutor_name: "Joseph Danso" },
  { public_slug: "joseph-danso-4qy75y", tutor_name: "Joseph Danso" },
  { public_slug: "amina-khan", tutor_name: "Amina Khan" },
  { public_slug: "sam-reed", tutor_name: "Sam Reed" },
  { public_slug: "lee-okonkwo", tutor_name: "Lee Okonkwo" },
];
assert.equal(isFounderTutor({ public_slug: "joseph-danso-4qy75y" }), true);
assert.equal(tutorsForHomepage(tutors).map((item) => item.public_slug).join(","), "amina-khan,sam-reed,lee-okonkwo");
assert.deepEqual(homepageTutorFallback(tutors).map((item) => item.public_slug), ["amina-khan", "sam-reed", "lee-okonkwo"]);
assert.deepEqual(homepageTutorFallback([{ public_slug: "joseph-danso-4qy75y", tutor_name: "Joseph Danso" }]).map((item) => item.public_slug), ["joseph-danso-4qy75y"]);
const homepage = tutorsForHomepage(tutors);
assert.equal(tutorSlotCount({ isMobile: true }), 1);
assert.equal(tutorSlotCount({ isMobile: false, isTablet: true }), 2);
assert.equal(tutorSlotCount({ isMobile: false, isTablet: false }), 3);
assert.equal(shouldRotateTutorProfiles(tutors, 3), false);
assert.equal(shouldRotateTutorProfiles(homepage, 3), homepage.length > 3);
assert.equal(tutorCarouselPageCount(homepage, 3), homepage.length > 3 ? homepage.length : 1);
assert.equal(tutorCarouselPageIndex(4, homepage.length), 1);
const extendedHomepage = [
  ...homepage,
  { public_slug: "priya-shah", tutor_name: "Priya Shah" },
];
assert.equal(shouldRotateTutorProfiles(extendedHomepage, 3), true);
assert.deepEqual(featuredTutorWindow(extendedHomepage, 3, 1).map((item) => item.public_slug), ["sam-reed", "lee-okonkwo", "priya-shah"]);

console.log("shop.test.mjs: ok");
