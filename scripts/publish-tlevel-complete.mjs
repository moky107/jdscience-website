#!/usr/bin/env node
/** Upload public T-Level videos/worksheets and private teacher schemes. Never put schemes in the public bucket. */
import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { TLEVEL_CHEMISTRY_VIDEOS } from "../src/tlevelChemistryVideos.js";
import { srtToVtt } from "./publish-gcse-foundations-videos.mjs";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTIFACTS = "/opt/cursor/artifacts";
const A12_ART = path.join(ARTIFACTS, "tlevel-a12");
const PRIVATE_BUCKET = "teacher-resources";
const PUBLIC_BUCKET = "resources";

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || "https://xugsznxfvpbifpzpuoek.supabase.co";
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function mp4Path(fileName) {
  const a12 = path.join(A12_ART, fileName);
  if (existsSync(a12)) return a12;
  const root = path.join(ARTIFACTS, fileName);
  if (existsSync(root)) return root;
  throw new Error(`Missing MP4 ${fileName}`);
}

async function extractPoster(src, dest) {
  await mkdir(path.dirname(dest), { recursive: true });
  await execFileAsync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-ss", "8", "-i", src, "-update", "1", "-frames:v", "1", "-q:v", "4", dest]);
}

async function upload(client, bucket, storagePath, bytes, contentType) {
  const { error } = await client.storage.from(bucket).upload(storagePath, bytes, {
    contentType,
    upsert: true,
    cacheControl: bucket === PUBLIC_BUCKET ? "86400" : "0",
  });
  if (error) throw new Error(`${bucket}/${storagePath}: ${error.message}`);
}

async function main() {
  const client = supabaseAdmin();
  const report = [];
  for (const item of TLEVEL_CHEMISTRY_VIDEOS) {
    const mp4 = mp4Path(item.file_name);
    const srtName = item.file_name.replace("-1080p.mp4", ".srt");
    const srtCandidates = [
      path.join(A12_ART, srtName),
      path.join(ARTIFACTS, srtName),
      path.join(ROOT, "content/videos", item.topicSlug, srtName),
    ];
    const srt = srtCandidates.find((p) => existsSync(p));
    if (!srt) throw new Error(`Missing SRT ${srtName}`);
    const publicDir = path.join(ROOT, "public/resources/t-level/science/videos", item.topicSlug);
    await mkdir(publicDir, { recursive: true });
    await writeFile(path.join(publicDir, "captions.vtt"), srtToVtt(await readFile(srt, "utf8")));
    await extractPoster(mp4, path.join(publicDir, "poster.jpg"));
    await upload(client, PUBLIC_BUCKET, `t-level/science/videos/${item.topicSlug}/${item.file_name}`, await readFile(mp4), "video/mp4");
    const schemeCandidates = [
      path.join(ROOT, "content/tlevel-chemistry/private", `${item.topicSlug}-teacher-marking-scheme.pdf`),
      path.join(ROOT, "content/tlevel-chemistry/private", "a11-1-teacher-marking-scheme.pdf"),
      path.join(ARTIFACTS, `PRIVATE-${item.topicSlug}-teacher-marking-scheme.pdf`),
      path.join(ARTIFACTS, "PRIVATE-a11-1-teacher-marking-scheme.pdf"),
    ];
    const schemePath = item.topicSlug === "a11-1-collision-theory"
      ? schemeCandidates.find((p) => existsSync(p) && p.includes("a11-1"))
      : schemeCandidates.find((p) => existsSync(p) && p.includes(item.topicSlug));
    if (!existsSync(schemePath)) throw new Error(`Missing private scheme ${item.topicSlug}`);
    await upload(client, PRIVATE_BUCKET, `t-level/science/marking-schemes/${item.topicSlug}-teacher-marking-scheme.pdf`, await readFile(schemePath), "application/pdf");
    const head = await fetch(item.file_url_override, { method: "HEAD" });
    report.push({ slug: item.topicSlug, mp4: head.status, type: head.headers.get("content-type"), seconds: Number(head.headers.get("content-length") || 0) });
    console.log(JSON.stringify(report.at(-1)));
  }
  await writeFile(path.join(ARTIFACTS, "tlevel-publish-report.json"), JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
