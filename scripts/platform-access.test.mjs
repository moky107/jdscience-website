import assert from "node:assert/strict";
import { featuredTutorWindow, shouldRotateTutorProfiles, tutorCarouselPageCount, tutorCarouselPageIndex, tutorsForHomepage } from "../src/tutorRotation.js";
import { HAS_ACCOUNT_KEY, isResourceLibraryPage, markHasAccount, preferredVisitorAuthMode, RESOURCE_LOGIN_REQUIRED } from "../src/visitorAuth.js";
import { withResourceGate } from "./seo/inject-resource-gate.mjs";

assert.equal(RESOURCE_LOGIN_REQUIRED, false);
assert.equal(isResourceLibraryPage("papers"), true);
assert.equal(isResourceLibraryPage("resources"), true);
assert.equal(isResourceLibraryPage("home"), false);
assert.equal(isResourceLibraryPage("tutors"), false);

const memory = new Map();
const storage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => { memory.set(key, String(value)); },
};
assert.equal(preferredVisitorAuthMode(storage), "register");
markHasAccount(storage);
assert.equal(storage.getItem(HAS_ACCOUNT_KEY), "1");
assert.equal(preferredVisitorAuthMode(storage), "login");

const tutors = [
  { public_slug: "joseph-danso", tutor_name: "Joseph Danso", is_published: true },
  { public_slug: "amina-khan", tutor_name: "Amina Khan", is_published: true },
  { public_slug: "sam-reed", tutor_name: "Sam Reed", is_published: true },
  { public_slug: "lee-okonkwo", tutor_name: "Lee Okonkwo", is_published: true },
  { public_slug: "priya-shah", tutor_name: "Priya Shah", is_published: true },
];
const homepage = tutorsForHomepage(tutors);
assert.deepEqual(homepage.map((item) => item.public_slug), ["joseph-danso", "amina-khan", "sam-reed", "lee-okonkwo", "priya-shah"]);
assert.equal(shouldRotateTutorProfiles(tutors), true);
assert.equal(shouldRotateTutorProfiles(homepage.slice(0, 1)), false);
assert.equal(tutorCarouselPageCount(homepage), homepage.length);
assert.equal(tutorCarouselPageIndex(1, homepage.length), 1);
assert.deepEqual(featuredTutorWindow(homepage, 3, 0).map((item) => item.public_slug), ["joseph-danso", "amina-khan", "sam-reed"]);
assert.deepEqual(featuredTutorWindow(homepage, 3, 1).map((item) => item.public_slug), ["amina-khan", "sam-reed", "lee-okonkwo"]);
assert.deepEqual(featuredTutorWindow(homepage, 3, 3).map((item) => item.public_slug), ["lee-okonkwo", "priya-shah", "joseph-danso"]);
assert.deepEqual(featuredTutorWindow(homepage.slice(0, 2), 3, 9).map((item) => item.public_slug), ["joseph-danso", "amina-khan"]);
assert.deepEqual(featuredTutorWindow(homepage, 1, 1).map((item) => item.public_slug), ["amina-khan"]);

const gated = withResourceGate("<html><body><p>worksheet</p></body></html>");
assert.match(gated, /resource-gate\.js/);
assert.equal(withResourceGate(gated), gated);

console.log("platform-access.test.mjs: ok");
