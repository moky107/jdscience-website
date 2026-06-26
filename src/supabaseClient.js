import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xugsznxfvpbifpzpuoek.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_hPyUFmC3SzL4kcdpzzVdMA_UDlx6_PC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
