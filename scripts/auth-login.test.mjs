import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authEmailRedirectTo, PRODUCTION_SITE_ORIGIN } from "../src/authRedirect.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientSrc = fs.readFileSync(path.join(root, "src/supabaseClient.js"), "utf8");
const authModalSrc = fs.readFileSync(path.join(root, "src/AuthModal.jsx"), "utf8");

assert.match(clientSrc, /VITE_SUPABASE_URL/);
assert.match(clientSrc, /VITE_SUPABASE_ANON_KEY/);
assert.match(clientSrc, /xugsznxfvpbifpzpuoek\.supabase\.co/);
assert.match(clientSrc, /sb_publishable_/);
assert.doesNotMatch(clientSrc, /SERVICE_ROLE|service_role/);
assert.match(clientSrc, /signInWithPassword|persistSession|detectSessionInUrl/);

assert.match(authModalSrc, /signInWithPassword/);
assert.match(authModalSrc, /resetPasswordForEmail/);
assert.match(authModalSrc, /Forgot password/);
assert.match(authModalSrc, /Invalid login credentials/);

const appSrc = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
assert.match(appSrc, /PASSWORD_RECOVERY/);
assert.match(appSrc, /PasswordRecoveryModal/);
// Must not open the set-password modal merely from ?recovery=1 before a session exists.
assert.doesNotMatch(
  appSrc,
  /params\.get\("recovery"\) === "1"[\s\S]{0,400}setPasswordRecoveryOpen\(true\)/,
);

assert.equal(PRODUCTION_SITE_ORIGIN, "https://www.jdscience.co.uk");
assert.equal(authEmailRedirectTo("https://www.jdscience.co.uk"), "https://www.jdscience.co.uk/?verified=1");
assert.equal(
  authEmailRedirectTo("https://www.jdscience.co.uk", { recovery: true }),
  "https://www.jdscience.co.uk/?recovery=1",
);

console.log("auth-login.test.mjs: ok");
