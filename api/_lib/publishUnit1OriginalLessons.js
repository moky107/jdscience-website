/* Manual one-off helper only. Do not call this from /api/shop-products,
   Shop Admin list, npm run build, or Vercel deploy. */

import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { readFile, access, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  persistShopProductRow,
  PROTECTED_BTEC_SPECIALISED_CELLS_ID,
  PROTECTED_CHEMISTRY_COMPANION_ID,
  OBSOLETE_SEEDED_UNIT1_SLUG,
} from "./shop.js";
import {
  UNIT1_EXAM_BOARD,
  UNIT1_LEVEL,
  unit1ProductSpecs,
} from "./unit1OriginalLessonCatalog.js";

const execFileAsync = promisify(execFile);
const BUCKET = "shop-products";
const LESSON_DIR = "content/lessons";
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://xugsznxfvpbifpzpuoek.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminUrl = (process.env.SHOP_ADMIN_URL || "https://www.jdscience.co.uk/api/admin-shop-products").replace(/\/$/, "");
  return { supabaseUrl, serviceRoleKey, adminPassword, adminUrl };
}

function repoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
}

export function localLessonPaths(spec, root = repoRoot()) {
  const folder = path.join(root, LESSON_DIR, spec.folder);
  return {
    folder,
    download: path.join(folder, spec.localDownloadName),
    cover: path.join(folder, spec.localCoverName),
    worksheetPdf: path.join(folder, `btec-unit-1-${spec.folder}-worksheet.pdf`),
    answersPdf: path.join(folder, `btec-unit-1-${spec.folder}-answers.pdf`),
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

export async function verifyLocalProductAssets(spec, root = repoRoot()) {
  const paths = localLessonPaths(spec, root);
  if (!(await fileExists(paths.download))) {
    return { ok: false, error: `Missing download: ${paths.download}` };
  }
  if (!(await fileExists(paths.cover))) {
    return { ok: false, error: `Missing cover: ${paths.cover}` };
  }
  const download = await readFile(paths.download);
  const cover = await readFile(paths.cover);
  if (spec.product_type === "powerpoint") {
    if (download.subarray(0, 2).toString() !== "PK") {
      return { ok: false, error: `${spec.localDownloadName} is not a valid pptx zip` };
    }
  } else {
    if (download.subarray(0, 2).toString() !== "PK") {
      return { ok: false, error: `${spec.localDownloadName} is not a valid zip pack` };
    }
    if (!(await fileExists(paths.worksheetPdf)) || !(await fileExists(paths.answersPdf))) {
      return { ok: false, error: `Worksheet pack sources missing for ${spec.folder}` };
    }
    const worksheet = await readFile(paths.worksheetPdf);
    const answers = await readFile(paths.answersPdf);
    if (worksheet.subarray(0, 4).toString() !== "%PDF" || answers.subarray(0, 4).toString() !== "%PDF") {
      return { ok: false, error: `Worksheet PDFs are not valid for ${spec.folder}` };
    }
  }
  if (cover.subarray(0, 8).toString("ascii") !== "\u0089PNG\r\n\u001a\n" && cover[0] !== 0x89) {
    const header = cover.subarray(0, 4);
    if (!(header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47)) {
      return { ok: false, error: `${spec.localCoverName} is not a PNG` };
    }
  }
  const size = await stat(paths.download);
  if (!size.size) return { ok: false, error: `${spec.localDownloadName} is empty` };
  return { ok: true, paths };
}

export function isProtectedShopRow(row) {
  if (!row) return false;
  return PROTECTED_IDS.has(row.id) || PROTECTED_SLUGS.has(row.slug);
}

export function findExistingUnit1Product(rows, spec) {
  const list = Array.isArray(rows) ? rows : [];
  return list.find((row) => (
    row.slug === spec.slug
    || (row.title === spec.title && row.product_type === spec.product_type)
  )) || null;
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
    level: UNIT1_LEVEL,
    subject: spec.subject,
    exam_board: UNIT1_EXAM_BOARD,
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

async function ensureWorksheetPacks(root = repoRoot()) {
  await execFileAsync("python3", [path.join(root, "scripts/prepare-unit1-shop-assets.py")], { cwd: root });
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

async function listExisting(client) {
  if (client.kind === "supabase") {
    const { data, error } = await client.supabase.from("shop_products").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  }
  const listed = await adminRequest(client.config, { action: "shop-list" });
  return listed.products || [];
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

function candidateLessonRoots() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return [...new Set([
    repoRoot(),
    process.cwd(),
    path.resolve(here, "../.."),
    "/var/task",
  ])];
}

async function resolveLessonRoot(spec) {
  for (const root of candidateLessonRoots()) {
    const download = path.join(root, LESSON_DIR, spec.folder, spec.localDownloadName);
    if (await fileExists(download)) return root;
  }
  return repoRoot();
}

export async function publishUnit1OriginalLessons({
  dryRun = false,
  supabase = null,
  skipPackBuild = false,
  maxCreate = Number.POSITIVE_INFINITY,
  updateExisting = true,
} = {}) {
  const root = await resolveLessonRoot(unit1ProductSpecs()[0] || { folder: "atomic-structure", localDownloadName: "btec-unit-1-chemistry-atomic-structure.pptx" });
  await mkdir(path.join(root, LESSON_DIR), { recursive: true });
  if (!skipPackBuild) {
    await ensureWorksheetPacks(root);
  }

  const specs = unit1ProductSpecs();
  const verified = [];
  for (const spec of specs) {
    if (PROTECTED_SLUGS.has(spec.slug) || spec.slug === OBSOLETE_SEEDED_UNIT1_SLUG) {
      return { ok: false, skipped: true, reason: `refusing_protected_or_obsolete_slug:${spec.slug}` };
    }
    const check = await verifyLocalProductAssets(spec, root);
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
  const stamp = Date.now();
  let createdCount = 0;

  for (const { spec, paths } of verified) {
    const existing = findExistingUnit1Product(existingRows, spec);
    if (existing && isProtectedShopRow(existing)) {
      results.push({
        slug: spec.slug,
        title: spec.title,
        skipped: true,
        reason: "protected_existing_row",
      });
      continue;
    }
    if (existing && !updateExisting) {
      results.push({
        slug: spec.slug,
        title: spec.title,
        skipped: true,
        reason: "already_present",
        id: existing.id,
      });
      continue;
    }
    if (!existing && createdCount >= maxCreate) {
      results.push({
        slug: spec.slug,
        title: spec.title,
        skipped: true,
        reason: "max_create_reached",
      });
      continue;
    }

    const safeName = spec.localDownloadName.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const imageName = `${spec.slug}-cover.png`;
    let download_path;
    let image_path;
    if (client.kind === "supabase") {
      download_path = await uploadDirect(
        client.supabase,
        `downloads/${stamp}-${safeName}`,
        paths.download,
        spec.downloadContentType,
      );
      image_path = await uploadDirect(
        client.supabase,
        `images/${stamp}-${imageName}`,
        paths.cover,
        "image/png",
      );
      await uploadDirect(
        client.supabase,
        `previews/${stamp}-${imageName}`,
        paths.cover,
        "image/png",
      );
    } else {
      download_path = await uploadViaAdmin(client.config, "downloads", paths.download, spec.downloadContentType);
      image_path = await uploadViaAdmin(client.config, "images", paths.cover, "image/png");
      await uploadViaAdmin(client.config, "previews", paths.cover, "image/png");
    }

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
      title: spec.title,
      type: spec.product_type,
      price_pence: spec.price_pence,
      download_path,
      image_path,
      created: saved.created,
      updated: saved.updated,
      id: saved.product?.id || existing?.id || null,
      published: true,
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

export async function ensureMissingUnit1ShopProducts(supabase, { maxCreate = 8 } = {}) {
  return publishUnit1OriginalLessons({
    supabase,
    skipPackBuild: true,
    maxCreate,
    updateExisting: false,
  });
}
