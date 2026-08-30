import React, { useEffect, useRef, useState } from "react";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

/**
 * Product/file upload control.
 *
 * Empty file pickers never mean "remove this file".
 * Only a new selected file, or an explicit Remove action, changes the path.
 */
export function ShopFileUploadBox({
  label,
  helperText,
  dragHint = "Click to upload or drag and drop file",
  chooseButtonLabel = "Choose file",
  accept,
  path = "",
  previewUrl = "",
  viewUrl = "",
  showImagePreview = false,
  disabled = false,
  uploading = false,
  validate,
  onSelectFile,
  onRemove,
  removeLabel = "Remove file",
  viewLabel = "View current file",
  boxKey = "upload",
  showDebug = false,
  uploadStatus = "",
}) {
  const inputRef = useRef(null);
  const inputId = `jd-shop-file-${String(boxKey || "upload").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 80)}`;
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const [localError, setLocalError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [nativeChanged, setNativeChanged] = useState(false);
  const [inputMounted, setInputMounted] = useState(false);
  const inputDisabled = Boolean(disabled || uploading);
  const debugEnabled = Boolean(showDebug && import.meta.env.DEV);
  const currentUrl = viewUrl || previewUrl;

  useEffect(() => {
    setInputMounted(Boolean(inputRef.current));
  }, []);

  useEffect(() => {
    setLocalPreview("");
    setLocalError("");
    setSelectedFileName("");
    setNativeChanged(false);
    if (inputRef.current) inputRef.current.value = "";
  }, [boxKey]);

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const displayPreview = showImagePreview && (localPreview || previewUrl);

  async function handleFile(file) {
    setLocalError("");
    if (!file) return;
    setSelectedFileName(file.name || "");
    const validation = validate ? validate(file) : { ok: true };
    if (!validation.ok) {
      setLocalError(validation.error || "This file type is not supported.");
      return;
    }
    let objectUrl = "";
    if (showImagePreview) {
      objectUrl = URL.createObjectURL(file);
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    }
    try {
      await onSelectFile(file);
    } catch (err) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setLocalPreview((prev) => {
        if (prev === objectUrl) return "";
        return prev;
      });
      setLocalError(err.message || "Upload failed.");
    }
  }

  function onInputChange(event) {
    setNativeChanged(true);
    const file = event.target.files?.[0];
    if (!file) return;
    void handleFile(file);
    event.target.value = "";
  }

  function onDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!inputDisabled) setDragOver(true);
  }

  function onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!inputDisabled) setDragOver(true);
  }

  function onDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  }

  function onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    if (inputDisabled) return;
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    void handleFile(file);
  }

  return (
    <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{label}</span>

      <div
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragOver ? TEAL : "#cbd5e1"}`,
          background: dragOver ? "#ecfeff" : "#f8fafc",
          borderRadius: 12,
          padding: 16,
          minHeight: showImagePreview ? 160 : 120,
          display: "grid",
          gap: 10,
          alignContent: "center",
          justifyItems: "center",
          textAlign: "center",
          opacity: inputDisabled ? 0.75 : 1,
        }}
      >
        {displayPreview ? (
          <img
            src={displayPreview}
            alt=""
            draggable={false}
            style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 8, objectFit: "cover", display: "block", boxShadow: "0 4px 14px rgba(15,23,42,.08)" }}
          />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: 12, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: "#fff", fontWeight: 800, fontSize: 22 }}>
            ↑
          </div>
        )}
        <div style={{ color: TEAL_DARK, fontWeight: 700, fontSize: 14, lineHeight: 1.45 }}>
          {uploading ? "Uploading…" : dragHint}
        </div>
        {helperText && (
          <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5, maxWidth: 280 }}>
            {helperText}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
          {chooseButtonLabel}
        </span>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onInputChange}
          disabled={inputDisabled}
          style={{
            display: "block",
            width: "100%",
            maxWidth: "100%",
            fontSize: 16,
            padding: "10px 8px",
            cursor: inputDisabled ? "default" : "pointer",
            background: "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            boxSizing: "border-box",
          }}
        />
        <div style={{ color: "#64748b", fontSize: 12 }}>
          Leave as “No file chosen” to keep the current file.
        </div>
      </div>

      {path ? (
        <div style={{ fontSize: 13, color: "#334155", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, display: "grid", gap: 8, minWidth: 0 }}>
          <div style={{ wordBreak: "break-all" }}>
            <strong>Current file:</strong> {path}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {currentUrl && (
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ minHeight: 40, padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: TEAL_DARK, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              >
                {viewLabel}
              </a>
            )}
            {typeof onRemove === "function" && (
              <button
                type="button"
                onClick={onRemove}
                disabled={inputDisabled}
                style={{ minHeight: 40, padding: "8px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#b91c1c", fontWeight: 700, cursor: inputDisabled ? "default" : "pointer" }}
              >
                {removeLabel}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "#64748b" }}>No file stored yet.</div>
      )}

      {debugEnabled && (
        <div style={{ fontSize: 12, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, lineHeight: 1.6 }}>
          <div><strong>Upload debug</strong></div>
          <div>input mounted: {inputMounted ? "yes" : "no"}</div>
          <div>input id: {inputId}</div>
          <div>disabled: {String(inputDisabled)}</div>
          <div>native input changed: {nativeChanged ? "yes" : "no"}</div>
          <div>selected file name: {selectedFileName || "none"}</div>
          <div>upload API status: {uploadStatus || (uploading ? "uploading…" : "idle")}</div>
          <div>saved image_path: {path || "none"}</div>
        </div>
      )}

      {localError && <div style={{ color: "#b91c1c", fontSize: 13 }}>{localError}</div>}
    </div>
  );
}

export default ShopFileUploadBox;
