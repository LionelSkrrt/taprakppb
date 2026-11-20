import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ quiet: true });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Jika kredensial belum diisi, API otomatis memakai data seed di memori
// (lihat repository.js) supaya bisa dicoba tanpa Supabase.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
