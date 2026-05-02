import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Browser-safe client. Reads use the anon key + RLS policies from schema.sql.
// Until env vars are set, the client is `null` and the UI falls back to seed data.
export const supabase =
  url && anon ? createClient(url, anon, { auth: { persistSession: false } }) : null;

export const supabaseConfigured = Boolean(url && anon);
