#!/usr/bin/env node
/** Upload ready T-Level Chemistry MP4s. Never uploads teacher mark schemes. */
import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { TLEVEL_CHEMISTRY_VIDEOS } from "../src/tlevelChemistryVideos.js";
import { srtToVtt } from "./publish-gcse-foundations-videos.mjs";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTIFACTS = "/opt/cursor/artifacts";

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || "https://xugsznxfvpbifpzpuoek.supabase.co";
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function extractPoster(src, dest) {
  await mkdir(path.dirname(dest), { recursive: true });
  await execFileAsync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-ss", "8", "-i", src, "-update", "1", "-frames:v", "1", "-q:v", "4", dest]);
}

async function main() {
  const slugs = process.argv.slice(2);
  const client = supabaseAdmin();
  const ready = TLEVEL_CHEMISTRY_VIDEOS.filter((item) => item.hosted && (!slugs.length || slugs.includes(item.topicSlug)));
  for (const item of ready) {
    const mp4 = path.join(ARTIFACTS, item.file_name);
    const srt = path.join(ARTIFACTS, item.file_name.replace("-1080p.mp4", ".srt"));
    const publicDir = path.join(ROOT, "public/resources/t-level/science/videos", item.topicSlug);
    await mkdir(publicDir, { recursive: true });
    await writeFile(path.join(publicDir, "captions.vtt"), srtToVtt(await readFile(srt, "utf8")));
    await extractPoster(mp4, path.join(publicDir, "poster.jpg"));
    const storagePath = `t-level/science/videos/${item.topicSlug}/${item.file_name}`;
    const { error } = await client.storage.from("resources").upload(storagePath, await readFile(mp4), {
      contentType: "video/mp4",
      upsert: true,
      cacheControl: "86400",
    });
    if (error) throw new Error(error.message);
    const publicUrl = item.file_url_override;
    const head = await fetch(publicUrl, { method: "HEAD" });
    if (!head.ok) throw new Error(`Public HEAD failed ${item.topicSlug}: ${head.status}`);
    console.log(JSON.stringify({ slug: item.topicSlug, status: head.status, type: head.headers.get("content-type") }));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
