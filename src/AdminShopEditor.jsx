import React, { useEffect, useState } from "react";
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
import { formatPricePence } from "./shopFormat";
import { isExternalProduct, isValidProductImageFile, normalizeShopProduct } from "./shopProductHelpers";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box" };

const EMPTY_FORM = {
  id: null,
  title: "",
  slug: "",
  short_description: "",
  description: "",
  price_pence: "",
  sale_price_pence: "",
  product_type: "revision_notes",
  product_kind: "digital",
  level: "",
  subject: "",
  exam_board: "",
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
  sale_type: "checkout",
  external_url: "",
  external_button_label: "Buy now",
  opens_external: false,
};

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [uploadingField, setUploadingField] = useState("");

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
      if (key === "sale_type") {
        next.opens_external = value === "external";
      }
      if (key === "is_featured" && value) {
        next.is_published = true;
      }
      return next;
    });
  }

  function editProduct(product) {
    const normalized = normalizeShopProduct(product);
    setForm({
      ...EMPTY_FORM,
      ...normalized,
      price_pence: normalized.price_pence ?? "",
      sale_price_pence: normalized.sale_price_pence ?? "",
      stock_quantity: normalized.stock_quantity ?? "",
      sale_type: normalized.opens_external ? "external" : "checkout",
      is_published: Boolean(normalized.is_published || normalized.published),
      is_featured: Boolean(normalized.is_featured || normalized.featured),
      image_url: product.image_url || "",
      preview_url: product.preview_url || "",
    });
    setMessage("");
    setError("");
  }

  async function uploadFile(file, folder, field) {
    if (!file) return null;
    const productId = form.id;
    setUploadingField(field);
    setError("");
    try {
      const data = await request("/api/admin-shop-products", {
        action: "shop-upload",
        folder,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        base64: await fileToBase64(file),
      });
      const productData = await request("/api/admin-shop-products", { action: "shop-list" });
      const refreshedProducts = productData.products || [];
      setProducts(refreshedProducts);
      const updated = productId ? refreshedProducts.find((item) => item.id === productId) : null;
      setForm((current) => ({
        ...current,
        [field]: data.path,
        ...(field === "image_path" ? { image_url: updated?.image_url || "" } : {}),
        ...(field === "preview_path" ? { preview_url: updated?.preview_url || "" } : {}),
      }));
      setMessage(`${field.replace(/_/g, " ")} uploaded.`);
      return data;
    } catch (err) {
      setError(err.message || "Upload failed.");
      throw err;
    } finally {
      setUploadingField("");
    }
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
    return { ok: true };
  }

  async function save(e) {
    e.preventDefault();
    if (uploadingField) {
      setError("Wait for the file upload to finish before saving.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const action = form.id ? "shop-update" : "shop-create";
      const payload = {
        ...form,
        opens_external: form.sale_type === "external",
        sale_type: form.sale_type,
      };
      if (form.sale_type === "external" && !/^https:\/\/.+/i.test(String(form.external_url || "").trim())) {
        throw new Error("External link products need a valid https:// URL.");
      }
      await request("/api/admin-shop-products", {
        action,
        id: form.id,
        product: payload,
      });
      setForm(EMPTY_FORM);
      setMessage(form.id ? "Product updated." : "Product created.");
      await load();
    } catch (err) {
      setError(err.message || "Failed to save product.");
      setSetupRequired(Boolean(err.setupRequired));
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id) {
    if (!window.confirm("Delete this product permanently?")) return;
    setSaving(true);
    setError("");
    try {
      await request("/api/admin-shop-products", { action: "shop-delete", id });
      if (form.id === id) setForm(EMPTY_FORM);
      setMessage("Product deleted.");
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 28, background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 4px 14px rgba(0,0,0,.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>Shop management</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>Add products, upload files, manage stock and review orders.</p>
        </div>
        <button type="button" onClick={load} disabled={loading} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700 }}>
          {loading ? "Refreshing…" : "Refresh shop"}
        </button>
      </div>

      {setupRequired && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "#fff7ed", color: "#9a3412" }}>
          Run <code>supabase/migrations/20260829_shop.sql</code>, <code>supabase/migrations/20260829_shop_external_links.sql</code>, <code>supabase/migrations/20260829_shop_publish_sync.sql</code> and create the private Storage bucket <code>shop-products</code> before using the shop.
        </div>
      )}
      {error && <div style={{ marginTop: 12, color: "#b91c1c" }}>{error}</div>}
      {message && <div style={{ marginTop: 12, color: "#047857" }}>{message}</div>}

      <form id="shop-product-form" onSubmit={save} style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 700 }}>
            Product sale type
            <select value={form.sale_type || "checkout"} onChange={(e) => setField("sale_type", e.target.value)} style={inp}>
              <option value="checkout">JDScience checkout</option>
              <option value="external">External link</option>
            </select>
          </label>
          <input required placeholder="Product title" value={form.title} onChange={(e) => setField("title", e.target.value)} style={inp} />
          <input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setField("slug", e.target.value)} style={inp} />
          <input type="number" min="0" required={form.sale_type === "checkout"} placeholder={form.sale_type === "external" ? "Price (pence, optional)" : "Price (pence)"} value={form.price_pence} onChange={(e) => setField("price_pence", e.target.value)} style={inp} />
          <input type="number" min="0" placeholder="Sale price (pence, optional)" value={form.sale_price_pence} onChange={(e) => setField("sale_price_pence", e.target.value)} style={inp} />
        </div>
        {form.sale_type === "external" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <input required type="url" placeholder="External URL (https://…)" value={form.external_url} onChange={(e) => setField("external_url", e.target.value)} style={inp} />
            <input required placeholder="Button label, e.g. Buy on Amazon" value={form.external_button_label} onChange={(e) => setField("external_button_label", e.target.value)} style={inp} />
          </div>
        )}
        <textarea required rows={2} placeholder="Short description" value={form.short_description} onChange={(e) => setField("short_description", e.target.value)} style={inp} />
        <textarea rows={5} placeholder="Full description" value={form.description} onChange={(e) => setField("description", e.target.value)} style={inp} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <select value={form.product_type} onChange={(e) => setField("product_type", e.target.value)} style={inp}>
            {SHOP_PRODUCT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
          <select value={form.product_kind} onChange={(e) => setField("product_kind", e.target.value)} style={inp} disabled={form.sale_type === "external"}>
            {SHOP_PRODUCT_KINDS.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
          </select>
          <select value={form.level} onChange={(e) => setField("level", e.target.value)} style={inp}>
            <option value="">Level (optional)</option>
            {SHOP_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
          <select value={form.subject} onChange={(e) => setField("subject", e.target.value)} style={inp}>
            <option value="">Subject (optional)</option>
            {SHOP_SUBJECTS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          </select>
          <select value={form.exam_board} onChange={(e) => setField("exam_board", e.target.value)} style={inp}>
            <option value="">Exam board (optional)</option>
            {SHOP_EXAM_BOARDS.map((board) => <option key={board} value={board}>{board}</option>)}
          </select>
          {form.sale_type !== "external" && form.product_kind === "physical" ? (
            <input required type="number" min="0" placeholder="Stock quantity" value={form.stock_quantity} onChange={(e) => setField("stock_quantity", e.target.value)} style={inp} />
          ) : form.sale_type !== "external" ? (
            <input placeholder="Keywords (optional)" value={form.keywords} onChange={(e) => setField("keywords", e.target.value)} style={inp} />
          ) : (
            <input placeholder="Keywords (optional)" value={form.keywords} onChange={(e) => setField("keywords", e.target.value)} style={inp} />
          )}
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setField("is_featured", e.target.checked)} />
            Featured
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.is_published} onChange={(e) => setField("is_published", e.target.checked)} />
            Published
          </label>
          <input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setField("sort_order", e.target.value)} style={{ ...inp, width: 140 }} />
        </div>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 16 }}>
        <ShopFileUploadBox
          boxKey={`image-${form.id || "new"}-${form.image_path || "empty"}`}
          label="Product image"
          dragHint="Click to upload or drag and drop product image"
          chooseButtonLabel="Choose image file"
          helperText="PNG, JPG or WebP recommended"
          accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
          path={form.image_path}
          previewUrl={form.image_url}
          showImagePreview
          showNativeInput
          showDebug
          uploading={uploadingField === "image_path"}
          disabled={uploadingField === "image_path"}
          validate={isValidProductImageFile}
          onSelectFile={(file) => uploadFile(file, "images", "image_path")}
        />
        <ShopFileUploadBox
          boxKey={`preview-${form.id || "new"}-${form.preview_path || "empty"}`}
          label="Preview file"
          dragHint="Click to upload or drag and drop preview file"
          chooseButtonLabel="Choose preview file"
          helperText="Optional image or PDF preview for the product page."
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
          path={form.preview_path}
          previewUrl={form.preview_url}
          showImagePreview={Boolean(form.preview_url && !String(form.preview_path || "").endsWith(".pdf"))}
          uploading={uploadingField === "preview_path"}
          disabled={uploadingField === "preview_path"}
          validate={validatePreviewFile}
          onSelectFile={(file) => uploadFile(file, "previews", "preview_path")}
        />
        {form.sale_type !== "external" && form.product_kind === "digital" && (
          <ShopFileUploadBox
            boxKey={`download-${form.id || "new"}-${form.download_path || "empty"}`}
            label="Download file"
            dragHint="Click to upload or drag and drop download file"
            chooseButtonLabel="Choose download file"
            helperText="Digital product file customers receive after purchase."
            accept="*/*"
            path={form.download_path}
            uploading={uploadingField === "download_path"}
            disabled={uploadingField === "download_path"}
            validate={validateDownloadFile}
            onSelectFile={(file) => uploadFile(file, "downloads", "download_path")}
          />
        )}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button form="shop-product-form" type="submit" disabled={saving || Boolean(uploadingField)} style={{ padding: "12px 16px", borderRadius: 8, border: "none", background: saving || uploadingField ? "#94a3b8" : TEAL, color: "#fff", fontWeight: 800, cursor: saving || uploadingField ? "default" : "pointer" }}>
          {saving ? "Saving…" : form.id ? "Update product" : "Add product"}
        </button>
        {form.id && (
          <button type="button" onClick={() => setForm(EMPTY_FORM)} style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 700 }}>
            Clear form
          </button>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>Products ({products.length})</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {products.map((product) => (
            <div key={product.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a" }}>{product.title}</div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                  {formatPricePence(product.effective_price_pence ?? product.price_pence)} · {shopProductTypeLabel(product.product_type)} · {isExternalProduct(product) ? "External link" : shopProductKindLabel(product.product_kind)}
                  {(product.is_published || product.published) ? " · Published" : " · Draft"}
                  {(product.is_featured || product.featured) ? " · Featured" : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => editProduct(product)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 700 }}>Edit</button>
                <button type="button" onClick={() => removeProduct(product.id)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#b91c1c", cursor: "pointer", fontWeight: 700 }}>Delete</button>
              </div>
            </div>
          ))}
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
