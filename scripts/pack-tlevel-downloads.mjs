#!/usr/bin/env node
/** Build public and private download packs, then upload them. */
import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { TLEVEL_CHEMISTRY_VIDEOS } from "../src/tlevelChemistryVideos.js";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ARTIFACTS = "/opt/cursor/artifacts";
const A12_ART = path.join(ARTIFACTS, "tlevel-a12");
const STAGE = path.join(ARTIFACTS, "tlevel-download-stage");
const PUBLIC_BUCKET = "resources";
const PRIVATE_BUCKET = "teacher-resources";

function admin() {
  const url = process.env.VITE_SUPABASE_URL || "https://xugsznxfvpbifpzpuoek.supabase.co";
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function findFile(candidates) {
  return candidates.find((p) => existsSync(p));
}

function mp4(item) {
  return findFile([path.join(A12_ART, item.file_name), path.join(ARTIFACTS, item.file_name)]);
}

function scheme(item) {
  return findFile([
    path.join(ROOT, "content/tlevel-chemistry/private", `${item.topicSlug}-teacher-marking-scheme.pdf`),
    path.join(ROOT, "content/tlevel-chemistry/private", "a11-1-teacher-marking-scheme.pdf"),
    path.join(ARTIFACTS, `PRIVATE-${item.topicSlug}-teacher-marking-scheme.pdf`),
    path.join(ARTIFACTS, "PRIVATE-a11-1-teacher-marking-scheme.pdf"),
  ]);
}

async function zipDir(src, dest) {
  await execFileAsync("zip", ["-r", "-q", dest, "."], { cwd: src });
}

async function upload(client, bucket, storagePath, file, type) {
  const { error } = await client.storage.from(bucket).upload(storagePath, await readFile(file), {
    contentType: type,
    upsert: true,
    cacheControl: bucket === PUBLIC_BUCKET ? "3600" : "0",
  });
  if (error) throw new Error(`${bucket}/${storagePath}: ${error.message}`);
}

async function stageLesson(item, dest, includeScheme) {
  await mkdir(dest, { recursive: true });
  const video = mp4(item);
  const worksheet = path.join(ROOT, "public/resources/t-level/science/videos", item.topicSlug, `jdscience-${item.topicSlug}-worksheet.pdf`);
  const srt = findFile([
    path.join(A12_ART, item.file_name.replace("-1080p.mp4", ".srt")),
    path.join(ROOT, "content/videos", item.topicSlug, item.file_name.replace("-1080p.mp4", ".srt")),
  ]);
  const transcript = path.join(ROOT, "content/videos", item.topicSlug, "source/transcript.json");
  const folder = item.topicSlug.startsWith("a11") ? item.topicSlug.slice(0, 5) : item.topicSlug.slice(0, 5);
  const yt = findFile([
    path.join(ROOT, "content/tlevel-chemistry", folder, "youtube-thumbnail.jpg"),
    path.join(ARTIFACTS, `${folder}-youtube-thumbnail.jpg`),
  ]);
  const tt = findFile([
    path.join(ROOT, "content/tlevel-chemistry", folder, "tiktok-cover.jpg"),
    path.join(ARTIFACTS, `${folder}-tiktok-cover.jpg`),
  ]);
  if (video) await copyFile(video, path.join(dest, item.file_name));
  if (existsSync(worksheet)) await copyFile(worksheet, path.join(dest, `jdscience-${item.topicSlug}-worksheet.pdf`));
  if (srt) await copyFile(srt, path.join(dest, path.basename(srt)));
  if (existsSync(transcript)) {
    const data = JSON.parse(await readFile(transcript, "utf8"));
    await writeFile(path.join(dest, `${item.topicSlug}-transcript.txt`), `${data.full_text || ""}\n`);
  }
  if (yt) await copyFile(yt, path.join(dest, `${item.topicSlug}-youtube-thumbnail.jpg`));
  if (tt) await copyFile(tt, path.join(dest, `${item.topicSlug}-tiktok-cover.jpg`));
  if (includeScheme) {
    const mark = scheme(item);
    if (mark) await copyFile(mark, path.join(dest, `${item.topicSlug}-TEACHER-ONLY-marking-scheme.pdf`));
  }
}

async function signed(client, bucket, storagePath, expires) {
  const { data, error } = await client.storage.from(bucket).createSignedUrl(storagePath, expires);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

async function main() {
  const client = admin();
  const a11 = TLEVEL_CHEMISTRY_VIDEOS.filter((item) => item.topicSlug.startsWith("a11"));
  const a12 = TLEVEL_CHEMISTRY_VIDEOS.filter((item) => item.topicSlug.startsWith("a12"));
  await mkdir(STAGE, { recursive: true });

  const a11Dir = path.join(STAGE, "A11-complete");
  const a12Dir = path.join(STAGE, "A12-complete");
  const teacherDir = path.join(STAGE, "teacher-pack");
  for (const item of a11) {
    await stageLesson(item, path.join(a11Dir, item.topicSlug), true);
    await stageLesson(item, path.join(teacherDir, item.topicSlug), true);
  }
  for (const item of a12) {
    await stageLesson(item, path.join(a12Dir, item.topicSlug), true);
    await stageLesson(item, path.join(teacherDir, item.topicSlug), true);
  }
  // teacher pack: drop videos to keep it smaller
  await execFileAsync("bash", ["-lc", `find '${teacherDir}' -name '*.mp4' -delete`]);

  const a11Zip = path.join(ARTIFACTS, "JD-Science-A11-Complete-Pack.zip");
  const a12Zip = path.join(ARTIFACTS, "JD-Science-A12-Complete-Pack.zip");
  const teacherZip = path.join(ARTIFACTS, "JD-Science-Complete-Teacher-Resource-Pack.zip");
  await zipDir(a11Dir, a11Zip);
  await zipDir(a12Dir, a12Zip);
  await zipDir(teacherDir, teacherZip);

  const links = {};
  for (const [name, file] of [
    ["a11_pack", a11Zip],
    ["a12_pack", a12Zip],
    ["teacher_pack", teacherZip],
  ]) {
    const storagePath = `t-level/science/packs/${path.basename(file)}`;
    await upload(client, PRIVATE_BUCKET, storagePath, file, "application/zip");
    links[name] = await signed(client, PRIVATE_BUCKET, storagePath, 60 * 60 * 24 * 7);
  }

  // Individual public assets already hosted as MP4s; signed private schemes
  links.lessons = {};
  for (const item of TLEVEL_CHEMISTRY_VIDEOS) {
    const markPath = `t-level/science/marking-schemes/${item.topicSlug}-teacher-marking-scheme.pdf`;
    links.lessons[item.topicSlug] = {
      mp4: item.file_url_override,
      worksheet: `https://www.jdscience.co.uk${item.downloadHref}`,
      captions: `https://www.jdscience.co.uk${item.caption_url}`,
      page: `https://www.jdscience.co.uk/resources/t-level/science/videos/${item.topicSlug}/`,
      teacherSchemeSigned: await signed(client, PRIVATE_BUCKET, markPath, 60 * 60 * 24 * 7),
    };
  }
  await writeFile(path.join(ARTIFACTS, "tlevel-download-links.json"), JSON.stringify(links, null, 2));
  console.log(JSON.stringify({
    a11ZipBytes: (await readFile(a11Zip)).length,
    a12ZipBytes: (await readFile(a12Zip)).length,
    teacherZipBytes: (await readFile(teacherZip)).length,
    a11: links.a11_pack.slice(0, 80),
    a12: links.a12_pack.slice(0, 80),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
