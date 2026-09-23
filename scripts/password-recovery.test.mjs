import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSiteRecoveryLink,
  createRecoveryLink,
  forceRecoveryRedirect,
  wantsPasswordRecoveryRequest,
} from "../api/_lib/passwordRecovery.js";
import { consumePasswordRecoveryFromUrl } from "../src/passwordRecoverySession.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(
  wantsPasswordRecoveryRequest({ url: "/api/password-recovery", query: {} }),
  true,
);
assert.equal(
  wantsPasswordRecoveryRequest({ url: "/api/education-posts?kind=password-recovery", query: { kind: "password-recovery" } }),
  true,
);
assert.equal(
  wantsPasswordRecoveryRequest({ url: "/api/shop-products", query: {} }),
  false,
);

const fakeHash = "a".repeat(56);
const siteLink = buildSiteRecoveryLink(fakeHash);
const siteUrl = new URL(siteLink);
assert.equal(siteUrl.host, "www.jdscience.co.uk");
assert.equal(siteUrl.protocol, "https:");
assert.equal(siteUrl.searchParams.get("recovery"), "1");
assert.equal(siteUrl.searchParams.get("type"), "recovery");
assert.equal(siteUrl.searchParams.get("token_hash"), fakeHash);
assert.doesNotMatch(siteLink, /localhost/);
assert.doesNotMatch(siteLink, /supabase\.co/);

// Mock generateLink — returns localhost action_link (misconfigured Site URL) + hashed_token
const badActionLink = `https://xugsznxfvpbifpzpuoek.supabase.co/auth/v1/verify?token=test&type=recovery&redirect_to=http%3A%2F%2Flocalhost%3A3000`;
const supabaseOk = {
  auth: {
    admin: {
      async generateLink(args) {
        assert.equal(args.type, "recovery");
        assert.equal(args.options.redirectTo, "https://www.jdscience.co.uk/?recovery=1");
        return {
          data: {
            properties: {
              action_link: badActionLink,
              hashed_token: fakeHash,
              redirect_to: "http://localhost:3000",
              verification_type: "recovery",
            },
          },
          error: null,
        };
      },
    },
  },
};
const linked = await createRecoveryLink(supabaseOk, "someone@example.com");
assert.equal(linked.ok, true);
assert.equal(linked.linkStrategy, "site_token_hash");
assert.equal(linked.linkHost, "www.jdscience.co.uk");
assert.equal(linked.gotrueRedirectHost, "localhost:3000");
assert.match(linked.actionLink, /^https:\/\/www\.jdscience\.co\.uk\/\?/);
assert.match(linked.actionLink, /token_hash=/);
assert.doesNotMatch(linked.actionLink, /localhost/);
assert.doesNotMatch(linked.actionLink, /supabase\.co\/auth/);

// Email HTML must use the full site link as href without truncation / entity mangling
function recoveryEmailHtml(actionLink) {
  const safeLink = String(actionLink || "").replace(/"/g, "&quot;");
  return `<a href="${safeLink}">Choose a new password</a>`;
}
const html = recoveryEmailHtml(linked.actionLink);
const hrefMatch = html.match(/href="([^"]+)"/);
assert.ok(hrefMatch);
assert.equal(hrefMatch[1], linked.actionLink);
assert.equal(hrefMatch[1].includes("&amp;"), false);

const forced = forceRecoveryRedirect(badActionLink);
assert.equal(forced.redirectRewritten, true);
assert.equal(forced.originalRedirect, "http://localhost:3000");

const supabaseFail = {
  auth: {
    admin: {
      async generateLink() {
        return { data: null, error: { message: "User not found", status: 404, code: "user_not_found" } };
      },
    },
  },
};
const missing = await createRecoveryLink(supabaseFail, "missing@example.com");
assert.equal(missing.ok, false);

// Client consumePasswordRecoveryFromUrl
const calls = [];
const fakeSupabase = {
  auth: {
    async verifyOtp(args) {
      calls.push(args);
      return { data: { session: { user: { email: "x@y.z" } } }, error: null };
    },
  },
};
const consumed = await consumePasswordRecoveryFromUrl(
  fakeSupabase,
  `https://www.jdscience.co.uk/?recovery=1&type=recovery&token_hash=${fakeHash}`,
);
assert.equal(consumed.handled, true);
assert.equal(consumed.ok, true);
assert.equal(calls.length, 1);
assert.equal(calls[0].type, "recovery");
assert.equal(calls[0].token_hash, fakeHash);

const skipped = await consumePasswordRecoveryFromUrl(
  fakeSupabase,
  "https://www.jdscience.co.uk/?recovery=1",
);
assert.equal(skipped.handled, false);
assert.equal(skipped.awaitingHashSession, true);

const appSrc = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
const modalSrc = fs.readFileSync(path.join(root, "src/AuthModal.jsx"), "utf8");
const clientSrc = fs.readFileSync(path.join(root, "src/passwordRecoveryClient.js"), "utf8");
const sessionSrc = fs.readFileSync(path.join(root, "src/passwordRecoverySession.js"), "utf8");
assert.match(appSrc, /requestPasswordRecoveryEmail/);
assert.match(appSrc, /consumePasswordRecoveryFromUrl/);
assert.match(modalSrc, /requestPasswordRecoveryEmail/);
assert.match(clientSrc, /\/api\/password-recovery/);
assert.match(sessionSrc, /verifyOtp/);
assert.doesNotMatch(appSrc, /resetPasswordForEmail/);
assert.doesNotMatch(modalSrc, /resetPasswordForEmail/);

const vercel = fs.readFileSync(path.join(root, "vercel.json"), "utf8");
assert.match(vercel, /password-recovery/);

const recoverySrc = fs.readFileSync(path.join(root, "api/_lib/passwordRecovery.js"), "utf8");
assert.match(recoverySrc, /buildSiteRecoveryLink/);
assert.match(recoverySrc, /site_token_hash/);
assert.match(recoverySrc, /hashed_token/);

console.log("password-recovery.test.mjs: ok");
