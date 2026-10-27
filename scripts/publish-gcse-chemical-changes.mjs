#!/usr/bin/env node
/**
 * Upload chemical-changes MP4s to the public Supabase resources bucket.
 * Writes VTT captions and JPEG posters into public/.
 */
import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { GCSE_CHEMISTRY_CHEMICAL_CHANGES_VIDEOS } from "../src/gcseChemistryVideos.js";
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
  const results = [];
  for (const item of GCSE_CHEMISTRY_CHEMICAL_CHANGES_VIDEOS) {
    const mp4 = path.join(ARTIFACTS, item.file_name);
    await access(mp4);
    const srtCandidates = [
      path.join(ARTIFACTS, `jdscience-${item.topicSlug}.srt`),
      path.join(ROOT, "content/videos", item.topicSlug, `jdscience-${item.topicSlug}.srt`),
    ];
    let srtPath = null;
    for (const candidate of srtCandidates) {
      try {
        await access(candidate);
        srtPath = candidate;
        break;
      } catch {
        /* next */
      }
    }
    if (!srtPath) throw new Error(`Missing SRT for ${item.title}`);
    const publicDir = path.join(ROOT, "public/resources/gcse/chemistry/videos", item.topicSlug);
    await mkdir(publicDir, { recursive: true });
    await writeFile(path.join(publicDir, "captions.vtt"), srtToVtt(await readFile(srtPath, "utf8")));
    await extractPoster(mp4, path.join(publicDir, "poster.jpg"));
    const storageMp4 = `gcse-igcse/chemistry/videos/${item.topicSlug}/${item.file_name}`;
    await upload(client, storageMp4, mp4, "video/mp4");
    const check = await publicOk(item.file_url_override);
    if (!check.ok) throw new Error(`Public read failed for ${item.title}: HTTP ${check.status}`);
    const bytes = await fetch(item.file_url_override, { headers: { Range: "bytes=0-11" } });
    const head = Buffer.from(await bytes.arrayBuffer());
    const looksMp4 = head.subarray(4, 8).toString("ascii") === "ftyp";
    console.log(`uploaded ${item.topicSlug} public=${check.status} ftyp=${looksMp4}`);
    results.push({ slug: item.topicSlug, url: item.file_url_override, status: check.status, ftyp: looksMp4 });
  }
  await writeFile(path.join(ROOT, "content/gcse-chemical-changes/publish.json"), `${JSON.stringify(results, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
