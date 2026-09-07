import assert from "node:assert/strict";

/**
 * Minimal browser globals for the analytics client under Node.
 */
function installDom({
  hostname = "www.jdscience.co.uk",
  pathname = "/shop",
  search = "",
  href = "https://www.jdscience.co.uk/shop",
} = {}) {
  const store = new Map();
  const storage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
    clear: () => store.clear(),
  };
  const listeners = new Map();
  const headChildren = [];

  const location = { pathname, search, href, hostname, hash: "" };
  const windowObj = {
    location,
    localStorage: storage,
    sessionStorage: storage,
    dataLayer: undefined,
    gtag: undefined,
    __JD_GA_MEASUREMENT_ID: "",
    addEventListener(type, fn) {
      const list = listeners.get(type) || [];
      list.push(fn);
      listeners.set(type, list);
    },
    removeEventListener(type, fn) {
      const list = listeners.get(type) || [];
      listeners.set(type, list.filter((x) => x !== fn));
    },
    dispatchEvent(evt) {
      for (const fn of listeners.get(evt.type) || []) fn(evt);
      return true;
    },
    history: {
      pushState() {},
      replaceState() {},
    },
  };

  globalThis.window = windowObj;
  globalThis.document = {
    referrer: "",
    title: "JD Science",
    head: {
      appendChild(el) {
        headChildren.push(el);
        return el;
      },
    },
    visibilityState: "visible",
    createElement(tag) {
      return {
        tagName: String(tag).toUpperCase(),
        async: false,
        src: "",
        dataset: {},
        onerror: null,
      };
    },
    querySelector(sel) {
      return headChildren.find((el) => {
        if (!sel.includes("data-jd-ga4")) return false;
        const id = sel.match(/data-jd-ga4="([^"]+)"/)?.[1];
        return id && el.dataset?.jdGa4 === id;
      }) || null;
    },
    querySelectorAll(sel) {
      const one = this.querySelector(sel);
      return one ? [one] : [];
    },
    addEventListener() {},
    removeEventListener() {},
  };
  globalThis.localStorage = storage;
  globalThis.sessionStorage = storage;
  try {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0" },
      configurable: true,
      writable: true,
    });
  } catch {
    /* Node may already expose a read-only navigator */
  }
  globalThis.history = windowObj.history;
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  };

  return {
    headChildren,
    cleanup() {
      delete globalThis.window;
      delete globalThis.document;
      delete globalThis.localStorage;
      delete globalThis.sessionStorage;
      try { delete globalThis.navigator; } catch { /* ignore */ }
      delete globalThis.history;
      delete globalThis.CustomEvent;
      delete globalThis.fetch;
    },
  };
}

async function withAnalytics(domOptions, run) {
  const harness = installDom(domOptions);
  const mod = await import(`../src/analytics.js?t=${Date.now()}-${Math.random()}`);
  mod.__resetAnalyticsForTests();
  try {
    await run(mod, harness);
  } finally {
    mod.__resetAnalyticsForTests();
    harness.cleanup();
  }
}

await withAnalytics({}, async (analytics) => {
  assert.equal(analytics.isLocalOrDevHost("localhost"), true);
  assert.equal(analytics.isLocalOrDevHost("127.0.0.1"), true);
  assert.equal(analytics.isLocalOrDevHost("192.168.1.10"), true);
  assert.equal(analytics.isLocalOrDevHost("www.jdscience.co.uk"), false);
  assert.equal(analytics.isAdminContext("/admin/analytics"), true);
  assert.equal(analytics.isAdminContext("/shop"), false);
});

await withAnalytics({}, async (analytics) => {
  window.__JD_GA_MEASUREMENT_ID = "";
  assert.equal(analytics.getGaMeasurementId(), "");
  assert.equal(analytics.needsAnalyticsConsentPrompt(), false);
  assert.equal(analytics.shouldEnableGa4(), false);
  assert.equal(analytics.ensureGa4(), "");
});

await withAnalytics({ hostname: "www.jdscience.co.uk" }, async (analytics) => {
  window.__JD_GA_MEASUREMENT_ID = "G-TESTMEASURE1";
  assert.equal(analytics.getGaMeasurementId(), "G-TESTMEASURE1");
  assert.equal(analytics.needsAnalyticsConsentPrompt(), true);
  assert.equal(analytics.hasAnalyticsConsent(), false);
  assert.equal(analytics.shouldEnableGa4(), false);
  assert.equal(analytics.ensureGa4(), "", "GA must not load before consent");

  analytics.setAnalyticsConsent("denied");
  assert.equal(analytics.getAnalyticsConsent(), "denied");
  assert.equal(analytics.shouldEnableGa4(), false);
  assert.equal(analytics.ensureGa4(), "");
});

await withAnalytics({ hostname: "www.jdscience.co.uk", pathname: "/shop" }, async (analytics, harness) => {
  window.__JD_GA_MEASUREMENT_ID = "G-TESTMEASURE1";
  analytics.setAnalyticsConsent("granted");
  assert.equal(analytics.hasAnalyticsConsent(), true);
  assert.equal(analytics.shouldEnableGa4(), true);
  assert.equal(analytics.ensureGa4(), "G-TESTMEASURE1");
  assert.equal(analytics.ensureGa4(), "G-TESTMEASURE1");
  assert.ok(harness.headChildren.length <= 1, "must not inject duplicate gtag scripts");
});

await withAnalytics({ hostname: "localhost" }, async (analytics) => {
  window.__JD_GA_MEASUREMENT_ID = "G-TESTMEASURE1";
  analytics.setAnalyticsConsent("granted");
  assert.equal(analytics.shouldEnableGa4(), false, "localhost must never send to GA4");
  assert.equal(analytics.ensureGa4(), "");
});

await withAnalytics({ hostname: "www.jdscience.co.uk", pathname: "/admin" }, async (analytics) => {
  window.__JD_GA_MEASUREMENT_ID = "G-TESTMEASURE1";
  analytics.setAnalyticsConsent("granted");
  assert.equal(analytics.shouldEnableGa4({ pathname: "/admin" }), false);
});

await withAnalytics({
  hostname: "www.jdscience.co.uk",
  pathname: "/",
  href: "https://www.jdscience.co.uk/",
}, async (analytics) => {
  window.__JD_GA_MEASUREMENT_ID = "G-TESTMEASURE1";
  const posts = [];
  globalThis.fetch = async (_url, init) => {
    posts.push(JSON.parse(init.body));
    return { ok: true, status: 200 };
  };

  analytics.setAnalyticsConsent("granted");

  const gaEvents = [];
  const prev = window.gtag;
  window.gtag = function (...args) {
    gaEvents.push(args);
    if (typeof prev === "function") return prev.apply(this, args);
  };

  analytics.trackPageView({ page_path: "/" });
  analytics.trackPageView({ page_path: "/" });
  await Promise.resolve();

  const pageViewPosts = posts.filter((body) => (body.events || [body])[0]?.event_name === "page_view");
  assert.equal(pageViewPosts.length, 1, "duplicate page_view must be suppressed for first-party");

  const gaPageViews = gaEvents.filter((args) => args[0] === "event" && args[1] === "page_view");
  assert.ok(gaPageViews.length <= 1, "GA4 page_view must fire at most once per path");
});

await withAnalytics({ hostname: "www.jdscience.co.uk" }, async (analytics) => {
  window.__JD_GA_MEASUREMENT_ID = "G-TESTMEASURE1";
  analytics.setAnalyticsConsent("granted");

  const gaEvents = [];
  const prev = window.gtag;
  window.gtag = function (...args) {
    gaEvents.push(args);
    if (typeof prev === "function") return prev.apply(this, args);
  };
  globalThis.fetch = async () => ({ ok: true, status: 200 });

  analytics.track(analytics.ANALYTICS_EVENTS.CHECKOUT_STARTED, { product_id: "p1" });
  analytics.track(analytics.ANALYTICS_EVENTS.PURCHASE_COMPLETED, { product_id: "p1" });
  analytics.track(analytics.ANALYTICS_EVENTS.AMAZON_BOOK_CLICK, {
    product_id: "p1",
    metadata: { link_url: "https://www.amazon.co.uk/example" },
  });
  analytics.track(analytics.ANALYTICS_EVENTS.TUTOR_APPLICATION_STARTED);
  analytics.track(analytics.ANALYTICS_EVENTS.TUTOR_APPLICATION_SUBMITTED);
  analytics.track(analytics.ANALYTICS_EVENTS.CONTACT_FORM_SUBMITTED);
  analytics.track(analytics.ANALYTICS_EVENTS.RESOURCE_DOWNLOAD, { resource_id: "r1" });
  analytics.track(analytics.ANALYTICS_EVENTS.PRODUCT_VIEW, { product_id: "p1" });
  await Promise.resolve();

  const names = gaEvents.filter((a) => a[0] === "event").map((a) => a[1]);
  assert.ok(names.includes("begin_checkout"));
  assert.ok(names.includes("purchase"));
  assert.ok(names.includes("outbound_click"));
  assert.ok(names.includes("tutor_application_start"));
  assert.ok(names.includes("tutor_application_submit"));
  assert.ok(names.includes("generate_lead"));
  assert.ok(names.includes("file_download"));
  assert.ok(names.includes("view_item"));

  for (const args of gaEvents) {
    const params = args[2] || {};
    assert.equal(params.email, undefined);
    assert.equal(params.name, undefined);
    assert.equal(params.telephone, undefined);
  }
});

await withAnalytics({}, async (analytics) => {
  window.__JD_GA_MEASUREMENT_ID = "not-a-valid-id";
  assert.equal(analytics.getGaMeasurementId(), "", "invalid measurement IDs are rejected");
});

console.log("analytics-client.test.mjs: ok");
