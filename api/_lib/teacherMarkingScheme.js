import { createClient } from "@supabase/supabase-js";

const TEACHER_EMAILS = new Set([
  "jd943791@gmail.com",
  "info@jdscience.co.uk",
]);

const ALLOWED_SLUGS = new Set([
  "a11-1-collision-theory",
  "a11-2-temperature-and-rate",
  "a11-3-catalysts",
  "a12-1-factors-affecting-rates",
  "a12-2-calculating-rate",
  "a12-3-enthalpy-changes",
  "a12-4-industrial-catalysts",
  "a12-5-reversible-reactions",
  "a12-6-haber-process",
]);

const PRIVATE_BUCKET = "teacher-resources";

function schemePath(slug) {
  return `t-level/science/marking-schemes/${slug}-teacher-marking-scheme.pdf`;
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export function wantsTeacherMarkingSchemeRequest(req) {
  const kind = String(req.query?.kind || "");
  const url = String(req.url || "");
  return kind === "teacher-marking-scheme"
    || url.includes("/api/teacher-marking-scheme")
    || url.includes("kind=teacher-marking-scheme");
}

export async function handleTeacherMarkingSchemeRequest(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method not allowed" });
  }

  const slug = String(req.query?.slug || "").trim();
  if (!ALLOWED_SLUGS.has(slug)) {
    return json(res, 400, { error: "Unknown topic." });
  }

  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return json(res, 401, { error: "Sign in with an authorised teacher account." });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xugsznxfvpbifpzpuoek.supabase.co";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!service) {
    return json(res, 500, { error: "Teacher downloads are not configured." });
  }

  const admin = createClient(supabaseUrl, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const email = String(userData?.user?.email || "").toLowerCase();
  if (userError || !email) {
    return json(res, 401, { error: "Sign in with an authorised teacher account." });
  }
  if (!TEACHER_EMAILS.has(email)) {
    return json(res, 403, { error: "This account is not authorised for teacher marking schemes." });
  }

  const { data, error } = await admin.storage.from(PRIVATE_BUCKET).createSignedUrl(schemePath(slug), 300);
  if (error || !data?.signedUrl) {
    return json(res, 404, { error: "Marking scheme is not available yet." });
  }
  return json(res, 200, { url: data.signedUrl, expiresIn: 300, slug });
}
