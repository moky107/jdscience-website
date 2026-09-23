import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSiteRecoveryLink,
  createRecoveryLink,
  wantsPasswordRecoveryRequest,
} from "../api/_lib/passwordRecovery.js";
import {
  bootstrapPasswordRecovery,
  inspectRecoveryUrl,
  attachEarlyPasswordRecoveryListener,
  consumeEarlyPasswordRecoveryFlag,
  peekEarlyPasswordRecoveryFlag,
} from "../src/passwordRecoverySession.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(wantsPasswordRecoveryRequest({ url: "/api/password-recovery", query: {} }), true);

const fakeHash = "b".repeat(56);
const siteLink = buildSiteRecoveryLink(fakeHash);
const siteUrl = new URL(siteLink);
assert.equal(siteUrl.host, "www.jdscience.co.uk");
assert.equal(siteUrl.searchParams.get("recovery"), "1");
assert.equal(siteUrl.searchParams.get("type"), "recovery");
assert.equal(siteUrl.searchParams.get("token_hash"), fakeHash);

const supabaseOk = {
  auth: {
    admin: {
      async generateLink(args) {
        assert.equal(args.type, "recovery");
        return {
          data: {
            properties: {
              hashed_token: fakeHash,
              redirect_to: "https://www.jdscience.co.uk/?recovery=1",
              action_link: "https://xugsznxfvpbifpzpuoek.supabase.co/auth/v1/verify?token=x&type=recovery&redirect_to=https%3A%2F%2Fwww.jdscience.co.uk%2F%3Frecovery%3D1",
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
assert.doesNotMatch(linked.actionLink, /supabase\.co\/auth/);

// --- URL inspection (no secrets logged) ---
const hashHref = "https://www.jdscience.co.uk/?recovery=1#access_token=redacted&expires_in=3600&refresh_token=redacted&token_type=bearer&type=recovery";
const hashInfo = inspectRecoveryUrl(hashHref);
assert.equal(hashInfo.hasRecoveryFlag, true);
assert.equal(hashInfo.hasTokenHash, false);
assert.equal(hashInfo.hasHashAccessToken, true);
assert.equal(hashInfo.hashType, "recovery");

const tokenHref = `https://www.jdscience.co.uk/?recovery=1&type=recovery&token_hash=${fakeHash}`;
const tokenInfo = inspectRecoveryUrl(tokenHref);
assert.equal(tokenInfo.hasTokenHash, true);
assert.equal(tokenInfo.hashType, "recovery");

// --- Cold-start: token_hash path opens modal without relying on PASSWORD_RECOVERY event ---
const verifyCalls = [];
const fakeClientToken = {
  auth: {
    async verifyOtp(args) {
      verifyCalls.push({ type: args.type, hasToken: Boolean(args.token_hash) });
      return { data: { session: { user: { email: "a@b.c" } } }, error: null };
    },
    async getSession() {
      return { data: { session: null } };
    },
    async initialize() {},
  },
};
const bootToken = await bootstrapPasswordRecovery(fakeClientToken, tokenHref);
assert.equal(bootToken.showModal, true);
assert.equal(bootToken.reason, "verify_otp");
assert.equal(verifyCalls.length, 1);
assert.equal(verifyCalls[0].type, "recovery");

// --- Cold-start: hash redirect already established session before React mounts ---
const fakeClientHash = {
  auth: {
    async initialize() {},
    async getSession() {
      return { data: { session: { user: { email: "a@b.c" } } } };
    },
    async verifyOtp() {
      throw new Error("should not verifyOtp for hash-only URL");
    },
  },
};
const bootHash = await bootstrapPasswordRecovery(fakeClientHash, hashHref);
assert.equal(bootHash.showModal, true);
assert.equal(bootHash.reason, "existing_recovery_session");

// --- Cold-start: early PASSWORD_RECOVERY flag alone with session ---
attachEarlyPasswordRecoveryListener({
  auth: {
    onAuthStateChange(cb) {
      // Simulate event that fired before React
      cb("PASSWORD_RECOVERY", { user: { email: "a@b.c" } });
      return { data: { subscription: { unsubscribe() {} } } };
    },
  },
});
assert.equal(peekEarlyPasswordRecoveryFlag(), true);
const fakeClientEarly = {
  auth: {
    async initialize() {},
    async getSession() {
      return { data: { session: { user: { email: "a@b.c" } } } };
    },
  },
};
const bootEarly = await bootstrapPasswordRecovery(
  fakeClientEarly,
  "https://www.jdscience.co.uk/?recovery=1",
);
assert.equal(bootEarly.showModal, true);
consumeEarlyPasswordRecoveryFlag();

// --- Expired / error hash ---
const errHref = "https://www.jdscience.co.uk/?recovery=1#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired";
const bootErr = await bootstrapPasswordRecovery(fakeClientHash, errHref);
assert.equal(bootErr.showModal, false);
assert.match(bootErr.errorMessage || "", /invalid|expired/i);

// --- PKCE code path ---
const pkceCalls = [];
const fakePkce = {
  auth: {
    async exchangeCodeForSession(code) {
      pkceCalls.push(Boolean(code));
      return { data: { session: { user: { email: "a@b.c" } } }, error: null };
    },
  },
};
const bootPkce = await bootstrapPasswordRecovery(
  fakePkce,
  "https://www.jdscience.co.uk/?recovery=1&code=pkce-test-code",
);
assert.equal(bootPkce.showModal, true);
assert.equal(bootPkce.reason, "pkce");
assert.equal(pkceCalls.length, 1);

// Source wiring
const appSrc = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
const sessionSrc = fs.readFileSync(path.join(root, "src/passwordRecoverySession.js"), "utf8");
const clientSrc = fs.readFileSync(path.join(root, "src/supabaseClient.js"), "utf8");
const modalSrc = fs.readFileSync(path.join(root, "src/PasswordRecoveryModal.jsx"), "utf8");
assert.match(appSrc, /bootstrapPasswordRecovery/);
assert.match(appSrc, /consumeEarlyPasswordRecoveryFlag/);
assert.match(appSrc, /onEarlyPasswordRecovery/);
assert.match(clientSrc, /attachEarlyPasswordRecoveryListener/);
assert.match(sessionSrc, /PASSWORD_RECOVERY/);
assert.match(modalSrc, /updateUser\(\{\s*password/);
assert.match(modalSrc, /signOut/);
assert.match(modalSrc, /\/admin/);
assert.match(modalSrc, /Update password/);
assert.doesNotMatch(appSrc, /resetPasswordForEmail/);

console.log("password-recovery.test.mjs: ok");
