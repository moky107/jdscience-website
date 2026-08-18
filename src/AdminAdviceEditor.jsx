import React, { useEffect, useState } from "react";
import { ADVICE_CATEGORIES, adviceCategoryLabel } from "./adviceConstants";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box" };

const EMPTY_FORM = {
  id: null,
  title: "",
  category: "revision-advice",
  summary: "",
  body: "",
  published: true,
};

export default function AdminAdviceEditor({ password }) {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);

  async function request(payload) {
    const resp = await fetch("/api/admin-education-posts", {
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
      const data = await request({ action: "list" });
      setPosts(data.posts || []);
      setSetupRequired(Boolean(data.setupRequired));
    } catch (err) {
      setError(err.message || "Failed to load posts.");
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
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const action = form.id ? "update" : "create";
      await request({ action, post: form });
      setForm(EMPTY_FORM);
      setMessage(form.id ? "Post updated." : "Post published.");
      await load();
    } catch (err) {
      setError(err.message || "Failed to save post.");
      setSetupRequired(Boolean(err.setupRequired));
    } finally {
      setSaving(false);
    }
  }

  async function remove(post) {
    if (!window.confirm(`Delete “${post.title}”?`)) return;
    setError("");
    setMessage("");
    try {
      await request({ action: "delete", id: post.id });
      if (form.id === post.id) setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete post.");
    }
  }

  return (
    <div style={{ marginTop: 20, background: "#fff", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,.05)", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#0f172a" }}>Advice, exam tips &amp; education news</div>
      <div style={{ padding: 16, display: "grid", gap: 16 }}>
        <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
          Posts saved here appear in the homepage section “Revision advice, exam tips &amp; education news”.
        </div>
        {setupRequired && (
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 1.65 }}>
            Run the SQL file <b>supabase/migrations/20260818_education_posts.sql</b> in the Supabase SQL editor once, then click Refresh. After that you can publish posts from this form.
          </div>
        )}
        {error && <div style={{ color: "#991b1b", fontSize: 14 }}>{error}</div>}
        {message && <div style={{ color: "#166534", fontSize: 14 }}>{message}</div>}

        <form onSubmit={save} style={{ display: "grid", gap: 12, background: "#f8fafc", borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 800, color: TEAL_DARK }}>{form.id ? "Edit post" : "New post"}</div>
          <input placeholder="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} style={inp} />
          <select value={form.category} onChange={(e) => setField("category", e.target.value)} style={inp}>
            {ADVICE_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <textarea rows={3} placeholder="Short summary shown on the homepage card" value={form.summary} onChange={(e) => setField("summary", e.target.value)} style={inp} />
          <textarea rows={8} placeholder="Full advice, exam tip or news article" value={form.body} onChange={(e) => setField("body", e.target.value)} style={inp} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontWeight: 700 }}>
            <input type="checkbox" checked={form.published} onChange={(e) => setField("published", e.target.checked)} />
            Publish on homepage
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="submit" disabled={saving || setupRequired} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: saving ? "#94a3b8" : TEAL, color: "#fff", cursor: "pointer", fontWeight: 800 }}>
              {saving ? "Saving…" : (form.id ? "Save changes" : "Save post")}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm(EMPTY_FORM)} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 700 }}>
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>{loading ? "Loading posts…" : `${posts.length} post${posts.length === 1 ? "" : "s"}`}</div>
          <div style={{ display: "grid", gap: 10 }}>
            {posts.map((post) => (
              <div key={post.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>{post.title}</div>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                    {adviceCategoryLabel(post.category)} · {post.published ? "Published" : "Draft"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => setForm({ id: post.id, title: post.title || "", category: post.category || "revision-advice", summary: post.summary || "", body: post.body || "", published: post.published !== false })}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 700 }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(post)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", cursor: "pointer", fontWeight: 700 }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
