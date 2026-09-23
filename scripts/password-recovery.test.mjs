import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createRecoveryLink,
  forceRecoveryRedirect,
  pollResendDelivery,
  wantsPasswordRecoveryRequest,
} from "../api/_lib/passwordRecovery.js";

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

// Mock supabase admin generateLink that returns a localhost redirect (misconfigured Site URL)
const fakeToken = "test-token-not-real";
const badLink = `https://xugsznxfvpbifpzpuoek.supabase.co/auth/v1/verify?token=${fakeToken}&type=recovery&redirect_to=http%3A%2F%2Flocalhost%3A3000`;
const supabaseOk = {
  auth: {
    admin: {
      async generateLink(args) {
        assert.equal(args.type, "recovery");
        assert.equal(args.options.redirectTo, "https://www.jdscience.co.uk/?recovery=1");
        return { data: { properties: { action_link: badLink } }, error: null };
      },
    },
  },
};
const linked = await createRecoveryLink(supabaseOk, "someone@example.com");
assert.equal(linked.ok, true);
assert.equal(linked.redirectRewritten, true);
assert.match(linked.actionLink, /redirect_to=https%3A%2F%2Fwww\.jdscience\.co\.uk%2F%3Frecovery%3D1/);
assert.doesNotMatch(linked.actionLink, /localhost/);
assert.equal(linked.redirectTo, "https://www.jdscience.co.uk/?recovery=1");

const forced = forceRecoveryRedirect(badLink);
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

// pollResendDelivery should bail cleanly when GET is forbidden (sending-only key)
const originalFetch = globalThis.fetch;
let getCalls = 0;
globalThis.fetch = async () => {
  getCalls += 1;
  return {
    status: 403,
    ok: false,
    async text() { return "restricted_api_key"; },
    async json() { return { name: "restricted_api_key" }; },
  };
};
const polled = await pollResendDelivery("re_test", "email-id-1", { timeoutMs: 100, intervalMs: 10 });
assert.equal(polled.reason, "retrieve_forbidden");
assert.equal(polled.retrieveStatus, 403);
assert.equal(getCalls, 1);
globalThis.fetch = originalFetch;

const appSrc = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
const modalSrc = fs.readFileSync(path.join(root, "src/AuthModal.jsx"), "utf8");
const clientSrc = fs.readFileSync(path.join(root, "src/passwordRecoveryClient.js"), "utf8");
assert.match(appSrc, /requestPasswordRecoveryEmail/);
assert.match(modalSrc, /requestPasswordRecoveryEmail/);
assert.match(clientSrc, /\/api\/password-recovery/);
assert.doesNotMatch(appSrc, /resetPasswordForEmail/);
assert.doesNotMatch(modalSrc, /resetPasswordForEmail/);

const vercel = fs.readFileSync(path.join(root, "vercel.json"), "utf8");
assert.match(vercel, /password-recovery/);

const recoverySrc = fs.readFileSync(path.join(root, "api/_lib/passwordRecovery.js"), "utf8");
assert.match(recoverySrc, /pollResendDelivery/);
assert.match(recoverySrc, /forceRecoveryRedirect/);
assert.match(recoverySrc, /lastEvent/);
assert.match(recoverySrc, /fromHost/);

console.log("password-recovery.test.mjs: ok");
