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
  TUTOR_CHOOSING_NOTICE,
} from "../src/termsAndConditions.js";
import { hasAcceptedTerms, TERMS_VERSION as API_TERMS_VERSION } from "../api/_lib/requireTerms.js";
import { buildTermsHtml } from "./seo/write-terms-page.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(TERMS_VERSION, "1.1");
assert.equal(API_TERMS_VERSION, TERMS_VERSION);
assert.match(TERMS_UPDATED, /August 2026/);
assert.ok(TERMS_SECTIONS.length >= 10, "terms should cover the main platform risk areas");
assert.match(TERMS_ACCEPTANCE_ERROR, /agree to the Terms/);
assert.match(TUTOR_CHOOSING_NOTICE, /independent tutors/);
assert.match(TUTOR_CHOOSING_NOTICE, /own checks/);
assert.match(TUTOR_CHOOSING_NOTICE, /under 18/);
assert.match(TERMS_PAGE_DESCRIPTION, /discover and connect/);

const joined = TERMS_SECTIONS.map((section) => `${section.title}\n${(section.paragraphs || []).join("\n")}\n${(section.bullets || []).join("\n")}\n${(section.afterParagraphs || []).join("\n")}`).join("\n").toLowerCase();
assert.match(joined, /discover and connect with tutors/);
assert.match(joined, /not employees/);
assert.match(joined, /reasonable due diligence/);
assert.match(joined, /tutor's identity/);
assert.match(joined, /qualifications and professional credentials/);
assert.match(joined, /examination board/);
assert.match(joined, /references or reviews/);
assert.match(joined, /safeguarding arrangements/);
assert.match(joined, /dbs status/);
assert.match(joined, /independently satisfy yourself/);
assert.match(joined, /cannot lawfully be excluded/);
assert.match(joined, /death or personal injury/);
assert.match(joined, /does not mean we have verified/);
assert.doesNotMatch(joined, /absolved of all liabilities/);
assert.doesNotMatch(joined, /bears no responsibility/);
assert.doesNotMatch(joined, /no responsibility whatsoever/);
assert.match(joined, /no guarantee/);
assert.match(joined, /exam success/);
assert.match(joined, /under 18/);
assert.match(joined, /england and wales/);
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
assert.match(html, /Version 1\.1/);
assert.match(html, /reasonable due diligence/);
assert.match(html, /cannot lawfully be excluded/);
assert.match(html, /canonical" href="https:\/\/www\.jdscience\.co\.uk\/terms\//);

const termsPage = path.join(root, "public", "terms", "index.html");
assert.equal(fs.existsSync(termsPage), true, "public/terms/index.html must exist");
const published = fs.readFileSync(termsPage, "utf8");
assert.match(published, /JD Science Terms and Conditions|Terms and Conditions/);
assert.match(published, /reasonable due diligence/);
assert.match(published, /cannot lawfully be excluded/);

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
assert.match(app, /TutorChoosingNotice/);
assert.match(fs.readFileSync(path.join(root, "src", "TutorChoosingNotice.jsx"), "utf8"), /TUTOR_CHOOSING_NOTICE/);

assert.match(fs.readFileSync(path.join(root, "public", "resource-gate.js"), "utf8"), /jd_signed_in=1/);
assert.match(fs.readFileSync(path.join(root, "public", "resource-gate.js"), "utf8"), /Googlebot/);
assert.match(fs.readFileSync(path.join(root, "public", "resource-gate.js"), "utf8"), /\/papers/);

const apiFiles = fs.readdirSync(path.join(root, "api")).filter((name) => name.endsWith(".js"));
assert.equal(apiFiles.length, 12, "Vercel Hobby must keep exactly 12 top-level API functions");

console.log("terms.test.mjs: ok");
