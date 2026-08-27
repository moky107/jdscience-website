/**
 * Upload generated 11+ PDFs to Supabase Storage and insert published resources rows.
 *
 * Requires server-side env (never put these in VITE_* / browser code):
 *   NEXT_PUBLIC_SUPABASE_URL  (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/eleven-plus/upload.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { ELEVEN_PLUS_PRACTICE_PAPERS } from "../../src/elevenPlusPracticePapers.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
}

export async function uploadElevenPlusResources() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return {
      ok: false,
      skipped: true,
      reason: "SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL not set. PDFs are available locally under public/resources/11plus/.",
    };
  }
  if (/service_role/i.test(String(process.env.VITE_SUPABASE_ANON_KEY || ""))) {
    throw new Error("Refusing to run: VITE_SUPABASE_ANON_KEY looks like a service-role key.");
  }

  const supabase = createClient(url, serviceKey);
  const inserted = [];

  for (const item of ELEVEN_PLUS_PRACTICE_PAPERS) {
    const localRel = item.file_url_override.replace(/^\//, "");
    const localPath = path.join(root, "public", localRel);
    if (!fs.existsSync(localPath)) throw new Error(`Missing local PDF: ${localPath}`);
    const bytes = fs.readFileSync(localPath);
    const storagePath = `11/${item.subject.toLowerCase().replace(/\s+/g, "-")}/independent-schools/${item.resource_category.toLowerCase().replace(/\s+/g, "-")}/${Date.now()}-${item.file_name}`;

    const { error: upError } = await supabase.storage.from("resources").upload(storagePath, bytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (upError) throw new Error(`Upload failed for ${item.title}: ${upError.message}`);

    const publicUrl = supabase.storage.from("resources").getPublicUrl(storagePath).data.publicUrl;
    const row = {
      level: item.level,
      subject: item.subject,
      exam_board: item.exam_board,
      resource_category: item.resource_category,
      title: item.title,
      file_name: item.file_name,
      file_url: publicUrl,
      file_type: "application/pdf",
      storage_path: storagePath,
      published: true,
    };
    const { data, error } = await supabase.from("resources").insert(row).select("*").single();
    if (error) throw new Error(`Insert failed for ${item.title}: ${error.message}`);
    inserted.push(data);
    console.log(`Uploaded + inserted: ${item.title}`);
  }

  return { ok: true, inserted };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  uploadElevenPlusResources()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      if (result.skipped) process.exitCode = 0;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
