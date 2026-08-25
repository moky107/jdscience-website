export const HAS_ACCOUNT_KEY = "jd_has_account";
export const SIGNED_IN_COOKIE = "jd_signed_in";
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

export function syncSignedInCookie(signedIn) {
  if (typeof document === "undefined") return;
  try {
    document.cookie = signedIn
      ? `${SIGNED_IN_COOKIE}=1; path=/; max-age=2592000; SameSite=Lax`
      : `${SIGNED_IN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}
