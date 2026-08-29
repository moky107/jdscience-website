import assert from "node:assert/strict";

const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => { memory.set(key, String(value)); },
  removeItem: (key) => { memory.delete(key); },
};

import {
  isMissingShopTable,
  isShopColumnMismatch,
  isShopSchemaCacheStale,
  missingShopColumnName,
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
  featuredTutorWindow,
  shouldRotateTutorProfiles,
  tutorCarouselPageCount,
  tutorCarouselPageIndex,
  tutorSlotCount,
  tutorsForHomepage,
} from "../src/tutorRotation.js";
import { pageFromPathname, pathForPage, shopSlugFromPathname } from "../src/seo.js";

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

const tutors = [
  { public_slug: "joseph-danso", tutor_name: "Joseph Danso" },
  { public_slug: "amina-khan", tutor_name: "Amina Khan" },
  { public_slug: "sam-reed", tutor_name: "Sam Reed" },
  { public_slug: "lee-okonkwo", tutor_name: "Lee Okonkwo" },
];
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
