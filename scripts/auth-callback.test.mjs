import assert from "node:assert/strict";
import {
  AUTH_CALLBACK_PATH,
  PRODUCTION_SITE_ORIGIN,
  authEmailRedirectTo,
  describeAuthCallbackError,
  isAuthCallbackPath,
} from "../src/authRedirect.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(AUTH_CALLBACK_PATH, "/auth/callback");
assert.equal(PRODUCTION_SITE_ORIGIN, "https://www.jdscience.co.uk");
assert.equal(authEmailRedirectTo("https://www.jdscience.co.uk"), "https://www.jdscience.co.uk/auth/callback");
assert.equal(authEmailRedirectTo("https://www.jdscience.co.uk/"), "https://www.jdscience.co.uk/auth/callback");
assert.equal(authEmailRedirectTo("http://localhost:5173"), "http://localhost:5173/auth/callback");
assert.equal(isAuthCallbackPath("/auth/callback"), true);
assert.equal(isAuthCallbackPath("/auth/callback/"), true);
assert.equal(isAuthCallbackPath("/papers"), false);

const expired = describeAuthCallbackError(new URLSearchParams("error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired"));
assert.match(expired, /expired|no longer valid/i);

const authModal = fs.readFileSync(path.join(root, "src", "AuthModal.jsx"), "utf8");
assert.match(authModal, /authEmailRedirectTo\(\)/);
assert.match(authModal, /signUp\(/);
assert.match(authModal, /resend\(/);
assert.doesNotMatch(authModal, /\?verified=1/);

const callbackPage = fs.readFileSync(path.join(root, "src", "AuthCallbackPage.jsx"), "utf8");
assert.match(callbackPage, /exchangeCodeForSession/);
assert.match(callbackPage, /Your email address has been verified/);
assert.match(callbackPage, /Resend verification email/);

const client = fs.readFileSync(path.join(root, "src", "supabaseClient.js"), "utf8");
assert.match(client, /flowType:\s*"pkce"/);
assert.match(client, /VITE_SUPABASE_ANON_KEY/);
assert.match(client, /service_role/i);
assert.doesNotMatch(client, /createClient\([^)]*SERVICE_ROLE/);
assert.doesNotMatch(client, /import\.meta\.env\.SUPABASE_SERVICE_ROLE_KEY/);

const seo = fs.readFileSync(path.join(root, "src", "seo.js"), "utf8");
assert.match(seo, /auth\/callback/);
assert.match(seo, /auth-callback/);

const vercel = fs.readFileSync(path.join(root, "vercel.json"), "utf8");
assert.match(vercel, /auth\/callback/);

const app = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
assert.match(app, /AuthCallbackPage/);
assert.doesNotMatch(app, /ResourceAccessGate/);
assert.doesNotMatch(app, /resourceLibraryLocked/);

console.log("auth-callback.test.mjs: ok");
