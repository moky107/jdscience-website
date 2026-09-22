import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createRecoveryLink,
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

// Mock supabase admin generateLink
const fakeLink = "https://xugsznxfvpbifpzpuoek.supabase.co/auth/v1/verify?token=test&type=recovery&redirect_to=https%3A%2F%2Fwww.jdscience.co.uk%2F%3Frecovery%3D1";
const supabaseOk = {
  auth: {
    admin: {
      async generateLink(args) {
        assert.equal(args.type, "recovery");
        assert.equal(args.options.redirectTo, "https://www.jdscience.co.uk/?recovery=1");
        return { data: { properties: { action_link: fakeLink } }, error: null };
      },
    },
  },
};
const linked = await createRecoveryLink(supabaseOk, "someone@example.com");
assert.equal(linked.ok, true);
assert.equal(linked.actionLink, fakeLink);
assert.equal(linked.redirectTo, "https://www.jdscience.co.uk/?recovery=1");

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

console.log("password-recovery.test.mjs: ok");
