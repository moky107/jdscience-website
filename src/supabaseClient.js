import { createClient } from "@supabase/supabase-js";

// The project URL and anon (publishable) key are safe to expose in the browser.
// They can be overridden via Vite env vars (VITE_*) without a code change;
// otherwise the working defaults below are used.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://xugsznxfvpbifpzpuoek.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_hPyUFmC3SzL4kcdpzzVdMA_UDlx6_PC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
