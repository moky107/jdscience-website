import {
  classifyResourceProductType,
  cleanShopTitle,
  isCopyableTeachingResource,
  productTypeLabelForCopy,
  resourceFileExtension,
} from "../../src/resourceShopClassify.js";
import {
  persistShopProductRow,
  SHOP_PRODUCT_TYPES,
  SHOP_STORAGE_BUCKET,
  slugifyProductTitle,
  toAdminProduct,
  attachProductAssetUrls,
} from "./shop.js";
import { safeTrim } from "./tutors.js";

const RESOURCES_BUCKET = "resources";
const MAX_BYTES = 25 * 1024 * 1024;

const CONTENT_TYPES = {
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export {
  classifyResourceProductType,
  cleanShopTitle,
  isCopyableTeachingResource,
  productTypeLabelForCopy,
  resourceFileExtension,
};

export function shopLevelFromResource(level) {
  const raw = String(level || "").trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("11")) return "11+";
  if (lower.includes("gcse") || lower.includes("igcse")) return "GCSE/IGCSE";
  if (lower.includes("a-level") || lower === "alevel" || lower === "a level") return "A Level";
  if (lower.includes("btec") && lower.includes("3")) return "BTEC Level 3";
  if (lower.includes("btec")) return "BTEC";
  if (lower.includes("t-level") || lower === "tlevel" || lower === "t level") return "T Level";
  return raw;
}

export function buildCopyProductFields(resource, { price_pence, product_type, download_path, image_path, preview_path }) {
  const type = product_type || classifyResourceProductType(resource);
  if (!SHOP_PRODUCT_TYPES.has(type)) {
    return { ok: false, error: `Unsupported product type: ${type}` };
  }
  if (price_pence === "" || price_pence == null) {
    return { ok: false, error: "Enter a price before publishing to the Shop." };
  }
  const price = Math.round(Number(price_pence));
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: "Enter a valid price before publishing to the Shop." };
  }

  const title = cleanShopTitle(resource);
  const typeLabel = productTypeLabelForCopy(type);
  const subject = safeTrim(resource.subject, 80) || null;
  const level = shopLevelFromResource(resource.level);
  const examBoard = safeTrim(resource.exam_board, 40) || null;
  const short = [
    subject,
    level,
    typeLabel,
    examBoard && examBoard !== "N/A" ? examBoard : null,
  ].filter(Boolean).join(" · ").slice(0, 400);

  const description = [
    `${title} is an original JDScience ${typeLabel.toLowerCase()}`,
    subject ? `for ${subject}` : null,
    level ? `(${level})` : null,
    examBoard && examBoard !== "N/A" ? `aligned to ${examBoard}` : null,
    ". Instant digital download after purchase.",
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

  const baseSlug = slugifyProductTitle(title);
  const slug = `${baseSlug}-${resource.id}`.replace(/-+/g, "-").slice(0, 80);

  return {
    ok: true,
    fields: {
      slug,
      title,
      short_description: short || `${typeLabel} from JDScience`,
      description,
      price_pence: price,
      sale_price_pence: null,
      product_type: type,
      product_kind: "digital",
      level,
      subject,
      exam_board: examBoard,
      keywords: [
        "JDScience",
        typeLabel,
        subject,
        level,
        examBoard,
        cleanShopTitle({ title: resource.file_name || "" }),
      ].filter(Boolean),
      image_path: image_path || null,
      preview_path: preview_path || null,
      download_path,
      stock_quantity: null,
      is_featured: false,
      featured: false,
      is_published: true,
      published: true,
      sort_order: 100,
      opens_external: false,
      purchase_method: "jdscience",
      retailer_name: null,
      show_price: true,
      external_url: null,
      external_button_label: "Buy now",
      source_resource_id: Number(resource.id),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  };
}

async function downloadResourceBytes(supabase, resource) {
  if (resource.storage_path) {
    const { data, error } = await supabase.storage.from(RESOURCES_BUCKET).download(resource.storage_path);
    if (!error && data) {
      const buffer = Buffer.from(await data.arrayBuffer());
      if (buffer.length) {
        return {
          ok: true,
          buffer,
          contentType: CONTENT_TYPES[resourceFileExtension(resource)] || resource.file_type || "application/octet-stream",
        };
      }
    }
  }

  const url = safeTrim(resource.file_url || resource.file_url_override, 2000);
  if (!url) return { ok: false, error: "Resource has no downloadable file URL or storage path." };

  const absolute = url.startsWith("http")
    ? url
    : `https://www.jdscience.co.uk${url.startsWith("/") ? url : `/${url}`}`;

  const resp = await fetch(absolute);
  if (!resp.ok) {
    return { ok: false, error: `Could not download resource file (HTTP ${resp.status}).` };
  }
  const arrayBuffer = await resp.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (!buffer.length) return { ok: false, error: "Downloaded resource file is empty." };
  const contentType = resp.headers.get("content-type")
    || CONTENT_TYPES[resourceFileExtension(resource)]
    || "application/octet-stream";
  return { ok: true, buffer, contentType };
}

async function uploadShopDownload(supabase, resource, buffer, contentType) {
  if (buffer.length > MAX_BYTES) {
    return { ok: false, error: `File is too large for Shop upload (max 25 MB; got ${(buffer.length / (1024 * 1024)).toFixed(1)} MB).` };
  }
  const ext = resourceFileExtension(resource) || "bin";
  const safeName = cleanShopTitle({ title: resource.file_name || `resource-${resource.id}.${ext}` })
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(0, 80) || `resource-${resource.id}.${ext}`;
  const path = `downloads/${Date.now()}-${safeName}.${ext}`.replace(/\.+/g, ".").replace(/\.-/g, "-");
  const { error } = await supabase.storage.from(SHOP_STORAGE_BUCKET).upload(path, buffer, {
    contentType: contentType || "application/octet-stream",
    upsert: false,
  });
  if (error) return { ok: false, error: error.message || "Shop storage upload failed." };
  return { ok: true, path };
}

export async function findShopProductForResource(supabase, resourceId) {
  const id = Number(resourceId);
  if (!Number.isFinite(id)) return null;
  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .eq("source_resource_id", id)
    .maybeSingle();
  if (error) {
    if (/source_resource_id|column .* does not exist/i.test(error.message || "")) {
      return { schemaMissing: true };
    }
    throw error;
  }
  return data || null;
}

export async function copyResourceToShop(supabase, {
  resourceId,
  price_pence,
  product_type,
  publish = true,
}) {
  if (price_pence === "" || price_pence == null) {
    return { ok: false, status: 400, error: "Enter a price before publishing to the Shop." };
  }

  const id = Number(resourceId);
  if (!Number.isFinite(id)) {
    return { ok: false, status: 400, error: "A valid resource id is required." };
  }

  const { data: resource, error: loadError } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (loadError) throw loadError;
  if (!resource) return { ok: false, status: 404, error: "Resource not found." };

  if (!isCopyableTeachingResource(resource)) {
    return {
      ok: false,
      status: 400,
      error: "Only JDScience teaching files (.ppt, .pptx, .pdf, .doc, .docx) outside past papers can be copied to the Shop.",
    };
  }

  const existing = await findShopProductForResource(supabase, id);
  if (existing?.schemaMissing) {
    return {
      ok: false,
      status: 500,
      error: "Shop is missing source_resource_id. Run migration 20260830_shop_source_resource.sql in Supabase.",
    };
  }
  if (existing?.id) {
    const withAssets = await attachProductAssetUrls(supabase, existing, { includeDownload: true });
    return {
      ok: true,
      skipped: true,
      reason: "already_in_shop",
      product: toAdminProduct(withAssets),
      error: "This resource is already in the Shop. Duplicate copy blocked.",
    };
  }

  const downloaded = await downloadResourceBytes(supabase, resource);
  if (!downloaded.ok) return { ok: false, status: 400, error: downloaded.error };

  const uploaded = await uploadShopDownload(supabase, resource, downloaded.buffer, downloaded.contentType);
  if (!uploaded.ok) return { ok: false, status: 400, error: uploaded.error };

  const built = buildCopyProductFields(resource, {
    price_pence,
    product_type: product_type || classifyResourceProductType(resource),
    download_path: uploaded.path,
    image_path: null,
    preview_path: null,
  });
  if (!built.ok) return { ok: false, status: 400, error: built.error };

  const fields = {
    ...built.fields,
    is_published: publish !== false,
    published: publish !== false,
  };

  const { data, error } = await persistShopProductRow(supabase, { mode: "insert", fields });
  if (error) {
    if (/duplicate key|unique|source_resource_id/i.test(error.message || "")) {
      const again = await findShopProductForResource(supabase, id);
      if (again?.id) {
        const withAssets = await attachProductAssetUrls(supabase, again, { includeDownload: true });
        return {
          ok: true,
          skipped: true,
          reason: "already_in_shop",
          product: toAdminProduct(withAssets),
          error: "This resource is already in the Shop. Duplicate copy blocked.",
        };
      }
    }
    throw error;
  }

  const { data: stillThere, error: confirmError } = await supabase
    .from("resources")
    .select("id, title, storage_path, file_url, published")
    .eq("id", id)
    .maybeSingle();
  if (confirmError) throw confirmError;
  if (!stillThere) {
    return { ok: false, status: 500, error: "Copy aborted: original resource disappeared unexpectedly." };
  }

  const withAssets = await attachProductAssetUrls(supabase, data, { includeDownload: true });
  return {
    ok: true,
    created: true,
    product: toAdminProduct(withAssets),
    resource: stillThere,
  };
}

export async function copyResourcesToShopBulk(supabase, items) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    return { ok: false, status: 400, error: "Select at least one resource." };
  }
  const results = [];
  for (const item of list) {
    try {
      const result = await copyResourceToShop(supabase, {
        resourceId: item.resource_id ?? item.id,
        price_pence: item.price_pence,
        product_type: item.product_type,
        publish: item.publish !== false,
      });
      results.push({
        resource_id: Number(item.resource_id ?? item.id),
        ...result,
      });
    } catch (err) {
      results.push({
        resource_id: Number(item.resource_id ?? item.id),
        ok: false,
        status: 500,
        error: String(err?.message || err).slice(0, 240),
      });
    }
  }
  const created = results.filter((r) => r.created).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.ok && !r.skipped).length;
  return {
    ok: failed === 0,
    created,
    skipped,
    failed,
    results,
  };
}
