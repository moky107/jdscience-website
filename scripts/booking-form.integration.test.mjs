/**
 * Integration test: render the real BookingForm, select each visible level,
 * and assert the expected subjects appear. Mapping-only tests are not enough.
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

async function ensureDep(name, version) {
  try {
    return require(name);
  } catch {
    const { execSync } = await import("node:child_process");
    execSync(`npm install --no-save --no-package-lock --legacy-peer-deps ${name}@${version}`, {
      cwd: root,
      stdio: "inherit",
    });
    return require(name);
  }
}

const { JSDOM } = await ensureDep("jsdom", "24");
const esbuild = await ensureDep("esbuild", "0.28.2");

const EXPECTED = {
  "GCSE/IGCSE": ["Biology", "Chemistry", "Physics"],
  "A-Level": ["Biology", "Chemistry", "Physics"],
  BTEC: ["Applied Science", "Biology", "Chemistry", "Physics"],
  "T-Level": ["Health", "Healthcare Science", "Laboratory Sciences", "Science"],
};

const EXPECTED_LABELS = [
  "GCSE/IGCSE",
  "A-Level",
  "BTEC",
  "T-Level",
];

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
    url: "http://localhost/#book-anchor",
    pretendToBeVisual: true,
  });
  const { window } = dom;
  Object.defineProperty(globalThis, "window", { configurable: true, writable: true, value: window });
  Object.defineProperty(globalThis, "document", { configurable: true, writable: true, value: window.document });
  Object.defineProperty(globalThis, "HTMLElement", { configurable: true, writable: true, value: window.HTMLElement });
  Object.defineProperty(globalThis, "Node", { configurable: true, writable: true, value: window.Node });
  Object.defineProperty(globalThis, "MutationObserver", {
    configurable: true,
    writable: true,
    value: window.MutationObserver,
  });
  // React 19 act() checks.
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
  window.matchMedia = (query) => ({
    matches: String(query).includes("max-width"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
  return dom;
}

async function flush(ms = 0) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function optionLabels(select) {
  return Array.from(select.options).map((opt) => opt.textContent.trim());
}

function optionValues(select) {
  return Array.from(select.options).map((opt) => opt.value);
}

const outDir = path.join(root, ".tmp-booking-form-it");
mkdirSync(outDir, { recursive: true });
const outfile = path.join(outDir, "BookingForm.bundle.mjs");

try {
  const result = await esbuild.build({
    absWorkingDir: root,
    entryPoints: [path.join(root, "src/BookingForm.jsx")],
    outfile,
    bundle: true,
    platform: "browser",
    format: "esm",
    jsx: "automatic",
    loader: { ".js": "jsx", ".jsx": "jsx" },
    external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client", "react/jsx-dev-runtime"],
    plugins: [
      {
        name: "stub-supabase-client",
        setup(build) {
          build.onResolve({ filter: /(^|\/)supabaseClient(\.js)?$/ }, () => ({
            path: path.join(root, "scripts/stubs/supabaseClient.stub.js"),
          }));
        },
      },
    ],
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://example.supabase.co"),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify("test-anon-key"),
      "process.env.NODE_ENV": '"test"',
    },
    write: true,
  });
  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.text).join("\n"));
  }

  const dom = installDom();
  globalThis.process = globalThis.process || { env: { NODE_ENV: "test" } };

  const ReactModule = await import("react");
  const React = ReactModule.default ?? ReactModule;
  const { createRoot } = await import("react-dom/client");
  const { act } = ReactModule;
  const { default: BookingForm } = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);

  const legacyServices = [
    { id: 1, level: "GCSE/IGCSE", price_per_hour: 35, package_price_10: 300 },
    { id: 2, level: "A-Level/T-Level/BTEC", price_per_hour: 45, package_price_10: 400 },
  ];

  const mount = document.getElementById("root");
  const rootNode = createRoot(mount);

  await act(async () => {
    rootNode.render(
      React.createElement(BookingForm, {
        initialMobile: true,
        loadServices: async () => legacyServices,
      })
    );
    await flush(50);
  });

  const levelSelect = document.querySelector('[data-testid="booking-level"]');
  const subjectSelect = document.querySelector('[data-testid="booking-subject"]');
  assert.ok(levelSelect, "booking level select must render");
  assert.ok(subjectSelect, "booking subject select must render");

  assert.deepEqual(optionLabels(levelSelect), EXPECTED_LABELS);
  assert.deepEqual(optionValues(levelSelect), Object.keys(EXPECTED));
  assert.equal(
    optionLabels(levelSelect).includes("A-Level/T-Level/BTEC"),
    false,
    "legacy combined tutoring_services label must not appear in the level dropdown"
  );

  for (const [level, subjects] of Object.entries(EXPECTED)) {
    await act(async () => {
      // Prefer React-friendly change simulation.
      const proto = Object.getPrototypeOf(levelSelect);
      const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
      descriptor.set.call(levelSelect, level);
      levelSelect.dispatchEvent(new window.Event("change", { bubbles: true }));
      await flush(40);
    });

    const refreshedSubject = document.querySelector('[data-testid="booking-subject"]');
    assert.equal(refreshedSubject.value, "", `${level} must reset subject`);
    const labels = optionLabels(refreshedSubject);
    assert.equal(labels[0], "Select a subject");
    assert.deepEqual(
      labels.slice(1),
      subjects,
      `${level} must show subjects ${subjects.join(", ")}`
    );
    assert.equal(labels.includes("No Options"), false);

    // Select the first real subject and confirm the controlled value sticks
    // (mirrors the live form path used before API validation).
    const chosen = subjects[0];
    await act(async () => {
      const proto = Object.getPrototypeOf(refreshedSubject);
      const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
      descriptor.set.call(refreshedSubject, chosen);
      refreshedSubject.dispatchEvent(new window.Event("change", { bubbles: true }));
      await flush(40);
    });
    assert.equal(
      document.querySelector('[data-testid="booking-subject"]').value,
      chosen,
      `${level} must accept subject ${chosen}`
    );
  }

  // Changing level after a subject was chosen must clear the previous subject.
  await act(async () => {
    const proto = Object.getPrototypeOf(levelSelect);
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    descriptor.set.call(levelSelect, "BTEC");
    levelSelect.dispatchEvent(new window.Event("change", { bubbles: true }));
    await flush(40);
  });
  assert.equal(document.querySelector('[data-testid="booking-subject"]').value, "");
  await act(async () => {
    const proto = Object.getPrototypeOf(levelSelect);
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    descriptor.set.call(levelSelect, "A-Level");
    levelSelect.dispatchEvent(new window.Event("change", { bubbles: true }));
    await flush(40);
  });
  assert.equal(document.querySelector('[data-testid="booking-subject"]').value, "");
  assert.deepEqual(
    optionLabels(document.querySelector('[data-testid="booking-subject"]')).slice(1),
    EXPECTED["A-Level"]
  );

  assert.ok(document.querySelector('[data-testid="booking-form"]'), "booking form root present");
  assert.ok(
    document.body.innerHTML.includes("Book a Tutoring Session"),
    "live booking heading must render"
  );
  assert.equal(window.location.hash, "#book-anchor");

  rootNode.unmount();
  dom.window.close();
  console.log("booking-form.integration.test.mjs: ok");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
