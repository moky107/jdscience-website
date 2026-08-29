import { createClient } from "@supabase/supabase-js";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const UNIT1_TITLE = "Unit 1 specialise cells";
export const UNIT1_SLUG = "unit-1-specialise-cells";
export const UNIT1_PRICE_PENCE = 500;
const BUCKET = "shop-products";

const ASSET_DIR = "content/shop/unit-1-specialise-cells";
const PPT_NAMES = [
  "unit-1-specialise-cells.pptx",
  "Unit 1 specialise cells.pptx",
];
const COVER_NAMES = ["cover.png"];

function shopConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { supabaseUrl, serviceRoleKey };
}

async function firstExisting(paths) {
  for (const candidate of paths) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      /* try next */
    }
  }
  return null;
}

function roots() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return [...new Set([
    process.cwd(),
    path.resolve(here, "../.."),
    path.resolve(here, "../../.."),
    path.resolve(here, ".."),
    "/var/task",
    path.join("/var/task", ".next"),
  ])];
}

function candidateAssetPaths(names) {
  const fromRoots = roots().flatMap((root) => [
    ...names.map((name) => path.join(root, ASSET_DIR, name)),
    ...names.map((name) => path.join(root, "content/shop", name)),
  ]);
  const fromModule = names.flatMap((name) => [
    fileURLToPath(new URL(`../../${ASSET_DIR}/${name}`, import.meta.url)),
    fileURLToPath(new URL(`../${ASSET_DIR}/${name}`, import.meta.url)),
  ]);
  return [...new Set([...fromRoots, ...fromModule])];
}

export async function unit1AssetPaths() {
  const ppt = await firstExisting(candidateAssetPaths(PPT_NAMES));
  const cover = await firstExisting(candidateAssetPaths(COVER_NAMES));
  return { ppt, cover };
}

export function productFields({ download_path, image_path }) {
  return {
    slug: UNIT1_SLUG,
    title: UNIT1_TITLE,
    short_description: "JDScience PowerPoint on specialised cells — palisade, root hair, sperm, egg, red blood cell and neutrophil.",
    description:
      "Full JDScience-branded PowerPoint: Unit 1 specialise cells. 29 slides covering specialised cell structure and function, with the original diagrams and electron micrographs. Includes palisade mesophyll cells, root hair cells, sperm cells, egg cells, red blood cells and neutrophils, plus recap, starter, Who am I? plenary and homework.",
    price_pence: UNIT1_PRICE_PENCE,
    sale_price_pence: null,
    product_type: "powerpoint",
    product_kind: "digital",
    level: "T Level",
    subject: "Biology",
    exam_board: "N/A",
    keywords: "specialised cells, specialise cells, unit 1, biology, T Level, powerpoint",
    image_path,
    preview_path: image_path,
    download_path,
    is_featured: true,
    featured: true,
    is_published: true,
    published: true,
    sort_order: 0,
    opens_external: false,
    external_url: null,
    updated_at: new Date().toISOString(),
  };
}

async function upload(supabase, storagePath, filePath, contentType) {
  const buffer = await readFile(filePath);
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Upload ${storagePath} failed: ${error.message}`);
  return storagePath;
}

export async function publishUnit1SpecialiseCells({ supabase } = {}) {
  const config = shopConfig();
  const client = supabase || (config.supabaseUrl && config.serviceRoleKey
    ? createClient(config.supabaseUrl, config.serviceRoleKey)
    : null);
  if (!client) {
    return { ok: false, skipped: true, reason: "missing_supabase_credentials" };
  }

  const { ppt, cover } = await unit1AssetPaths();
  if (!ppt || !cover) {
    console.warn("[shop] Unit 1 specialise cells publish skipped: missing_local_assets", {
      cwd: process.cwd(),
      pptFound: Boolean(ppt),
      coverFound: Boolean(cover),
    });
    return { ok: false, skipped: true, reason: "missing_local_assets" };
  }

  const { data: existing, error: lookupError } = await client
    .from("shop_products")
    .select("id")
    .eq("slug", UNIT1_SLUG)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (existing?.id) {
    return { ok: true, existed: true, product: { id: existing.id, title: UNIT1_TITLE, slug: UNIT1_SLUG, price_pence: UNIT1_PRICE_PENCE } };
  }

  const stamp = Date.now();
  const download_path = await upload(
    client,
    `downloads/${stamp}-Unit-1-specialise-cells.pptx`,
    ppt,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  );
  const image_path = await upload(
    client,
    `images/${stamp}-unit-1-specialise-cells-cover.png`,
    cover,
    "image/png",
  );

  const fields = productFields({ download_path, image_path });
  const { data, error } = await client
    .from("shop_products")
    .insert([{ ...fields, created_at: new Date().toISOString() }])
    .select("id, title, price_pence, slug")
    .single();
  if (error) throw new Error(error.message);
  return { ok: true, created: true, product: data };
}

export async function ensureUnit1SpecialiseCellsProduct(supabase) {
  try {
    return await publishUnit1SpecialiseCells({ supabase });
  } catch (error) {
    console.warn(`[shop] Unit 1 specialise cells publish skipped: ${error.message}`);
    return { ok: false, skipped: true, reason: error.message };
  }
}
