import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TERMS_ACCEPTANCE_ERROR,
  TERMS_PAGE_DESCRIPTION,
  TERMS_SECTIONS,
  TERMS_UPDATED,
  TERMS_VERSION,
} from "../src/termsAndConditions.js";
import { hasAcceptedTerms, TERMS_VERSION as API_TERMS_VERSION } from "../api/_lib/requireTerms.js";
import { buildTermsHtml } from "./seo/write-terms-page.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(TERMS_VERSION, "1.0");
assert.equal(API_TERMS_VERSION, TERMS_VERSION);
assert.match(TERMS_UPDATED, /August 2026/);
assert.ok(TERMS_SECTIONS.length >= 10, "terms should cover the main platform risk areas");
assert.match(TERMS_ACCEPTANCE_ERROR, /agree to the Terms/);
assert.match(TERMS_PAGE_DESCRIPTION, /advertising and introduction/);

const joined = TERMS_SECTIONS.map((section) => `${section.title}\n${(section.paragraphs || []).join("\n")}\n${(section.bullets || []).join("\n")}`).join("\n").toLowerCase();
assert.match(joined, /independent private tutors/);
assert.match(joined, /advertising and introduction platform/);
assert.match(joined, /absolved of all liabilities/);
assert.match(joined, /not a party to any contract/);
assert.match(joined, /no guarantee/);
assert.match(joined, /exam success/);
assert.match(joined, /dbs/);
assert.match(joined, /under 18/);
assert.match(joined, /england and wales/);
assert.match(joined, /death or personal injury/);
assert.match(joined, /not your employer/);
assert.match(joined, /registered users only/);
assert.match(joined, /log in to access the library/);

assert.equal(hasAcceptedTerms({}), false);
assert.equal(hasAcceptedTerms({ accept_terms: false }), false);
assert.equal(hasAcceptedTerms({ accept_terms: "no" }), false);
assert.equal(hasAcceptedTerms({ accept_terms: true }), true);
assert.equal(hasAcceptedTerms({ accept_terms: "true" }), true);
assert.equal(hasAcceptedTerms({ accept_terms: "on" }), true);
assert.equal(hasAcceptedTerms({ accept_terms: 1 }), true);

const html = buildTermsHtml();
assert.match(html, /Terms and Conditions/);
assert.match(html, /Version 1\.0/);
assert.match(html, /independent private tutors/);
assert.match(html, /absolved of all liabilities/);
assert.match(html, /canonical" href="https:\/\/www\.jdscience\.co\.uk\/terms\//);

const termsPage = path.join(root, "public", "terms", "index.html");
assert.equal(fs.existsSync(termsPage), true, "public/terms/index.html must exist");
const published = fs.readFileSync(termsPage, "utf8");
assert.match(published, /JD Science Terms and Conditions|Terms and Conditions/);
assert.match(published, /absolved of all liabilities/);

const bookingApi = fs.readFileSync(path.join(root, "api", "create-booking.js"), "utf8");
const checkoutApi = fs.readFileSync(path.join(root, "api", "create-checkout-session.js"), "utf8");
const tutorApi = fs.readFileSync(path.join(root, "api", "create-tutor-application.js"), "utf8");
assert.match(bookingApi, /hasAcceptedTerms/);
assert.match(checkoutApi, /hasAcceptedTerms/);
assert.match(tutorApi, /hasAcceptedTerms/);

const vercel = fs.readFileSync(path.join(root, "vercel.json"), "utf8");
assert.match(vercel, /terms\//);

const authModal = fs.readFileSync(path.join(root, "src", "AuthModal.jsx"), "utf8");
assert.match(authModal, /termsAccepted/);
assert.match(authModal, /mode === "register" && !termsAccepted/);

const app = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
assert.match(app, /accept_terms: true/);
assert.match(app, /variant="tutor"/);
assert.match(app, /variant="booking"/);
assert.match(app, /href="\/terms\/"/);

const apiFiles = fs.readdirSync(path.join(root, "api")).filter((name) => name.endsWith(".js"));
assert.equal(apiFiles.length, 12, "Vercel Hobby must keep exactly 12 top-level API functions");

console.log("terms.test.mjs: ok");
