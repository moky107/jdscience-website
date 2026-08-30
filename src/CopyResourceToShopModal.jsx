import React, { useMemo, useState } from "react";
import { SHOP_PRODUCT_TYPES } from "./shopConstants";
import { penceToPoundsInput, poundsInputToPence } from "./shopFormat";
import {
  classifyResourceProductType,
  cleanShopTitle,
  productTypeLabelForCopy,
} from "./resourceShopClassify";
import { APPROVED_SHOP_PRICE_LABELS, approvedPricePenceForType } from "./shopStandardPrices";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const inp = {
  padding: "11px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 16,
  width: "100%",
  boxSizing: "border-box",
  minHeight: 48,
};

function readAdminPassword() {
  try {
    return sessionStorage.getItem("jd_admin_pw") || "";
  } catch {
    return "";
  }
}

function rememberAdminPassword(password) {
  try {
    if (password) sessionStorage.setItem("jd_admin_pw", password);
  } catch {
    /* ignore */
  }
}

/**
 * Modal: enter price(s) then copy selected resources into shop_products.
 * Does not invent prices — admin must type them.
 */
export default function CopyResourceToShopModal({ resources, onClose, onDone }) {
  const items = useMemo(
    () => (Array.isArray(resources) ? resources.filter(Boolean) : []).map((resource) => {
      const product_type = classifyResourceProductType(resource);
      return {
        resource,
        title: cleanShopTitle(resource),
        product_type,
        price_pounds: penceToPoundsInput(approvedPricePenceForType(product_type)),
      };
    }),
    [resources],
  );

  const [rows, setRows] = useState(items);
  const [sharedPrice, setSharedPrice] = useState("");
  const [password, setPassword] = useState(readAdminPassword);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resultSummary, setResultSummary] = useState("");

  function applySharedPrice() {
    if (!sharedPrice.trim()) {
      setError("Enter a shared price first, or type a price on each row.");
      return;
    }
    setRows((current) => current.map((row) => ({ ...row, price_pounds: sharedPrice.trim() })));
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setResultSummary("");

    if (!password.trim()) {
      setError("Enter the admin password used for Shop Admin / bookings.");
      return;
    }

    const payloadItems = [];
    for (const row of rows) {
      const pence = poundsInputToPence(row.price_pounds);
      if (pence == null || !Number.isFinite(pence) || pence < 0) {
        setError(`Enter a valid price for “${row.title}” before publishing.`);
        return;
      }
      payloadItems.push({
        resource_id: row.resource.id,
        price_pence: pence,
        product_type: row.product_type,
        publish: true,
      });
    }

    setBusy(true);
    try {
      const action = payloadItems.length === 1 ? "shop-copy-from-resource" : "shop-copy-from-resources";
      const body = payloadItems.length === 1
        ? {
          password: password.trim(),
          action,
          resource_id: payloadItems[0].resource_id,
          price_pence: payloadItems[0].price_pence,
          product_type: payloadItems[0].product_type,
          publish: true,
        }
        : {
          password: password.trim(),
          action,
          items: payloadItems,
        };

      const resp = await fetch("/api/admin-shop-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data.error || `Copy to Shop failed (${resp.status}).`);
      }

      rememberAdminPassword(password.trim());

      if (payloadItems.length === 1) {
        if (data.skipped) {
          setResultSummary(data.error || "Already in the Shop — duplicate blocked.");
        } else {
          setResultSummary(`Published “${data.product?.title || rows[0].title}” at £${(payloadItems[0].price_pence / 100).toFixed(2)}.`);
        }
      } else {
        setResultSummary(
          `Created ${data.created || 0}, skipped ${data.skipped || 0}, failed ${data.failed || 0}.`,
        );
        const firstFail = (data.results || []).find((r) => !r.ok && !r.skipped);
        if (firstFail?.error) setError(firstFail.error);
      }
      onDone?.(data);
      if (payloadItems.length === 1 && data.created) {
        setTimeout(() => onClose?.(), 900);
      }
    } catch (err) {
      setError(err.message || "Copy to Shop failed.");
    } finally {
      setBusy(false);
    }
  }

  const typeOptions = SHOP_PRODUCT_TYPES.filter((t) => (
    ["powerpoint", "worksheet", "revision_notes", "answer_sheet", "pdf", "other"].includes(t.value)
  ));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Copy resources to Shop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose?.(); }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "min(720px, 96vw)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 16,
          padding: 22,
          boxShadow: "0 24px 60px rgba(15,23,42,.35)",
          display: "grid",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
          <div>
            <h2 style={{ margin: 0, color: "#0f172a", fontSize: 20 }}>
              {rows.length === 1 ? "Copy to Shop" : "Add selected resources to Shop"}
            </h2>
            <p style={{ margin: "8px 0 0", color: "#64748b", lineHeight: 1.5, fontSize: 14 }}>
              Creates a published shop product from each original JDScience file without changing the free resource.
              Approved prices are pre-filled: PowerPoints £5.00, worksheet packs £2.00, revision notes £3.00.
              Past papers and other third-party copyrighted files are blocked. Duplicates are skipped.
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: "#64748b" }}>×</button>
        </div>

        {rows.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end", background: "#f8fafc", borderRadius: 12, padding: 12 }}>
            <label style={{ flex: 1, minWidth: 160, display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Apply same price (£) to all</span>
              <input value={sharedPrice} onChange={(e) => setSharedPrice(e.target.value)} placeholder="e.g. 5.00" inputMode="decimal" style={inp} />
            </label>
            <button type="button" onClick={applySharedPrice} style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${TEAL}`, background: "#ecfeff", color: TEAL_DARK, fontWeight: 800, cursor: "pointer", minHeight: 48 }}>
              Apply to all
            </button>
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((row, index) => (
            <div key={row.resource.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 800, color: "#0f172a" }}>{row.title}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>
                {row.resource.level} · {row.resource.subject} · {row.resource.exam_board} · {productTypeLabelForCopy(row.product_type)}
                {approvedPricePenceForType(row.product_type) != null && (
                  <> · {APPROVED_SHOP_PRICE_LABELS[row.product_type]}</>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>Price (£) *</span>
                  <input
                    required
                    value={row.price_pounds}
                    onChange={(e) => setRows((current) => current.map((item, i) => (i === index ? { ...item, price_pounds: e.target.value } : item)))}
                    placeholder={penceToPoundsInput(approvedPricePenceForType(row.product_type)) || "Required"}
                    inputMode="decimal"
                    style={inp}
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>Product type</span>
                  <select
                    value={row.product_type}
                    onChange={(e) => setRows((current) => current.map((item, i) => {
                      if (i !== index) return item;
                      const product_type = e.target.value;
                      const previousApproved = penceToPoundsInput(approvedPricePenceForType(item.product_type));
                      const nextApproved = penceToPoundsInput(approvedPricePenceForType(product_type));
                      const price_pounds = !item.price_pounds || item.price_pounds === previousApproved
                        ? (nextApproved || "")
                        : item.price_pounds;
                      return { ...item, product_type, price_pounds };
                    }))}
                    style={inp}
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Admin password *</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Same password as Shop Admin"
            style={inp}
            autoComplete="current-password"
          />
        </label>

        {error && <div style={{ color: "#b91c1c", fontWeight: 600, fontSize: 14 }}>{error}</div>}
        {resultSummary && <div style={{ color: "#166534", fontWeight: 700, fontSize: 14 }}>{resultSummary}</div>}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} disabled={busy} style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700 }}>
            Cancel
          </button>
          <button type="submit" disabled={busy} style={{ padding: "12px 16px", borderRadius: 8, border: "none", background: busy ? "#94a3b8" : TEAL, color: "#fff", cursor: busy ? "default" : "pointer", fontWeight: 800 }}>
            {busy ? "Publishing…" : rows.length === 1 ? "Publish to Shop" : `Publish ${rows.length} to Shop`}
          </button>
        </div>
      </form>
    </div>
  );
}
