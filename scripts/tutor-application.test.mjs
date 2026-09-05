import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isTutorApplicationSpam, TUTOR_HONEYPOT_FIELDS } from "../api/_lib/tutors.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.ok(TUTOR_HONEYPOT_FIELDS.includes("jd_bot_check"));
assert.equal(isTutorApplicationSpam({}), false);
assert.equal(isTutorApplicationSpam({ jd_bot_check: "" }), false);
assert.equal(isTutorApplicationSpam({ jd_bot_check: "   " }), false);
assert.equal(isTutorApplicationSpam({ company: "Acme Tutoring Ltd" }), false, "legacy company autofill must not drop real applications");
assert.equal(isTutorApplicationSpam({ jd_bot_check: "http://spam.example" }), true);
assert.equal(isTutorApplicationSpam({ website_url_confirm: "bot" }), true);

const api = fs.readFileSync(path.join(root, "api", "create-tutor-application.js"), "utf8");
assert.match(api, /isTutorApplicationSpam/);
assert.match(api, /notification_sent/);
assert.doesNotMatch(api, /const company = safeTrim\(body\.company/);
assert.doesNotMatch(api, /if \(company\)/);

const app = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
assert.match(app, /jd_bot_check/);
assert.match(app, /autoComplete="new-password"/);
assert.match(app, /emptyTutorApplicationForm/);
assert.match(app, /noValidate/);
assert.match(app, /clearFieldError/);
assert.match(app, /disabled=\{saving\}/);
assert.doesNotMatch(app, /disabled=\{saving \|\| !form\.accept_terms\}/);
assert.doesNotMatch(app, /jd_bot_check[\s\S]{0,200}Company/);
assert.match(app, /name="jd_bot_check"/);

console.log("tutor-application.test.mjs: ok");
