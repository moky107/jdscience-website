#!/usr/bin/env node
/**
 * Upload hosted GCSE Biology MP4s to the public Supabase resources bucket.
 * Writes same-origin VTT captions, transcripts and JPEG posters into public/.
 * Never prints secret values.
 */
import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { GCSE_BIOLOGY_VIDEOS } from "../src/gcseBiologyVideos.js";
import { srtToVtt } from "./publish-gcse-foundations-videos.mjs";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUCKET = "resources";
const ARTIFACTS = "/opt/cursor/artifacts";

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
    "-ss", "4",
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

export async function publishBiologyVideos() {
  const client = supabaseAdmin();
  const { data: buckets, error: bucketError } = await client.storage.listBuckets();
  if (bucketError) throw new Error(`Could not list buckets: ${bucketError.message}`);
  const resources = (buckets || []).find((item) => item.id === BUCKET || item.name === BUCKET);
  if (!resources) throw new Error("resources bucket not found");
  if (!resources.public) throw new Error("resources bucket is not public; visitors could not watch videos");

  for (const item of GCSE_BIOLOGY_VIDEOS) {
    const mp4 = path.join(ARTIFACTS, item.file_name);
    const srtName = item.file_name.replace("-1080p.mp4", ".srt");
    const srtCandidates = [
      path.join(ARTIFACTS, srtName),
      path.join(ROOT, "content/videos", item.topicSlug, srtName),
    ];
    let srtPath = null;
    for (const candidate of srtCandidates) {
      try {
        await access(candidate);
        srtPath = candidate;
        break;
      } catch {
        /* try next */
      }
    }
    if (!srtPath) {
      throw new Error(`Missing SRT for ${item.title}`);
    }
    const publicDir = path.join(ROOT, "public/resources/gcse/biology/videos", item.topicSlug);
    const vttPath = path.join(publicDir, "captions.vtt");
    const posterPath = path.join(publicDir, "poster.jpg");
    const transcriptSrc = path.join(ROOT, "content/videos", item.topicSlug, "transcript.txt");
    const transcriptDest = path.join(publicDir, "transcript.txt");
    await mkdir(publicDir, { recursive: true });
    await writeFile(vttPath, srtToVtt(await readFile(srtPath, "utf8")));
    await extractPoster(mp4, posterPath);
    try {
      await access(transcriptSrc);
      await copyFile(transcriptSrc, transcriptDest);
    } catch {
      /* optional until produce.py has run */
    }
    const storageMp4 = `gcse-igcse/biology/videos/${item.topicSlug}/${item.file_name}`;
    await upload(client, storageMp4, mp4, "video/mp4");
    const check = await publicOk(item.file_url_override);
    if (!check.ok) {
      throw new Error(`Public read failed for ${item.title}: HTTP ${check.status}`);
    }
    console.log(`uploaded ${item.topicSlug} public=${check.status} type=${check.type}`);
  }
}

async function main() {
  await publishBiologyVideos();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}
