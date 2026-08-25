export const HAS_ACCOUNT_KEY = "jd_has_account";
export const RESOURCE_LIBRARY_PAGES = ["papers", "resources"];

export function isResourceLibraryPage(page) {
  return RESOURCE_LIBRARY_PAGES.includes(page);
}

export function preferredVisitorAuthMode(storage) {
  try {
    const store = storage || (typeof localStorage === "undefined" ? null : localStorage);
    return store?.getItem(HAS_ACCOUNT_KEY) === "1" ? "login" : "register";
  } catch {
    return "register";
  }
}

export function markHasAccount(storage) {
  try {
    const store = storage || (typeof localStorage === "undefined" ? null : localStorage);
    store?.setItem(HAS_ACCOUNT_KEY, "1");
  } catch {
    /* ignore */
  }
}
