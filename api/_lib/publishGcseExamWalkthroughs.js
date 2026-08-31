/* Manual one-off helper only. Do not call this from /api/shop-products,
   Shop Admin list, npm run build, or Vercel deploy. */

import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { access, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  GCSE_WALKTHROUGH_EXAM_BOARD,
  GCSE_WALKTHROUGH_LEVEL,
  gcseWalkthroughProductSpecs,
} from "./gcseExamWalkthroughCatalog.js";
import { persistShopProductRow } from "./shop.js";

const execFileAsync = promisify(execFile);
const BUCKET = "shop-products";
const CONTENT_DIR = "content/shop/gcse-exam-walkthroughs";
const DEFAULT_SUPABASE_URL = "https://xugsznxfvpbifpzpuoek.supabase.co";

function shopConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminUrl = (process.env.SHOP_ADMIN_URL || "https://www.jdscience.co.uk/api/admin-shop-products").replace(/\/$/, "");
  return { supabaseUrl, serviceRoleKey, adminPassword, adminUrl };
}

function repoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
}

export function localWalkthroughPaths(spec, root = repoRoot()) {
  const folder = path.join(root, CONTENT_DIR, spec.folder);
  return {
    folder,
    download: path.join(folder, spec.localDownloadName),
    cover: path.join(folder, spec.localCoverName),
    preview: spec.localPreviewName ? path.join(folder, spec.localPreviewName) : null,
    docx: spec.localDocxName ? path.join(folder, spec.localDocxName) : null,
  };
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function verifyLocalWalkthroughAssets(spec, root = repoRoot()) {
  const paths = localWalkthroughPaths(spec, root);
  if (!(await fileExists(paths.download))) {
    return { ok: false, error: `Missing download: ${paths.download}` };
  }
  if (!(await fileExists(paths.cover))) {
    return { ok: false, error: `Missing cover: ${paths.cover}` };
  }
  const download = await readFile(paths.download);
  if (spec.localDownloadName.endsWith(".pdf")) {
    if (download.subarray(0, 4).toString() !== "%PDF") {
      return { ok: false, error: `${spec.localDownloadName} is not a valid PDF` };
    }
  } else if (spec.localDownloadName.endsWith(".zip")) {
    if (download.subarray(0, 2).toString() !== "PK") {
      return { ok: false, error: `${spec.localDownloadName} is not a valid zip` };
    }
  }
  if (paths.preview && !(await fileExists(paths.preview))) {
    return { ok: false, error: `Missing preview: ${paths.preview}` };
  }
  const size = await stat(paths.download);
  if (!size.size) return { ok: false, error: `${spec.localDownloadName} is empty` };
  return { ok: true, paths };
}

export function productFields(spec, { download_path, image_path, preview_path }) {
  return {
    slug: spec.slug,
    title: spec.title,
    short_description: spec.short_description,
    description: spec.description,
    price_pence: spec.price_pence,
    sale_price_pence: null,
    product_type: spec.product_type,
    product_kind: "digital",
    level: GCSE_WALKTHROUGH_LEVEL,
    subject: spec.subject,
    exam_board: GCSE_WALKTHROUGH_EXAM_BOARD,
    keywords: spec.keywords,
    image_path,
    preview_path: preview_path || image_path,
    download_path,
    is_featured: Boolean(spec.is_featured),
    featured: Boolean(spec.is_featured),
    is_published: true,
    published: true,
    sort_order: spec.sort_order,
    opens_external: false,
    purchase_method: "jdscience",
    retailer_name: null,
    show_price: true,
    external_url: null,
    external_button_label: "Buy now",
    updated_at: new Date().toISOString(),
  };
}

async function ensureBuilt(root = repoRoot()) {
  await execFileAsync("python3", [path.join(root, "scripts/gcse_exam_walkthroughs/build.py")], { cwd: root });
}

function contentTypeFor(filename) {
  if (filename.endsWith(".pdf")) return "application/pdf";
  if (filename.endsWith(".zip")) return "application/zip";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

async function adminRequest(config, payload) {
  const resp = await fetch(config.adminUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: config.adminPassword, ...payload }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || `Shop admin ${payload.action || "request"} failed (${resp.status})`);
  }
  return data;
}

async function uploadDirect(supabase, storagePath, filePath, contentType) {
  const buffer = await readFile(filePath);
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Upload ${storagePath} failed: ${error.message}`);
  return storagePath;
}

async function uploadViaAdmin(config, folder, filePath, contentType) {
  const buffer = await readFile(filePath);
  const data = await adminRequest(config, {
    action: "shop-upload",
    folder,
    filename: path.basename(filePath),
    contentType,
    base64: buffer.toString("base64"),
  });
  if (!data.path) throw new Error(`Shop admin upload returned no path for ${filePath}`);
  return data.path;
}

function resolveClient(supabase) {
  if (supabase) {
    return { kind: "supabase", config: shopConfig(), supabase };
  }
  const config = shopConfig();
  if (config.supabaseUrl && config.serviceRoleKey) {
    return {
      kind: "supabase",
      config,
      supabase: createClient(config.supabaseUrl, config.serviceRoleKey),
    };
  }
  if (config.adminPassword) {
    return { kind: "admin", config };
  }
  return null;
}

async function listExisting(client) {
  if (client.kind === "supabase") {
    const { data, error } = await client.supabase.from("shop_products").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  }
  const listed = await adminRequest(client.config, { action: "shop-list" });
  return listed.products || [];
}

async function uploadAsset(client, folder, storagePath, filePath) {
  const contentType = contentTypeFor(path.basename(filePath));
  if (client.kind === "supabase") {
    return uploadDirect(client.supabase, storagePath, filePath, contentType);
  }
  const uploaded = await uploadViaAdmin(client.config, folder, filePath, contentType);
  return uploaded || storagePath;
}

async function persistProduct(client, { existing, fields }) {
  if (client.kind === "supabase") {
    if (existing?.id) {
      const { data, error } = await persistShopProductRow(client.supabase, {
        mode: "update",
        id: existing.id,
        fields,
      });
      if (error) throw new Error(error.message);
      return { product: data, created: false, updated: true };
    }
    const { data, error } = await persistShopProductRow(client.supabase, {
      mode: "insert",
      fields: { ...fields, created_at: new Date().toISOString() },
    });
    if (error) throw new Error(error.message);
    return { product: data, created: true, updated: false };
  }

  if (existing?.id) {
    const saved = await adminRequest(client.config, {
      action: "shop-update",
      id: existing.id,
      product: { ...fields, id: existing.id },
    });
    return { product: saved.product, created: false, updated: true };
  }
  const saved = await adminRequest(client.config, {
    action: "shop-create",
    product: fields,
  });
  return { product: saved.product, created: true, updated: false };
}

export async function publishGcseExamWalkthroughs({
  dryRun = false,
  supabase = null,
  skipBuild = false,
} = {}) {
  const root = repoRoot();
  await mkdir(path.join(root, CONTENT_DIR), { recursive: true });
  if (!skipBuild) {
    await ensureBuilt(root);
  }

  const specs = gcseWalkthroughProductSpecs();
  const verified = [];
  for (const spec of specs) {
    const check = await verifyLocalWalkthroughAssets(spec, root);
    if (!check.ok) {
      return { ok: false, skipped: true, reason: "missing_local_assets", error: check.error, root };
    }
    verified.push({ spec, paths: check.paths });
  }

  const client = resolveClient(supabase);
  if (!client) {
    return { ok: false, skipped: true, reason: "missing_shop_credentials", verified: verified.length };
  }
  if (dryRun) {
    return { ok: true, dryRun: true, verified: verified.length, mode: client.kind };
  }

  const existingRows = await listExisting(client);
  const results = [];

  for (const { spec, paths } of verified) {
    const existing = existingRows.find((row) => row.slug === spec.slug) || null;
    const download_path = await uploadAsset(
      client,
      "downloads",
      `downloads/${spec.localDownloadName}`,
      paths.download,
    );
    const image_path = await uploadAsset(
      client,
      "images",
      `images/${spec.storageCoverName}`,
      paths.cover,
    );
    let preview_path = image_path;
    if (paths.preview) {
      preview_path = await uploadAsset(
        client,
        "previews",
        `previews/${spec.localPreviewName}`,
        paths.preview,
      );
    }
    const fields = productFields(spec, { download_path, image_path, preview_path });
    const saved = await persistProduct(client, { existing, fields });
    results.push({
      slug: spec.slug,
      id: saved.product?.id,
      download_path,
      image_path,
      preview_path,
      created: saved.created,
      updated: saved.updated,
    });
  }

  return { ok: true, mode: client.kind, results };
}
