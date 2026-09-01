/* Manual one-off helper. Shop-products may call ensureMissingBtecHscUnit2Walkthroughs
   only when none of the Unit 2 walkthroughs exist yet, so an admin delete is not
   undone on the next shop visit. Do not call the full publisher from npm run build. */

import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { access, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  UNIT2_WALKTHROUGH_EXAM_BOARD,
  UNIT2_WALKTHROUGH_LEVEL,
  UNIT2_WALKTHROUGH_SUBJECT,
  btecHscUnit2WalkthroughProductSpecs,
} from "./btecHscUnit2WalkthroughCatalog.js";
import {
  persistShopProductRow,
  PROTECTED_BTEC_SPECIALISED_CELLS_ID,
  PROTECTED_CHEMISTRY_COMPANION_ID,
  OBSOLETE_SEEDED_UNIT1_SLUG,
} from "./shop.js";

const execFileAsync = promisify(execFile);
const BUCKET = "shop-products";
const CONTENT_DIR = "content/shop/btec-hsc-unit2-walkthroughs";
const DEFAULT_SUPABASE_URL = "https://xugsznxfvpbifpzpuoek.supabase.co";
const PROTECTED_IDS = new Set([
  PROTECTED_BTEC_SPECIALISED_CELLS_ID,
  PROTECTED_CHEMISTRY_COMPANION_ID,
]);
const PROTECTED_SLUGS = new Set([
  "specialise-cells",
  "my-chemistry-companion",
  OBSOLETE_SEEDED_UNIT1_SLUG,
]);

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
  if (download.subarray(0, 4).toString() !== "%PDF") {
    return { ok: false, error: `${spec.localDownloadName} is not a valid PDF` };
  }
  const cover = await readFile(paths.cover);
  if (!(cover[0] === 0x89 && cover[1] === 0x50 && cover[2] === 0x4e && cover[3] === 0x47)) {
    return { ok: false, error: `${spec.localCoverName} is not a PNG` };
  }
  const size = await stat(paths.download);
  if (!size.size) return { ok: false, error: `${spec.localDownloadName} is empty` };
  return { ok: true, paths };
}

export function isProtectedShopRow(row) {
  if (!row) return false;
  return PROTECTED_IDS.has(row.id) || PROTECTED_SLUGS.has(row.slug);
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
    level: UNIT2_WALKTHROUGH_LEVEL,
    subject: UNIT2_WALKTHROUGH_SUBJECT,
    exam_board: UNIT2_WALKTHROUGH_EXAM_BOARD,
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

async function ensureCovers(root = repoRoot()) {
  try {
    await execFileAsync("python3", [path.join(root, "scripts/btec_hsc_unit2_walkthroughs/covers.py")], { cwd: root });
  } catch (error) {
    // Covers are committed with the PDFs. Regeneration is optional.
    if (error?.message) {
      console.warn(`Cover generation skipped: ${error.message}`);
    }
  }
}

function contentTypeFor(filename) {
  if (filename.endsWith(".pdf")) return "application/pdf";
  if (filename.endsWith(".png")) return "image/png";
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

async function uploadViaAdmin(config, folder, filePath, contentType, filename) {
  const buffer = await readFile(filePath);
  const data = await adminRequest(config, {
    action: "shop-upload",
    folder,
    filename: filename || path.basename(filePath),
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
  const filename = path.basename(storagePath);
  const contentType = contentTypeFor(filename);
  if (client.kind === "supabase") {
    return uploadDirect(client.supabase, storagePath, filePath, contentType);
  }
  const uploaded = await uploadViaAdmin(client.config, folder, filePath, contentType, filename);
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

function candidateContentRoots() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return [...new Set([
    repoRoot(),
    process.cwd(),
    path.resolve(here, "../.."),
    "/var/task",
  ])];
}

async function resolveContentRoot(spec) {
  for (const root of candidateContentRoots()) {
    const download = path.join(root, CONTENT_DIR, spec.folder, spec.localDownloadName);
    if (await fileExists(download)) return root;
  }
  return repoRoot();
}

export async function publishBtecHscUnit2Walkthroughs({
  dryRun = false,
  supabase = null,
  skipCovers = false,
  maxCreate = Number.POSITIVE_INFINITY,
  updateExisting = true,
} = {}) {
  const specs = btecHscUnit2WalkthroughProductSpecs();
  const root = await resolveContentRoot(specs[0]);
  await mkdir(path.join(root, CONTENT_DIR), { recursive: true });
  if (!skipCovers) {
    await ensureCovers(root);
  }

  const verified = [];
  for (const spec of specs) {
    if (PROTECTED_SLUGS.has(spec.slug)) {
      return { ok: false, skipped: true, reason: `refusing_protected_or_obsolete_slug:${spec.slug}` };
    }
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
  let createdCount = 0;

  for (const { spec, paths } of verified) {
    const existing = existingRows.find((row) => row.slug === spec.slug) || null;
    if (isProtectedShopRow(existing)) {
      results.push({ slug: spec.slug, skipped: true, reason: "protected_product" });
      continue;
    }
    if (existing && !updateExisting) {
      results.push({ slug: spec.slug, skipped: true, reason: "already_present", id: existing.id });
      continue;
    }
    if (!existing && createdCount >= maxCreate) {
      results.push({ slug: spec.slug, skipped: true, reason: "max_create_reached" });
      continue;
    }
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
    const fields = productFields(spec, {
      download_path,
      image_path,
      preview_path: image_path,
    });
    const saved = await persistProduct(client, { existing, fields });
    if (saved.created) createdCount += 1;
    if (saved.created && saved.product) existingRows.push(saved.product);
    results.push({
      slug: spec.slug,
      id: saved.product?.id,
      download_path,
      image_path,
      preview_path: image_path,
      created: saved.created,
      updated: saved.updated,
    });
  }

  return {
    ok: true,
    mode: client.kind,
    root,
    results,
    created: results.filter((row) => row.created).length,
    updated: results.filter((row) => row.updated).length,
    skipped: results.filter((row) => row.skipped).length,
  };
}

export async function countMissingBtecHscUnit2Walkthroughs(supabase) {
  const slugs = btecHscUnit2WalkthroughProductSpecs().map((spec) => spec.slug);
  if (!supabase || !slugs.length) return slugs.length;
  const { data, error } = await supabase.from("shop_products").select("slug").in("slug", slugs);
  if (error) return slugs.length;
  const present = new Set((data || []).map((row) => row.slug));
  return slugs.filter((slug) => !present.has(slug)).length;
}

export async function ensureMissingBtecHscUnit2Walkthroughs(supabase, { maxCreate = 9 } = {}) {
  return publishBtecHscUnit2Walkthroughs({
    supabase,
    skipCovers: true,
    maxCreate,
    updateExisting: false,
  });
}
