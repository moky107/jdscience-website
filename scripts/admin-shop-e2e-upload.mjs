/**
 * End-to-end Admin Shop upload workflow against live Supabase Storage + shop_products.
 * Mirrors AdminShopEditor: signed upload → create → draft → publish → edit → duplicate warn → public list.
 *
 * AUTH SAFETY: This script must NEVER call supabase.auth.admin.* or change any
 * Auth user password/email. It uses the service role only for shop_products /
 * storage product files. For UI login e2e, use a disposable test account or a
 * local ADMIN_PASSWORD API gate — never the production admin Auth password.
 * See scripts/authSafety.mjs.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  SHOP_STORAGE_BUCKET,
  buildShopStoragePath,
  findLikelyShopDuplicates,
  normalizeProductInput,
  persistShopProductRow,
  slugifyProductTitle,
} from "../api/_lib/shop.js";
import { FORBIDDEN_SCRIPT_AUTH_PATTERNS } from "./authSafety.mjs";

// Fail fast if this file is later edited to include Auth Admin mutations.
const selfSrc = fs.readFileSync(new URL(import.meta.url), "utf8");
for (const pattern of FORBIDDEN_SCRIPT_AUTH_PATTERNS) {
  // Ignore this guard block's own pattern references by requiring "supabase." prefix usage.
  if (/supabase\.auth\.admin\.(updateUserById|createUser|deleteUser|generateLink)\s*\(/.test(selfSrc)) {
    console.error("admin-shop-e2e-upload.mjs must not call Auth Admin mutation APIs.");
    process.exit(1);
  }
}
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(supabaseUrl, serviceRoleKey);
const results = [];
const createdIds = [];

function ok(name, detail = "") {
  results.push({ name, pass: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail = "") {
  results.push({ name, pass: false, detail });
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function signedUpload(folder, filePath, contentType) {
  const filename = path.basename(filePath);
  const storagePath = buildShopStoragePath(folder, filename);
  const bytes = fs.readFileSync(filePath);
  const { data, error } = await sb.storage.from(SHOP_STORAGE_BUCKET).createSignedUploadUrl(storagePath);
  if (error) throw error;
  const put = await fetch(data.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType, "x-upsert": "false" },
    body: bytes,
  });
  if (!put.ok) throw new Error(`PUT ${storagePath} failed: ${put.status} ${await put.text()}`);
  return storagePath;
}

async function assertPrivate(pathName) {
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${SHOP_STORAGE_BUCKET}/${pathName}`;
  const resp = await fetch(publicUrl);
  if (resp.ok) throw new Error(`Paid file is publicly readable: ${pathName}`);
}

async function main() {
  const docx = "/tmp/shop-e2e/JDScience_Unit_8C_Distinction_Exemplar.docx";
  const pptx = "/tmp/shop-e2e/Unit8_PowerPoint_Admin_Test.pptx";
  const thumb = "/tmp/shop-e2e/unit8-thumb.png";
  const preview = "/tmp/shop-e2e/unit8-preview.pdf";
  for (const f of [docx, pptx, thumb, preview]) {
    if (!fs.existsSync(f)) throw new Error(`Missing test file ${f}`);
  }

  // 1) Upload Unit 8 exemplar + thumb + preview (separate paths)
  const downloadPath = await signedUpload(
    "downloads",
    docx,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  const imagePath = await signedUpload("images", thumb, "image/png");
  const previewPath = await signedUpload("previews", preview, "application/pdf");
  ok("signed upload docx/thumb/preview", `${downloadPath}`);

  await assertPrivate(downloadPath);
  ok("paid download not publicly readable");

  // 2) Duplicate check against existing products
  const { data: existing } = await sb.from("shop_products").select("id, title, slug, subject, download_path");
  const dupTitle = "BTEC Level 3 Unit 8 Sample Assignment (Admin Test)";
  const dups = findLikelyShopDuplicates(existing || [], {
    title: dupTitle,
    slug: slugifyProductTitle(dupTitle),
    filename: path.basename(docx),
  });
  if (!dups.length) fail("duplicate detection", "expected match for existing Admin Test title");
  else ok("duplicate detection", `matched ${dups.length}: ${dups[0].reasons.join(",")}`);

  // 3) Create published £18 Unit 8C exemplar (force after warning path)
  const unit8Title = "BTEC Level 3 Unit 8C Distinction Exemplar (Admin Upload Test)";
  const unit8 = normalizeProductInput({
    title: unit8Title,
    description:
      "Original BTEC Level 3 Applied Science Unit 8C Distinction-level sample assignment / exemplar for teaching and assessment practice.",
    short_description: "Unit 8C Distinction exemplar for Applied Science.",
    product_type: "sample_assignment",
    level: "BTEC Level 3",
    subject: "Applied Science",
    topic: "Unit 8",
    exam_board: "Pearson",
    price_pence: 1800,
    product_kind: "digital",
    is_digital: true,
    is_published: true,
    published: true,
    image_path: imagePath,
    preview_path: previewPath,
    download_path: downloadPath,
  });
  if (!unit8.ok) throw new Error(unit8.error);
  const insert1 = await persistShopProductRow(sb, { mode: "insert", fields: {
    ...unit8.fields,
    slug: slugifyProductTitle(unit8Title),
    is_featured: false,
    featured: false,
    sort_order: 0,
    created_at: new Date().toISOString(),
  }});
  if (insert1.error) throw insert1.error;
  createdIds.push(insert1.data.id);
  ok("create £18 Unit 8C exemplar published", `id=${insert1.data.id} price=${insert1.data.price_pence}`);

  // 4) Draft without download
  const draftTitle = "Admin Draft Product (no file yet)";
  const draft = normalizeProductInput({
    title: draftTitle,
    description: "Draft only — no download yet.",
    product_type: "pdf",
    level: "BTEC Level 3",
    subject: "Applied Science",
    price_pence: 500,
    product_kind: "digital",
    is_published: false,
    published: false,
  });
  if (!draft.ok) throw new Error(draft.error);
  // Publishing without download should fail validation when is_published true —
  // drafts without download are allowed by normalize when not published.
  const insertDraft = await persistShopProductRow(sb, {
    mode: "insert",
    fields: {
      ...draft.fields,
      slug: slugifyProductTitle(draftTitle) + "-" + Date.now(),
      is_featured: false,
      featured: false,
      sort_order: 0,
      created_at: new Date().toISOString(),
    },
  });
  if (insertDraft.error) throw insertDraft.error;
  createdIds.push(insertDraft.data.id);
  ok("save draft without download", insertDraft.data.id);

  // 5) £5 PowerPoint
  const pptPath = await signedUpload(
    "downloads",
    pptx,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  );
  const pptTitle = "BTEC Level 3 Unit 8 Teaching PowerPoint (Admin Upload Test)";
  const ppt = normalizeProductInput({
    title: pptTitle,
    description: "Teaching PowerPoint for BTEC Level 3 Applied Science Unit 8.",
    product_type: "powerpoint",
    level: "BTEC Level 3",
    subject: "Applied Science",
    topic: "Unit 8",
    exam_board: "Pearson",
    price_pence: 500,
    product_kind: "digital",
    is_published: true,
    published: true,
    image_path: imagePath,
    download_path: pptPath,
  });
  if (!ppt.ok) throw ppt.error;
  const insertPpt = await persistShopProductRow(sb, {
    mode: "insert",
    fields: {
      ...ppt.fields,
      slug: slugifyProductTitle(pptTitle),
      is_featured: false,
      featured: false,
      sort_order: 0,
      created_at: new Date().toISOString(),
    },
  });
  if (insertPpt.error) throw insertPpt.error;
  createdIds.push(insertPpt.data.id);
  ok("create £5 PowerPoint published", `price=${insertPpt.data.price_pence}`);

  // 6) Edit price + unpublish + republish
  const edited = await persistShopProductRow(sb, {
    mode: "update",
    id: insertPpt.data.id,
    fields: { price_pence: 500, is_published: false, published: false, updated_at: new Date().toISOString() },
  });
  if (edited.error) throw edited.error;
  ok("unpublish PowerPoint");
  const republished = await persistShopProductRow(sb, {
    mode: "update",
    id: insertPpt.data.id,
    fields: { is_published: true, published: true, updated_at: new Date().toISOString() },
  });
  if (republished.error) throw republished.error;
  ok("republish PowerPoint");

  // 7) Public API via production
  const publicResp = await fetch("https://www.jdscience.co.uk/api/shop-products");
  const publicJson = await publicResp.json();
  const titles = (publicJson.products || []).map((p) => p.title);
  const u8 = (publicJson.products || []).find((p) => p.title === unit8Title);
  const pptPublic = (publicJson.products || []).find((p) => p.title === pptTitle);
  const draftPublic = (publicJson.products || []).find((p) => p.title === draftTitle);
  if (u8?.price_pence === 1800) ok("public shop shows £18.00 Unit 8C", u8.slug);
  else fail("public shop £18 Unit 8C", JSON.stringify(u8));
  if (pptPublic?.price_pence === 500) ok("public shop shows £5.00 PowerPoint", pptPublic.slug);
  else fail("public shop £5 PowerPoint", JSON.stringify(pptPublic));
  if (!draftPublic) ok("draft hidden from public shop");
  else fail("draft leaked to public shop");

  // 8) Stripe checkout session (production API) for £18 product
  if (u8?.id) {
    const checkout = await fetch("https://www.jdscience.co.uk/api/create-shop-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin Upload Test",
          email: "admin-upload-test@jdscience.co.uk",
          accept_terms: true,
          terms_version: "1.1",
          items: [{ product_id: u8.id, quantity: 1 }],
        }),
    });
    const checkoutJson = await checkout.json().catch(() => ({}));
    if (checkout.ok && (checkoutJson.url || checkoutJson.sessionId || checkoutJson.id)) {
      ok("Stripe checkout session for £18 product", checkoutJson.url || checkoutJson.sessionId || checkoutJson.id);
    } else {
      fail("Stripe checkout", `${checkout.status} ${JSON.stringify(checkoutJson).slice(0, 300)}`);
    }
  }

  // 9) Signed download path exists for purchaser delivery
  const { data: signed, error: signedErr } = await sb.storage
    .from(SHOP_STORAGE_BUCKET)
    .createSignedUrl(downloadPath, 60);
  if (signedErr || !signed?.signedUrl) fail("purchaser signed download URL", signedErr?.message);
  else {
    const head = await fetch(signed.signedUrl, { method: "GET" });
    if (head.ok) ok("purchaser can fetch paid file via signed URL", `${(await head.arrayBuffer()).byteLength} bytes`);
    else fail("purchaser signed download fetch", String(head.status));
  }

  console.log("\n--- summary ---");
  console.log(`created product ids: ${createdIds.join(", ")}`);
  console.log(`passed: ${results.filter((r) => r.pass).length}/${results.length}`);
  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    console.error(failed);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
