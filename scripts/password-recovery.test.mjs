import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSiteRecoveryLink,
  createRecoveryLink,
  escapeHtmlAttr,
  wantsPasswordRecoveryRequest,
} from "../api/_lib/passwordRecovery.js";
import {
  bootstrapPasswordRecovery,
  inspectRecoveryUrl,
} from "../src/passwordRecoverySession.js";
import { PASSWORD_RESET_PATH, PASSWORD_RESET_URL, isPasswordResetPath } from "../src/authRedirect.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(PASSWORD_RESET_PATH, "/reset-password");
assert.equal(PASSWORD_RESET_URL, "https://www.jdscience.co.uk/reset-password");
assert.equal(isPasswordResetPath("/reset-password"), true);
assert.equal(isPasswordResetPath("/reset-password/"), true);
assert.equal(isPasswordResetPath("/admin"), false);

assert.equal(wantsPasswordRecoveryRequest({ url: "/api/password-recovery", query: {} }), true);

const fakeHash = "c".repeat(56);
const siteLink = buildSiteRecoveryLink(fakeHash);
const siteUrl = new URL(siteLink);
assert.equal(siteUrl.host, "www.jdscience.co.uk");
assert.equal(siteUrl.pathname, "/reset-password");
assert.equal(siteUrl.searchParams.get("type"), "recovery");
assert.equal(siteUrl.searchParams.get("token_hash"), fakeHash);
assert.doesNotMatch(siteLink, /localhost/);
assert.doesNotMatch(siteLink, /supabase\.co\/auth/);

// Email HTML must escape & so clients keep type + token_hash
const escaped = escapeHtmlAttr(siteLink);
assert.match(escaped, /\?type=recovery&amp;token_hash=/);
assert.doesNotMatch(escaped, /token_hash=[^"&]*&type=/);
const html = `<a href="${escaped}">Choose a new password</a>`;
const hrefAttr = html.match(/href="([^"]+)"/)[1];
assert.equal(hrefAttr.includes("&amp;"), true);
// Browser/email decode of entities restores the real URL
const decoded = hrefAttr.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
assert.equal(decoded, siteLink);

const supabaseOk = {
  auth: {
    admin: {
      async generateLink(args) {
        assert.equal(args.type, "recovery");
        assert.equal(args.options.redirectTo, PASSWORD_RESET_URL);
        return {
          data: {
            properties: {
              hashed_token: fakeHash,
              redirect_to: PASSWORD_RESET_URL,
              action_link: "https://xugsznxfvpbifpzpuoek.supabase.co/auth/v1/verify?token=x&type=recovery",
            },
          },
          error: null,
        };
      },
    },
  },
};
const linked = await createRecoveryLink(supabaseOk, "admin@example.com");
assert.equal(linked.ok, true);
assert.equal(linked.linkStrategy, "site_token_hash");
assert.equal(linked.linkHost, "www.jdscience.co.uk");
assert.equal(new URL(linked.actionLink).pathname, "/reset-password");

// Inspect reset-password URL
const info = inspectRecoveryUrl(siteLink);
assert.equal(info.isResetPasswordPath, true);
assert.equal(info.hasTokenHash, true);
assert.equal(info.hasRecoveryFlag, true);

// Cold-start bootstrap on /reset-password token_hash
const verifyCalls = [];
const fakeClient = {
  auth: {
    async verifyOtp(args) {
      verifyCalls.push(args.type);
      return { data: { session: { user: { email: "a@b.c" } } }, error: null };
    },
  },
};
const boot = await bootstrapPasswordRecovery(fakeClient, siteLink);
assert.equal(boot.showModal, true);
assert.equal(boot.reason, "verify_otp");
assert.deepEqual(verifyCalls, ["recovery"]);

// Broken email link simulation: only ?recovery=1 left (ampersand mangling) → error, not login success
const broken = await bootstrapPasswordRecovery(
  {
    auth: {
      async initialize() {},
      async getSession() {
        return { data: { session: null } };
      },
    },
  },
  "https://www.jdscience.co.uk/?recovery=1",
);
assert.equal(broken.showModal, false);
assert.match(broken.errorMessage || "", /invalid|expired/i);

// Source wiring
const appSrc = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
const vercel = fs.readFileSync(path.join(root, "vercel.json"), "utf8");
const resetSrc = fs.readFileSync(path.join(root, "src/ResetPasswordPage.jsx"), "utf8");
const recoveryApi = fs.readFileSync(path.join(root, "api/_lib/passwordRecovery.js"), "utf8");
assert.match(appSrc, /ResetPasswordPage/);
assert.match(appSrc, /isPasswordResetPath/);
assert.match(vercel, /reset-password/);
assert.match(resetSrc, /Choose a new password/);
assert.match(resetSrc, /Update password/);
assert.match(resetSrc, /updateUser/);
assert.match(resetSrc, /signOut/);
assert.match(resetSrc, /\/admin/);
assert.match(recoveryApi, /escapeHtmlAttr/);
assert.match(recoveryApi, /PASSWORD_RESET_URL|reset-password/);
assert.doesNotMatch(appSrc, /resetPasswordForEmail/);

console.log("password-recovery.test.mjs: ok");
