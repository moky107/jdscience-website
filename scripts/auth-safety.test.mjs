import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FORBIDDEN_SCRIPT_AUTH_PATTERNS,
  PROTECTED_PRODUCTION_AUTH_EMAILS,
  assertAllowedAuthMutation,
  isProtectedProductionAuthEmail,
} from "./authSafety.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(isProtectedProductionAuthEmail("jd943791@gmail.com"), true);
assert.equal(isProtectedProductionAuthEmail("JD943791@Gmail.com"), true);
assert.equal(isProtectedProductionAuthEmail("visitor@example.com"), false);

assert.throws(
  () => assertAllowedAuthMutation("jd943791@gmail.com", { action: "update password" }),
  /protected production account/i,
);
assert.doesNotThrow(() => assertAllowedAuthMutation("e2e-shop-tester@example.com", { action: "update password" }));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(mjs|js|jsx|ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const scriptFiles = walk(path.join(root, "scripts")).filter((file) => {
  const base = path.basename(file);
  return base !== "authSafety.mjs" && base !== "auth-safety.test.mjs";
});
const violations = [];
for (const file of scriptFiles) {
  const src = fs.readFileSync(file, "utf8");
  for (const pattern of FORBIDDEN_SCRIPT_AUTH_PATTERNS) {
    if (pattern.test(src)) {
      violations.push(`${path.relative(root, file)} matches ${pattern}`);
    }
  }
  // Hard-coded production admin email + password mutation wording in scripts is banned.
  if (/auth\.admin\.(updateUserById|createUser|deleteUser|generateLink)/.test(src) && /jd943791@gmail\.com/i.test(src)) {
    violations.push(`${path.relative(root, file)} references protected admin email with Auth admin mutation API`);
  }
}

assert.deepEqual(violations, [], violations.join("\n") || "ok");
assert.ok(PROTECTED_PRODUCTION_AUTH_EMAILS.length >= 1);

console.log("auth-safety.test.mjs: ok");
