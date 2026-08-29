import React, { useEffect, useMemo, useRef, useState } from "react";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

function stableInputId(boxKey) {
  const slug = String(boxKey || "upload")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `jd-shop-file-${slug || "upload"}`;
}

export function ShopFileUploadBox({
  label,
  helperText,
  dragHint = "Click to upload or drag and drop file",
  chooseButtonLabel = "Choose image file",
  accept,
  path = "",
  previewUrl = "",
  showImagePreview = false,
  disabled = false,
  uploading = false,
  validate,
  onSelectFile,
  boxKey = "upload",
  showNativeInput = false,
  showDebug = false,
}) {
  const inputRef = useRef(null);
  const inputId = useMemo(() => stableInputId(boxKey), [boxKey]);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const [localError, setLocalError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [lastInteraction, setLastInteraction] = useState("");
  const [inputMounted, setInputMounted] = useState(false);
  const inputDisabled = Boolean(disabled || uploading);

  useEffect(() => {
    setInputMounted(Boolean(inputRef.current));
  });

  useEffect(() => {
    setLocalPreview("");
    setLocalError("");
    setSelectedFileName("");
  }, [boxKey]);

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const displayPreview = showImagePreview && (localPreview || previewUrl);

  function noteInteraction(kind) {
    setLastInteraction(`${kind} @ ${new Date().toLocaleTimeString("en-GB")}`);
  }

  async function handleFile(file) {
    setLocalError("");
    if (!file) return;
    setSelectedFileName(file.name || "");
    noteInteraction("file selected");
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
    noteInteraction("input change");
    const file = event.target.files?.[0];
    void handleFile(file);
  }

  function onDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!inputDisabled) {
      setDragOver(true);
      noteInteraction("drag enter");
    }
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
    noteInteraction("drop");
    void handleFile(event.dataTransfer.files?.[0]);
  }

  const nativeInputStyle = showNativeInput
    ? {
        display: "block",
        width: "100%",
        fontSize: 16,
        padding: "8px 0",
        cursor: inputDisabled ? "default" : "pointer",
      }
    : {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        opacity: 0,
        cursor: inputDisabled ? "default" : "pointer",
        zIndex: 3,
      };

  return (
    <div style={{ display: "grid", gap: 10, position: "relative" }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{label}</span>

      {showNativeInput && (
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onInputChange}
          disabled={inputDisabled}
          style={nativeInputStyle}
        />
      )}

      <div
        style={{ position: "relative" }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {!showNativeInput && (
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onInputChange}
            disabled={inputDisabled}
            style={nativeInputStyle}
            aria-label={chooseButtonLabel}
          />
        )}

        <label
          htmlFor={inputId}
          onClick={() => noteInteraction("drop zone click")}
          aria-disabled={inputDisabled}
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
            cursor: inputDisabled ? "default" : "pointer",
            opacity: inputDisabled ? 0.75 : 1,
            transition: "border-color .15s ease, background .15s ease",
            position: "relative",
            zIndex: 1,
            userSelect: "none",
            pointerEvents: inputDisabled ? "none" : "auto",
          }}
        >
          {displayPreview ? (
            <img
              src={displayPreview}
              alt=""
              draggable={false}
              style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 8, objectFit: "cover", display: "block", boxShadow: "0 4px 14px rgba(15,23,42,.08)", pointerEvents: "none" }}
            />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 12, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: "#fff", fontWeight: 800, fontSize: 22, pointerEvents: "none" }}>
              ↑
            </div>
          )}
          <div style={{ color: TEAL_DARK, fontWeight: 700, fontSize: 14, lineHeight: 1.45, pointerEvents: "none" }}>
            {uploading ? "Uploading…" : dragHint}
          </div>
          {helperText && (
            <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5, maxWidth: 280, pointerEvents: "none" }}>
              {helperText}
            </div>
          )}
        </label>
      </div>

      <label
        htmlFor={inputId}
        onClick={() => noteInteraction("choose button click")}
        aria-disabled={inputDisabled}
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          background: inputDisabled ? "#f1f5f9" : "#fff",
          color: inputDisabled ? "#94a3b8" : TEAL_DARK,
          fontWeight: 700,
          fontSize: 14,
          cursor: inputDisabled ? "default" : "pointer",
          justifySelf: "start",
          position: "relative",
          zIndex: 2,
          display: "inline-block",
          textAlign: "center",
          pointerEvents: inputDisabled ? "none" : "auto",
        }}
      >
        {uploading ? "Uploading…" : chooseButtonLabel}
      </label>

      {showDebug && (
        <div style={{ fontSize: 12, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, lineHeight: 1.6 }}>
          <div><strong>Upload debug</strong></div>
          <div>input mounted: {inputMounted ? "yes" : "no"}</div>
          <div>input id: {inputId}</div>
          <div>disabled: {String(inputDisabled)} (uploading={String(uploading)}, disabled prop={String(disabled)})</div>
          <div>last interaction: {lastInteraction || "none"}</div>
          <div>selected file: {selectedFileName || "none"}</div>
        </div>
      )}

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
