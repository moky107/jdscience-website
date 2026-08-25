import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT_TAG = '<script src="/resource-gate.js" defer></script>';

export function withResourceGate(html) {
  if (html.includes("resource-gate.js")) return html;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `  ${SCRIPT_TAG}\n</body>`);
  }
  return `${html.trimEnd()}\n${SCRIPT_TAG}\n`;
}

function walkHtml(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

export function injectResourceGate(worksheetsDir = path.join(root, "public", "worksheets")) {
  let changed = 0;
  for (const file of walkHtml(worksheetsDir)) {
    const before = fs.readFileSync(file, "utf8");
    const after = withResourceGate(before);
    if (after !== before) {
      fs.writeFileSync(file, after);
      changed += 1;
    }
  }
  return changed;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const changed = injectResourceGate();
  console.log(`Injected resource gate into ${changed} worksheet pages.`);
}
