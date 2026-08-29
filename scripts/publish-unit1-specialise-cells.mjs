import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TITLE = "Unit 1 specialise cells";
const SLUG = "unit-1-specialise-cells";
const PRICE_PENCE = 500;
const BUCKET = "shop-products";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pptPath = path.join(root, "content/shop/Unit 1 specialise cells.pptx");
const coverPath = path.join(root, "content/shop/unit-1-specialise-cells/cover.png");

function shopConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { supabaseUrl, serviceRoleKey };
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

export function productFields({ download_path, image_path }) {
  return {
    slug: SLUG,
    title: TITLE,
    short_description: "JDScience PowerPoint on specialised cells — palisade, root hair, sperm, egg, red blood cell and neutrophil.",
    description:
      "Full JDScience-branded PowerPoint: Unit 1 specialise cells. 29 slides covering specialised cell structure and function, with the original diagrams and electron micrographs. Includes palisade mesophyll cells, root hair cells, sperm cells, egg cells, red blood cells and neutrophils, plus recap, starter, Who am I? plenary and homework.",
    price_pence: PRICE_PENCE,
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

export async function publishUnit1SpecialiseCells({ supabase } = {}) {
  const config = shopConfig();
  const client = supabase || (config.supabaseUrl && config.serviceRoleKey
    ? createClient(config.supabaseUrl, config.serviceRoleKey)
    : null);
  if (!client) {
    return { ok: false, skipped: true, reason: "missing_supabase_credentials" };
  }

  const stamp = Date.now();
  const download_path = await upload(
    client,
    `downloads/${stamp}-Unit-1-specialise-cells.pptx`,
    pptPath,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  );
  const image_path = await upload(
    client,
    `images/${stamp}-unit-1-specialise-cells-cover.png`,
    coverPath,
    "image/png",
  );

  const fields = productFields({ download_path, image_path });
  const { data: existing, error: lookupError } = await client
    .from("shop_products")
    .select("id")
    .eq("slug", SLUG)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);

  if (existing?.id) {
    const { data, error } = await client
      .from("shop_products")
      .update(fields)
      .eq("id", existing.id)
      .select("id, title, price_pence, slug")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, updated: true, product: data };
  }

  const { data, error } = await client
    .from("shop_products")
    .insert([{ ...fields, created_at: new Date().toISOString() }])
    .select("id, title, price_pence, slug")
    .single();
  if (error) throw new Error(error.message);
  return { ok: true, created: true, product: data };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  publishUnit1SpecialiseCells()
    .then((result) => {
      if (result.skipped) {
        console.log(`[shop] skipped publishing "${TITLE}" (${result.reason}).`);
        return;
      }
      console.log(`[shop] published "${result.product.title}" at £${(result.product.price_pence / 100).toFixed(2)} (${result.created ? "created" : "updated"}).`);
    })
    .catch((error) => {
      console.warn(`[shop] publish failed: ${error.message}`);
      process.exitCode = 0;
    });
}
