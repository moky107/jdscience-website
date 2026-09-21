import React, { useEffect, useRef, useState } from "react";
import ShopFileUploadBox from "./AdminShopFileUpload";
import {
  SHOP_EXAM_BOARDS,
  SHOP_LEVELS,
  SHOP_PRODUCT_KINDS,
  SHOP_PRODUCT_TYPES,
  SHOP_SUBJECTS,
  shopProductKindLabel,
  shopProductTypeLabel,
} from "./shopConstants";
import { formatPricePence, penceToPoundsInput, poundsInputToPence } from "./shopFormat";
import { externalButtonLabel, isExternalProduct, isValidProductImageFile, normalizeShopProduct, retailerName } from "./shopProductHelpers";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", maxWidth: "100%", boxSizing: "border-box", minHeight: 48 };
const field = { display: "grid", gap: 6, minWidth: 0 };
const labelStyle = { fontSize: 14, fontWeight: 700, color: "#0f172a" };
const BASE64_UPLOAD_LIMIT = 2.5 * 1024 * 1024;

const EMPTY_FORM = {
  id: null,
  title: "",
  slug: "",
  short_description: "",
  description: "",
  price_pounds: "",
  sale_price_pounds: "",
  product_type: "powerpoint",
  product_kind: "digital",
  level: "",
  subject: "",
  exam_board: "",
  topic: "",
  keywords: "",
  stock_quantity: "",
  is_featured: false,
  is_published: false,
  sort_order: 0,
  image_path: "",
  preview_path: "",
  download_path: "",
  image_url: "",
  preview_url: "",
  download_url: "",
  purchase_method: "jdscience",
  sale_type: "checkout",
  retailer_name: "",
  show_price: true,
  external_url: "",
  external_button_label: "",
  opens_external: false,
  clear_image: false,
  clear_preview: false,
  clear_download: false,
};

function keywordsToInput(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "";
}

function Field({ label, children }) {
  return (
    <label style={field}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

export default function AdminShopEditor({ password }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const formRef = useRef(null);

  async function request(endpoint, payload) {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...payload }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const err = new Error(data?.error || "Request failed");
      err.setupRequired = Boolean(data?.setupRequired);
      err.status = resp.status;
      err.duplicates = data?.duplicates || [];
      err.requiresConfirmation = Boolean(data?.requires_confirmation);
      throw err;
    }
    return data;
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [productData, orderData] = await Promise.all([
        request("/api/admin-shop-products", { action: "shop-list" }),
        request("/api/admin-shop-orders", { action: "shop-orders" }),
      ]);
      setProducts(productData.products || []);
      setOrders(orderData.orders || []);
      setSetupRequired(Boolean(productData.setupRequired || orderData.setupRequired));
    } catch (err) {
      setError(err.message || "Failed to load shop data.");
      setSetupRequired(Boolean(err.setupRequired));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (password) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  function setField(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "purchase_method" || key === "sale_type") {
        const method = key === "purchase_method" ? value : (value === "external" ? "external" : "jdscience");
        next.purchase_method = method;
        next.sale_type = method === "external" ? "external" : "checkout";
        next.opens_external = method === "external";
      }
      return next;
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setOriginalSlug("");
    setUploadStatus("");
  }

  function startAddProduct() {
    resetForm();
    setFormOpen(true);
    setMessage("Add a new shop product. Fill in the details, upload files, then Save as Draft or Save & Publish.");
    setError("");
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function editProduct(product) {
    const normalized = normalizeShopProduct(product);
    setForm({
      ...EMPTY_FORM,
      ...normalized,
      price_pounds: penceToPoundsInput(normalized.price_pence),
      sale_price_pounds: penceToPoundsInput(normalized.sale_price_pence),
      stock_quantity: normalized.stock_quantity ?? "",
      keywords: keywordsToInput(normalized.keywords),
      topic: normalized.topic || "",
      purchase_method: normalized.purchase_method || (normalized.opens_external ? "external" : "jdscience"),
      sale_type: (normalized.purchase_method || (normalized.opens_external ? "external" : "jdscience")) === "external" ? "external" : "checkout",
      retailer_name: normalized.retailer_name || retailerName(normalized) || "",
      show_price: normalized.show_price !== false,
      is_published: Boolean(normalized.is_published || normalized.published),
      is_featured: Boolean(normalized.is_featured || normalized.featured),
      image_path: normalized.image_path || "",
      preview_path: normalized.preview_path || "",
      download_path: normalized.download_path || "",
      image_url: product.image_url || "",
      preview_url: product.preview_url || "",
      download_url: product.download_url || "",
      clear_image: false,
      clear_preview: false,
      clear_download: false,
    });
    setOriginalSlug(normalized.slug || "");
    setFormOpen(true);
    setMessage(`Editing “${normalized.title}”. Change only the fields you need, then save.`);
    setError("");
    setUploadStatus("");
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function uploadViaSignedUrl(file, folder) {
    const prepared = await request("/api/admin-shop-products", {
      action: "shop-prepare-upload",
      folder,
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    });
    const put = await fetch(prepared.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        ...(prepared.token ? { "x-upsert": "false" } : {}),
      },
      body: file,
    });
    if (!put.ok) {
      const text = await put.text().catch(() => "");
      throw new Error(text || `Direct upload failed (${put.status}).`);
    }
    const completed = await request("/api/admin-shop-products", {
      action: "shop-complete-upload",
      path: prepared.path,
    });
    return { path: prepared.path, url: completed.url || "" };
  }

  async function uploadViaBase64(file, folder) {
    const data = await request("/api/admin-shop-products", {
      action: "shop-upload",
      folder,
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      base64: await fileToBase64(file),
    });
    if (!data?.path) throw new Error("Upload succeeded but no file path was returned.");
    return data;
  }

  async function uploadFile(file, folder, field) {
    if (!file) return null;
    const clearKey = field === "image_path" ? "clear_image" : field === "preview_path" ? "clear_preview" : "clear_download";
    const urlKey = field === "image_path" ? "image_url" : field === "preview_path" ? "preview_url" : "download_url";
    const previousPath = form[field];
    const previousUrl = form[urlKey];
    setUploadingField(field);
    setUploadStatus(`uploading ${file.name}…`);
    setError("");
    try {
      const data = file.size > BASE64_UPLOAD_LIMIT
        ? await uploadViaSignedUrl(file, folder)
        : await uploadViaBase64(file, folder).catch(async (err) => {
          // Fall back to signed upload if the API body limit rejects the file.
          if (/too large|413|payload|entity too large|network/i.test(String(err.message || ""))) {
            return uploadViaSignedUrl(file, folder);
          }
          throw err;
        });
      setForm((current) => ({
        ...current,
        [field]: data.path,
        [urlKey]: data.url || current[urlKey] || "",
        [clearKey]: false,
      }));
      setUploadStatus(`ok → ${data.path}`);
      setMessage(`${labelForField(field)} uploaded. Remember to save the product to keep this file.`);
      return data;
    } catch (err) {
      setForm((current) => ({
        ...current,
        [field]: previousPath,
        [urlKey]: previousUrl,
        [clearKey]: false,
      }));
      setUploadStatus(`error: ${err.message || "Upload failed."}`);
      setError(err.message || "Upload failed. The previous file was kept.");
      throw err;
    } finally {
      setUploadingField("");
    }
  }

  function labelForField(field) {
    if (field === "image_path") return "Cover image";
    if (field === "preview_path") return "Preview file";
    return "Customer download";
  }

  function removeAsset(field) {
    const publishedDigital = form.is_published && form.product_kind === "digital" && (form.purchase_method || form.sale_type) !== "external";
    if (field === "download_path" && publishedDigital) {
      const confirmed = window.confirm("This is a published digital product. Removing the download file will stop customers receiving the file after purchase. Continue?");
      if (!confirmed) return;
    }
    const clearKey = field === "image_path" ? "clear_image" : field === "preview_path" ? "clear_preview" : "clear_download";
    const urlKey = field === "image_path" ? "image_url" : field === "preview_path" ? "preview_url" : "download_url";
    setForm((current) => ({
      ...current,
      [field]: "",
      [urlKey]: "",
      [clearKey]: true,
    }));
    setMessage(`${labelForField(field)} will be removed when you save.`);
  }

  function validatePreviewFile(file) {
    if (!file) return { ok: false, error: "Choose a preview file." };
    const type = String(file.type || "").toLowerCase();
    const name = String(file.name || "").toLowerCase();
    if (type.startsWith("image/") || type === "application/pdf") return { ok: true };
    if (/\.(jpe?g|png|webp|gif|pdf)$/.test(name)) return { ok: true };
    return { ok: false, error: "Preview must be an image or PDF." };
  }

  function validateDownloadFile(file) {
    if (!file) return { ok: false, error: "Choose a download file." };
    const name = String(file.name || "").toLowerCase();
    if (!/\.(pptx?|pdf|docx?|xlsx?|zip)$/.test(name) && file.type) {
      // Still allow other types — helper text lists preferred formats.
      return { ok: true };
    }
    return { ok: true };
  }

  function buildPayload({ publish }) {
    const title = String(form.title || "").trim();
    const price_pence = poundsInputToPence(form.price_pounds);
    const sale_price_pence = poundsInputToPence(form.sale_price_pounds);
    const isExternal = (form.purchase_method || form.sale_type) === "external";
    return {
      title,
      slug: form.slug,
      short_description: form.short_description,
      description: form.description,
      price_pence: Number.isFinite(price_pence) ? price_pence : 0,
      sale_price_pence: Number.isFinite(sale_price_pence) ? sale_price_pence : null,
      product_type: form.product_type,
      product_kind: form.product_kind,
      level: form.level,
      subject: form.subject,
      exam_board: form.exam_board,
      topic: form.topic,
      keywords: form.keywords,
      stock_quantity: form.stock_quantity,
      is_featured: form.is_featured,
      is_published: Boolean(publish),
      sort_order: form.sort_order,
      purchase_method: isExternal ? "external" : "jdscience",
      sale_type: isExternal ? "external" : "checkout",
      opens_external: isExternal,
      retailer_name: form.retailer_name,
      show_price: isExternal ? Boolean(form.show_price) : true,
      external_url: form.external_url,
      external_button_label: isExternal ? externalButtonLabel({ retailer_name: form.retailer_name }) : form.external_button_label,
      image_path: form.image_path || undefined,
      preview_path: form.preview_path || undefined,
      download_path: form.download_path || undefined,
      clear_image: Boolean(form.clear_image),
      clear_preview: Boolean(form.clear_preview),
      clear_download: Boolean(form.clear_download),
    };
  }

  function validateBeforeSave({ publish }) {
    if (uploadingField) {
      setError("Wait for the file upload to finish before saving.");
      return false;
    }
    const title = String(form.title || "").trim();
    if (!title) {
      setError("Product title is required.");
      return false;
    }
    const price_pence = poundsInputToPence(form.price_pounds);
    const sale_price_pence = poundsInputToPence(form.sale_price_pounds);
    const isExternal = (form.purchase_method || form.sale_type) === "external";
    if (!isExternal && (price_pence == null || !Number.isFinite(price_pence) || price_pence < 0)) {
      setError("Enter a valid price in pounds, for example 5.00 or 18.00.");
      return false;
    }
    if (form.sale_price_pounds && !Number.isFinite(sale_price_pence)) {
      setError("Enter a valid sale price in pounds, or leave it blank.");
      return false;
    }
    if (isExternal && !String(form.retailer_name || "").trim()) {
      setError("Enter the retailer name, for example Amazon.");
      return false;
    }
    if (isExternal && !/^https:\/\//i.test(String(form.external_url || "").trim())) {
      setError("External retailer products need a valid https:// URL.");
      return false;
    }
    if (!isExternal && form.product_kind === "digital" && publish && !form.download_path) {
      setError("Add a customer download file before publishing a digital product.");
      return false;
    }
    if (form.id && form.slug && originalSlug && form.slug !== originalSlug && publish) {
      const confirmed = window.confirm(`This product is live. Changing the slug will change its public URL from /shop/${originalSlug} to /shop/${form.slug}. Continue?`);
      if (!confirmed) return false;
    }
    return true;
  }

  async function saveProduct({ publish, forceDuplicate = false }) {
    if (!validateBeforeSave({ publish })) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const action = form.id ? "shop-update" : "shop-create";
      const payload = buildPayload({ publish });
      const saved = await request("/api/admin-shop-products", {
        action,
        id: form.id,
        product: payload,
        force_duplicate: forceDuplicate,
      });
      if (form.id && saved?.product?.id && saved.product.id !== form.id) {
        throw new Error("Update returned a different product. The existing product was not changed.");
      }
      resetForm();
      setFormOpen(false);
      setMessage(publish
        ? (form.id ? "Product updated and published." : "Product created and published.")
        : (form.id ? "Draft product saved." : "Draft product created."));
      await load();
    } catch (err) {
      if (err.requiresConfirmation && Array.isArray(err.duplicates) && err.duplicates.length) {
        const list = err.duplicates.map((item) => `• ${item.title} (/shop/${item.slug})`).join("\n");
        const confirmed = window.confirm(
          `A similar product already exists. Do you still want to continue?\n\n${list}`,
        );
        if (confirmed) {
          setSaving(false);
          await saveProduct({ publish, forceDuplicate: true });
          return;
        }
        setError("Save cancelled — a similar product already exists.");
      } else {
        setError(err.message || "Failed to save product.");
        setSetupRequired(Boolean(err.setupRequired));
      }
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(product) {
    const currentlyPublished = Boolean(product.is_published || product.published);
    const nextPublished = !currentlyPublished;
    if (nextPublished && product.product_kind === "digital" && !isExternalProduct(product) && !product.download_path) {
      setError("Add a customer download file before publishing this digital product.");
      editProduct(product);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await request("/api/admin-shop-products", {
        action: "shop-update",
        id: product.id,
        product: {
          ...product,
          is_published: nextPublished,
          published: nextPublished,
        },
      });
      setMessage(nextPublished ? `Published “${product.title}”.` : `Unpublished “${product.title}”.`);
      await load();
    } catch (err) {
      setError(err.message || "Failed to update publication status.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id, title) {
    if (!window.confirm(`Delete “${title || "this product"}” permanently?\n\nThis cannot be undone. Orders already placed keep their history, but the product will leave the shop.`)) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await request("/api/admin-shop-products", { action: "shop-delete", id });
      if (form.id === id) {
        resetForm();
        setFormOpen(false);
      }
      setMessage("Product deleted.");
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    } finally {
      setSaving(false);
    }
  }

  const typeOptions = [...SHOP_PRODUCT_TYPES];
  if (form.product_type && !typeOptions.some((type) => type.value === form.product_type)) {
    typeOptions.push({ value: form.product_type, label: shopProductTypeLabel(form.product_type) });
  }

  return (
    <div style={{ marginTop: 28, background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 4px 14px rgba(0,0,0,.05)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>Shop management</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            Add, edit, publish and remove shop products yourself — including custom prices and file uploads.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={startAddProduct}
            style={{ padding: "12px 16px", borderRadius: 8, border: "none", background: TEAL, color: "#fff", cursor: "pointer", fontWeight: 800, minHeight: 48 }}
          >
            + Add Product
          </button>
          <button type="button" onClick={load} disabled={loading} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700, minHeight: 44 }}>
            {loading ? "Refreshing…" : "Refresh shop"}
          </button>
        </div>
      </div>

      {setupRequired && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "#fff7ed", color: "#9a3412" }}>
          Run the shop SQL migrations and create the private Storage bucket <code>shop-products</code> before using the shop.
        </div>
      )}
      {error && <div style={{ marginTop: 12, color: "#b91c1c" }}>{error}</div>}
      {message && <div style={{ marginTop: 12, color: "#047857" }}>{message}</div>}

      {formOpen && (
        <div ref={formRef} style={{ marginTop: 18, border: "1px solid #99f6e4", borderRadius: 12, padding: 16, background: "#f0fdfa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, color: TEAL_DARK }}>{form.id ? "Edit product" : "Add product"}</h3>
            {form.id && (
              <div style={{ color: TEAL_DARK, fontWeight: 700, fontSize: 13 }}>
                Editing existing product · ID {form.id}
              </div>
            )}
          </div>

          <form id="shop-product-form" onSubmit={(e) => { e.preventDefault(); saveProduct({ publish: form.is_published }); }} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
              <Field label="Purchase method">
                <select value={form.purchase_method || "jdscience"} onChange={(e) => setField("purchase_method", e.target.value)} style={inp}>
                  <option value="jdscience">Sell directly on JDScience</option>
                  <option value="external">External retailer</option>
                </select>
              </Field>
              <Field label="Product title">
                <input required value={form.title} onChange={(e) => setField("title", e.target.value)} style={inp} />
              </Field>
              <Field label="Slug">
                <input value={form.slug} onChange={(e) => setField("slug", e.target.value)} style={inp} placeholder="Auto-generated from title if blank" />
              </Field>
              <Field label="Price (£)">
                <input
                  type="text"
                  inputMode="decimal"
                  required={(form.purchase_method || form.sale_type) !== "external"}
                  placeholder="e.g. 5.00 or 18.00"
                  value={form.price_pounds}
                  onChange={(e) => setField("price_pounds", e.target.value)}
                  style={inp}
                />
              </Field>
              <Field label="Sale price (£)">
                <input type="text" inputMode="decimal" placeholder="Optional" value={form.sale_price_pounds} onChange={(e) => setField("sale_price_pounds", e.target.value)} style={inp} />
              </Field>
            </div>

            {(form.purchase_method || form.sale_type) === "external" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
                <Field label="Retailer name">
                  <input required list="shop-retailer-names" placeholder="Amazon, Waterstones, Pearson…" value={form.retailer_name} onChange={(e) => setField("retailer_name", e.target.value)} style={inp} />
                  <datalist id="shop-retailer-names">
                    {["Amazon", "Waterstones", "WHSmith", "Etsy", "eBay", "Pearson"].map((name) => <option key={name} value={name} />)}
                  </datalist>
                </Field>
                <Field label="External purchase URL">
                  <input required type="url" placeholder="https://www.amazon.co.uk/…" value={form.external_url} onChange={(e) => setField("external_url", e.target.value)} style={inp} />
                </Field>
                <label style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 48, fontWeight: 700 }}>
                  <input type="checkbox" checked={form.show_price !== false} onChange={(e) => setField("show_price", e.target.checked)} />
                  Show price on JDScience
                </label>
              </div>
            )}

            <Field label="Short description">
              <textarea required rows={2} value={form.short_description} onChange={(e) => setField("short_description", e.target.value)} style={inp} />
            </Field>
            <Field label="Product description">
              <textarea rows={5} value={form.description} onChange={(e) => setField("description", e.target.value)} style={inp} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 12 }}>
              <Field label="Resource type">
                <select value={form.product_type} onChange={(e) => setField("product_type", e.target.value)} style={inp}>
                  {typeOptions.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </Field>
              {(form.purchase_method || form.sale_type) !== "external" && (
                <Field label="Digital or physical">
                  <select value={form.product_kind} onChange={(e) => setField("product_kind", e.target.value)} style={inp}>
                    {SHOP_PRODUCT_KINDS.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Level">
                <select value={form.level} onChange={(e) => setField("level", e.target.value)} style={inp}>
                  <option value="">Optional</option>
                  {SHOP_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </Field>
              <Field label="Subject">
                <select value={form.subject} onChange={(e) => setField("subject", e.target.value)} style={inp}>
                  <option value="">Optional</option>
                  {SHOP_SUBJECTS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </select>
              </Field>
              <Field label="Unit / Topic">
                <input placeholder="e.g. Unit 8" value={form.topic} onChange={(e) => setField("topic", e.target.value)} style={inp} />
              </Field>
              <Field label="Exam board">
                <select value={form.exam_board} onChange={(e) => setField("exam_board", e.target.value)} style={inp}>
                  <option value="">Optional</option>
                  {SHOP_EXAM_BOARDS.map((board) => <option key={board} value={board}>{board}</option>)}
                </select>
              </Field>
              {(form.purchase_method || form.sale_type) !== "external" && form.product_kind === "physical" ? (
                <Field label="Stock">
                  <input type="number" min="0" value={form.stock_quantity} onChange={(e) => setField("stock_quantity", e.target.value)} style={inp} />
                </Field>
              ) : (
                <Field label="Keywords">
                  <input placeholder="Optional, comma separated" value={form.keywords} onChange={(e) => setField("keywords", e.target.value)} style={inp} />
                </Field>
              )}
              <Field label="Sort order">
                <input type="number" value={form.sort_order} onChange={(e) => setField("sort_order", e.target.value)} style={inp} />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setField("is_featured", e.target.checked)} />
                Featured on homepage
              </label>
            </div>
          </form>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16, marginTop: 16 }}>
            <ShopFileUploadBox
              boxKey={`image-${form.id || "new"}`}
              label="Cover image / thumbnail"
              dragHint="Drag and drop a cover image here"
              chooseButtonLabel="Choose image file"
              helperText="PNG, JPG or WebP. Used on the shop card."
              accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
              path={form.image_path}
              previewUrl={form.image_url}
              viewUrl={form.image_url}
              viewLabel="View current image"
              removeLabel="Remove image"
              showImagePreview
              showDebug={Boolean(import.meta.env?.DEV)}
              uploadStatus={uploadingField === "image_path" ? uploadStatus : ""}
              uploading={uploadingField === "image_path"}
              disabled={uploadingField === "image_path"}
              validate={isValidProductImageFile}
              onSelectFile={(file) => uploadFile(file, "images", "image_path")}
              onRemove={() => removeAsset("image_path")}
            />
            <ShopFileUploadBox
              boxKey={`preview-${form.id || "new"}`}
              label="Preview file"
              dragHint="Drag and drop a preview file here"
              chooseButtonLabel="Choose preview file"
              helperText="Optional sample image or PDF. Do not upload the full paid file as the preview."
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
              path={form.preview_path}
              previewUrl={form.preview_url}
              viewUrl={form.preview_url}
              viewLabel="View current preview"
              removeLabel="Remove preview"
              showImagePreview={Boolean(form.preview_url && !String(form.preview_path || "").toLowerCase().endsWith(".pdf"))}
              uploading={uploadingField === "preview_path"}
              disabled={uploadingField === "preview_path"}
              validate={validatePreviewFile}
              onSelectFile={(file) => uploadFile(file, "previews", "preview_path")}
              onRemove={() => removeAsset("preview_path")}
            />
            {(form.purchase_method || form.sale_type) !== "external" && form.product_kind === "digital" && (
              <ShopFileUploadBox
                boxKey={`download-${form.id || "new"}`}
                label="Main downloadable product file"
                dragHint="Drag and drop the customer file here"
                chooseButtonLabel="Choose download file"
                helperText="Paid file customers receive after Stripe checkout (.pptx, .pdf, .docx, .xlsx, .zip)."
                accept=".pptx,.ppt,.pdf,.docx,.doc,.xlsx,.xls,.zip,application/pdf,application/zip,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                path={form.download_path}
                viewUrl={form.download_url}
                viewLabel="Download / test current file"
                removeLabel="Remove download"
                uploading={uploadingField === "download_path"}
                disabled={uploadingField === "download_path"}
                validate={validateDownloadFile}
                onSelectFile={(file) => uploadFile(file, "downloads", "download_path")}
                onRemove={() => removeAsset("download_path")}
              />
            )}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button
              type="button"
              disabled={saving || Boolean(uploadingField)}
              onClick={() => saveProduct({ publish: false })}
              style={{ padding: "12px 16px", minHeight: 48, borderRadius: 8, border: `1px solid ${TEAL}`, background: "#fff", color: TEAL_DARK, fontWeight: 800, cursor: saving || uploadingField ? "default" : "pointer" }}
            >
              {saving ? "Saving…" : "Save as Draft"}
            </button>
            <button
              type="button"
              disabled={saving || Boolean(uploadingField)}
              onClick={() => saveProduct({ publish: true })}
              style={{ padding: "12px 16px", minHeight: 48, borderRadius: 8, border: "none", background: saving || uploadingField ? "#94a3b8" : TEAL, color: "#fff", fontWeight: 800, cursor: saving || uploadingField ? "default" : "pointer" }}
            >
              {saving ? "Saving…" : (form.id ? "Update & Publish" : "Save & Publish")}
            </button>
            <button
              type="button"
              onClick={() => { resetForm(); setFormOpen(false); setMessage(""); }}
              style={{ padding: "12px 16px", minHeight: 48, borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 700 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>Products ({products.length})</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {products.map((product) => {
            const published = Boolean(product.is_published || product.published);
            return (
              <div key={product.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0, flex: "1 1 240px" }}>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>{product.title}</div>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 4, wordBreak: "break-word" }}>
                    {isExternalProduct(product)
                      ? `${shopProductTypeLabel(product.product_type) || "Product"} · ${retailerName(product) || "Retailer"} · External purchase`
                      : `${formatPricePence(product.effective_price_pence ?? product.price_pence)} · ${shopProductTypeLabel(product.product_type)} · JDScience checkout`}
                    {product.level ? ` · ${product.level}` : ""}
                    {product.subject ? ` · ${product.subject}` : ""}
                    {product.topic ? ` · ${product.topic}` : ""}
                    {published ? " · Published" : " · Draft"}
                    {(product.is_featured || product.featured) ? " · Featured" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => editProduct(product)} style={{ padding: "8px 12px", minHeight: 44, borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 700 }}>Edit</button>
                  {product.slug && (
                    <a
                      href={`/shop/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "8px 12px", minHeight: 44, borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", textDecoration: "none", color: "#0f172a" }}
                    >
                      Preview
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => togglePublish(product)}
                    disabled={saving}
                    style={{ padding: "8px 12px", minHeight: 44, borderRadius: 8, border: `1px solid ${TEAL}`, background: published ? "#fff" : TEAL, color: published ? TEAL_DARK : "#fff", cursor: "pointer", fontWeight: 700 }}
                  >
                    {published ? "Unpublish" : "Publish"}
                  </button>
                  <button type="button" onClick={() => removeProduct(product.id, product.title)} style={{ padding: "8px 12px", minHeight: 44, borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#b91c1c", cursor: "pointer", fontWeight: 700 }}>Delete</button>
                </div>
              </div>
            );
          })}
          {!loading && products.length === 0 && (
            <div style={{ color: "#64748b", padding: 12 }}>No products yet. Click + Add Product to create the first one.</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>Recent orders ({orders.length})</h3>
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr>
                {["Date", "Customer", "Email", "Total", "Payment", "Items"].map((label) => (
                  <th key={label} style={{ textAlign: "left", padding: "8px 10px", fontSize: 12, color: "#64748b", borderBottom: "2px solid #e2e8f0" }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ padding: "10px", borderBottom: "1px solid #eef2f7", fontSize: 13 }}>{new Date(order.created_at).toLocaleString("en-GB")}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #eef2f7", fontSize: 13 }}>{order.customer_name || "—"}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #eef2f7", fontSize: 13 }}>{order.customer_email}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #eef2f7", fontSize: 13 }}>{formatPricePence(order.total_pence)}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #eef2f7", fontSize: 13 }}>{order.payment_status}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #eef2f7", fontSize: 13 }}>{Array.isArray(order.items) ? order.items.map((item) => item.title).join(", ") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
