#!/usr/bin/env node
/**
 * Upload the A11.1 MP4 to the public Supabase resources bucket.
 * Writes same-origin VTT captions and a JPEG poster into public/.
 * Never prints secret values. Never uploads the teacher mark scheme.
 */
import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { srtToVtt } from "./publish-gcse-foundations-videos.mjs";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUCKET = "resources";
const ARTIFACTS = "/opt/cursor/artifacts";
const SLUG = "a11-1-collision-theory";
const FILE = "jdscience-a11-1-collision-theory-1080p.mp4";
const SRT = "jdscience-a11-1-collision-theory.srt";

function supabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || "https://xugsznxfvpbifpzpuoek.supabase.co";
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing. Cannot upload videos.");
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function extractPoster(src, dest) {
  await mkdir(path.dirname(dest), { recursive: true });
  await execFileAsync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-ss", "8",
    "-i", src,
    "-update", "1",
    "-frames:v", "1",
    "-q:v", "4",
    dest,
  ]);
}

async function upload(client, storagePath, filePath, contentType) {
  const buffer = await readFile(filePath);
  const { error } = await client.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
    cacheControl: "86400",
  });
  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  return storagePath;
}

async function publicOk(url) {
  const response = await fetch(url, { method: "HEAD" });
  return { ok: response.ok, status: response.status, type: response.headers.get("content-type") || "" };
}

async function main() {
  const client = supabaseAdmin();
  const mp4 = path.join(ARTIFACTS, FILE);
  const srt = path.join(ARTIFACTS, SRT);
  const publicDir = path.join(ROOT, "public/resources/t-level/science/videos", SLUG);
  await mkdir(publicDir, { recursive: true });
  const vtt = srtToVtt(await readFile(srt, "utf8"));
  await writeFile(path.join(publicDir, "captions.vtt"), vtt);
  const poster = path.join(publicDir, "poster.jpg");
  await extractPoster(mp4, poster);

  const storagePath = `t-level/science/videos/${SLUG}/${FILE}`;
  await upload(client, storagePath, mp4, "video/mp4");
  const publicUrl = `https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources/${storagePath}`;
  const check = await publicOk(publicUrl);
  if (!check.ok) {
    throw new Error(`Public HEAD failed for A11.1 MP4: ${check.status} ${check.type}`);
  }
  console.log(JSON.stringify({
    uploaded: storagePath,
    public: publicUrl,
    status: check.status,
    type: check.type,
    captions: "/resources/t-level/science/videos/a11-1-collision-theory/captions.vtt",
    poster: "/resources/t-level/science/videos/a11-1-collision-theory/poster.jpg",
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
