import assert from "node:assert/strict";
import {
  homepageVideoElementProps,
  homepageVideoSourceProps,
  INTRO_VIDEO_POSTER,
  INTRO_VIDEO_SRC,
  INTRO_VIDEO_TYPE,
} from "../src/homepageVideo.js";
import {
  LOCAL_AVATAR_FALLBACK,
  resolveTutorAvatarSrc,
  shouldUseAvatarImage,
} from "../src/tutorAvatar.js";
import {
  buildTutorPhotoApiUrl,
  isPublishedTutorRow,
  mimeTypeForTutorPath,
  normalizeTutorStoragePath,
  PROFILE_PHOTO_SIGNED_TTL_SECONDS,
  TUTOR_PHOTO_API_PATH,
  TUTOR_STORAGE_BUCKET,
} from "../api/_lib/tutors.js";

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`fail - ${name}`);
    throw error;
  }
}

test("homepage video uses stable public mp4 with poster and autoplay-safe attributes", () => {
  const props = homepageVideoElementProps({ autoPlay: true });
  const source = homepageVideoSourceProps();
  assert.equal(source.src, INTRO_VIDEO_SRC);
  assert.equal(source.type, INTRO_VIDEO_TYPE);
  assert.equal(INTRO_VIDEO_SRC, "/homepage-promo.mp4");
  assert.equal(props.poster, INTRO_VIDEO_POSTER);
  assert.equal(props.poster, "/homepage-promo-poster.jpg");
  assert.equal(props.controls, true);
  assert.equal(props.muted, true);
  assert.equal(props.playsInline, true);
  assert.equal(props.autoPlay, true);
  assert.equal(props.loop, true);
  assert.equal(props.preload, "metadata");
  assert.ok(!String(source.src).includes("token="), "must not use signed video URLs");
});

test("normalizeTutorStoragePath strips bucket prefixes, query tokens and duplicates", () => {
  assert.equal(
    normalizeTutorStoragePath("applications/profile-photo/photo.png"),
    "applications/profile-photo/photo.png",
  );
  assert.equal(
    normalizeTutorStoragePath(`${TUTOR_STORAGE_BUCKET}/applications/profile-photo/photo.png`),
    "applications/profile-photo/photo.png",
  );
  assert.equal(
    normalizeTutorStoragePath(
      `https://example.supabase.co/storage/v1/object/sign/${TUTOR_STORAGE_BUCKET}/applications/profile-photo/photo.png?token=abc`,
    ),
    "applications/profile-photo/photo.png",
  );
  assert.equal(
    normalizeTutorStoragePath("applications/applications/profile-photo/a%20b.png"),
    "applications/profile-photo/a b.png",
  );
  assert.equal(normalizeTutorStoragePath("../secret.png"), null);
  assert.equal(normalizeTutorStoragePath(""), null);
});

test("buildTutorPhotoApiUrl returns stable same-origin URLs with cache-busting version", () => {
  const url = buildTutorPhotoApiUrl(
    "joseph-danso-4qy75y",
    "tutor-applications/applications/profile-photo/1785677359343-joseph-danso-0n10xr.jpg",
  );
  assert.equal(
    url,
    `${TUTOR_PHOTO_API_PATH}?slug=joseph-danso-4qy75y&v=1785677359343-joseph-danso-0n10xr.jpg`,
  );
  assert.ok(!url.includes("token="));
  assert.ok(PROFILE_PHOTO_SIGNED_TTL_SECONDS >= 3600);
});

test("mimeTypeForTutorPath maps common image extensions", () => {
  assert.equal(mimeTypeForTutorPath("a.JPG"), "image/jpeg");
  assert.equal(mimeTypeForTutorPath("a.png"), "image/png");
  assert.equal(mimeTypeForTutorPath("a.webp"), "image/webp");
});

test("isPublishedTutorRow requires approved published slug", () => {
  assert.equal(
    isPublishedTutorRow({
      public_slug: "belinda-cooke-jre77z",
      profile_status: "approved",
      is_published: true,
    }),
    true,
  );
  assert.equal(
    isPublishedTutorRow({
      public_slug: "pending-tutor",
      profile_status: "pending",
      is_published: false,
    }),
    false,
  );
});

test("avatar fallback switches once without looping on the fallback asset", () => {
  assert.equal(resolveTutorAvatarSrc("https://cdn.example/photo.jpg"), "https://cdn.example/photo.jpg");
  assert.equal(resolveTutorAvatarSrc("https://cdn.example/photo.jpg", { failed: true }), LOCAL_AVATAR_FALLBACK);
  assert.equal(resolveTutorAvatarSrc("", { failed: true }), LOCAL_AVATAR_FALLBACK);
  assert.equal(resolveTutorAvatarSrc(LOCAL_AVATAR_FALLBACK, { failed: false }), LOCAL_AVATAR_FALLBACK);
  assert.equal(shouldUseAvatarImage("https://cdn.example/photo.jpg", false), true);
  assert.equal(shouldUseAvatarImage("", false), false);
  assert.equal(shouldUseAvatarImage("", true), true);
});

console.log("All media/tutor photo regression checks passed.");
