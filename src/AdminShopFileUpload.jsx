import React, { useEffect, useId, useRef, useState } from "react";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

export function ShopFileUploadBox({
  label,
  helperText,
  dragHint = "Click to upload or drag and drop file",
  accept,
  path = "",
  previewUrl = "",
  showImagePreview = false,
  disabled = false,
  uploading = false,
  validate,
  onSelectFile,
  boxKey = "upload",
}) {
  const inputRef = useRef(null);
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setLocalPreview("");
    setLocalError("");
  }, [boxKey]);

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const displayPreview = showImagePreview && (localPreview || previewUrl);

  function openPicker() {
    if (disabled || uploading) return;
    inputRef.current?.click();
  }

  async function handleFile(file) {
    setLocalError("");
    if (!file) return;
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
    const file = event.target.files?.[0];
    void handleFile(file);
    event.target.value = "";
  }

  function onDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && !uploading) setDragOver(true);
  }

  function onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && !uploading) setDragOver(true);
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
    if (disabled || uploading) return;
    void handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{label}</span>
      <div
        role="button"
        tabIndex={disabled || uploading ? -1 : 0}
        aria-disabled={disabled || uploading}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (disabled || uploading) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
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
          cursor: disabled || uploading ? "default" : "pointer",
          opacity: disabled || uploading ? 0.75 : 1,
          transition: "border-color .15s ease, background .15s ease",
        }}
      >
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onInputChange}
          disabled={disabled || uploading}
          style={{ display: "none" }}
        />
        {displayPreview ? (
          <img
            src={displayPreview}
            alt=""
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
      {path && (
        <div style={{ fontSize: 12, color: "#64748b", wordBreak: "break-all" }}>
          Saved path: {path}
        </div>
      )}
      {localError && <div style={{ color: "#b91c1c", fontSize: 13 }}>{localError}</div>}
    </div>
  );
}

export default ShopFileUploadBox;
