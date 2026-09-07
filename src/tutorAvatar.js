export const LOCAL_AVATAR_FALLBACK = "/avatar-fallback.svg";

/**
 * Resolve the image `src` for a tutor avatar, falling back to the local
 * placeholder once when the remote photo fails (avoids infinite onError loops).
 */
export function resolveTutorAvatarSrc(photoUrl, { failed = false } = {}) {
  if (failed) return LOCAL_AVATAR_FALLBACK;
  const url = String(photoUrl || "").trim();
  if (!url) return LOCAL_AVATAR_FALLBACK;
  if (url === LOCAL_AVATAR_FALLBACK) return LOCAL_AVATAR_FALLBACK;
  return url;
}

export function shouldUseAvatarImage(photoUrl, failed = false) {
  if (failed) return true; // still render local fallback image
  return Boolean(String(photoUrl || "").trim());
}
