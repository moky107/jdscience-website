import assert from "node:assert/strict";
import { featuredTutorWindow, shouldRotateTutorProfiles, tutorsForHomepage } from "../src/tutorRotation.js";
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
  { public_slug: "joseph-danso", tutor_name: "Joseph Danso" },
  { public_slug: "amina-khan", tutor_name: "Amina Khan" },
  { public_slug: "sam-reed", tutor_name: "Sam Reed" },
  { public_slug: "lee-okonkwo", tutor_name: "Lee Okonkwo" },
  { public_slug: "priya-shah", tutor_name: "Priya Shah" },
];
const homepage = tutorsForHomepage(tutors);
assert.deepEqual(homepage.map((item) => item.public_slug), ["amina-khan", "sam-reed", "lee-okonkwo", "priya-shah"]);
assert.equal(shouldRotateTutorProfiles(tutors, 3), true);
assert.equal(shouldRotateTutorProfiles(homepage.slice(0, 3), 3), false);
assert.deepEqual(featuredTutorWindow(homepage, 3, 0).map((item) => item.public_slug), ["amina-khan", "sam-reed", "lee-okonkwo"]);
assert.deepEqual(featuredTutorWindow(homepage, 3, 1).map((item) => item.public_slug), ["sam-reed", "lee-okonkwo", "priya-shah"]);
assert.deepEqual(featuredTutorWindow(homepage, 3, 3).map((item) => item.public_slug), ["priya-shah", "amina-khan", "sam-reed"]);
assert.deepEqual(featuredTutorWindow(homepage.slice(0, 2), 3, 9).map((item) => item.public_slug), ["amina-khan", "sam-reed"]);

const gated = withResourceGate("<html><body><p>worksheet</p></body></html>");
assert.match(gated, /resource-gate\.js/);
assert.equal(withResourceGate(gated), gated);

console.log("platform-access.test.mjs: ok");
