#!/usr/bin/env node
/**
 * Upload the twelve chemical-changes MP4s to YouTube as Unlisted.
 * Requires YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET and YOUTUBE_REFRESH_TOKEN
 * for the Google account that owns the JD Science channel.
 * Does not set videos Public.
 */
import { createReadStream, readFileSync, writeFileSync } from "node:fs";
import { google } from "googleapis";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pack = JSON.parse(
  readFileSync(path.join(ROOT, "content/gcse-chemical-changes/youtube/upload-pack.json"), "utf8"),
);

function client() {
  const id = (process.env.YOUTUBE_CLIENT_ID || "").trim();
  const secret = (process.env.YOUTUBE_CLIENT_SECRET || "").trim();
  const refresh = (process.env.YOUTUBE_REFRESH_TOKEN || "").trim();
  if (!id || !secret || !refresh) {
    throw new Error(
      "YouTube OAuth is missing. Set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET and YOUTUBE_REFRESH_TOKEN.",
    );
  }
  const auth = new google.auth.OAuth2(id, secret, "urn:ietf:wg:oauth:2.0:oob");
  auth.setCredentials({ refresh_token: refresh });
  return google.youtube({ version: "v3", auth });
}

async function uploadOne(youtube, item) {
  const mediaPath = item.source_mp4;
  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: item.title.slice(0, 100),
        description: item.description,
        tags: item.tags,
        categoryId: item.categoryId,
        defaultLanguage: "en-GB",
        defaultAudioLanguage: "en-GB",
      },
      status: {
        privacyStatus: "unlisted",
        selfDeclaredMadeForKids: false,
        embeddable: true,
        license: "youtube",
      },
    },
    media: { body: createReadStream(mediaPath) },
  });
  const videoId = res.data.id;
  if (item.thumbnail) {
    await youtube.thumbnails.set({
      videoId,
      media: { body: createReadStream(item.thumbnail) },
    });
  }
  return {
    slug: item.slug,
    videoId,
    url: `https://youtu.be/${videoId}`,
    privacyStatus: "unlisted",
  };
}

async function main() {
  const youtube = client();
  const results = [];
  for (const item of pack) {
    console.error(`uploading ${item.slug}`);
    results.push(await uploadOne(youtube, item));
  }
  const dest = path.join(ROOT, "content/gcse-chemical-changes/youtube/uploaded.json");
  writeFileSync(dest, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
