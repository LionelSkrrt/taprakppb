import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { SERIES, MOBILE_SUITS } from "../data/seed.js";

// Repository = satu antarmuka untuk akses tabel, apa pun backend-nya.
//   list({ eq, search, orderBy }) -> array
//   get(id)                       -> row | null
//   insert(payload)               -> row
//   update(id, payload)           -> row | null
//   remove(id)                    -> boolean
//
// Backend Supabase dipakai jika SUPABASE_URL & SUPABASE_KEY terisi, selain itu
// memakai data seed di memori (perubahan hilang saat server restart).

function supabaseRepo(name) {
  return {
    async list({ eq = {}, search, orderBy = "id" } = {}) {
      let query = supabase.from(name).select("*");
      for (const [column, value] of Object.entries(eq)) {
        query = query.eq(column, value);
      }
      if (search?.term) {
        // Buang karakter yang punya arti khusus di filter PostgREST.
        const term = search.term.replace(/[,()%*\\]/g, " ").trim();
        if (term) {
          const clauses = search.columns.map((c) => `${c}.ilike.%${term}%`);
          query = query.or(clauses.join(","));
        }
      }
      const { data, error } = await query.order(orderBy, { ascending: true });
      if (error) throw error;
      return data;
    },

    async get(id) {
      const { data, error } = await supabase
        .from(name)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async insert(payload) {
      const { data, error } = await supabase
        .from(name)
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(name)
        .update(payload)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async remove(id) {
      const { data, error } = await supabase
        .from(name)
        .delete()
        .eq("id", id)
        .select("id");
      if (error) throw error;
      return data.length > 0;
    },
  };
}

const memoryTables = {
  series: structuredClone(SERIES),
  mobile_suits: structuredClone(MOBILE_SUITS),
};

function memoryRepo(name) {
  const rows = memoryTables[name];
  const nextId = () => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;

  return {
    async list({ eq = {}, search, orderBy = "id" } = {}) {
      let result = rows.filter((row) =>
        Object.entries(eq).every(([column, value]) => row[column] === value),
      );
      if (search?.term) {
        const term = search.term.toLowerCase();
        result = result.filter((row) =>
          search.columns.some((c) =>
            String(row[c] ?? "").toLowerCase().includes(term),
          ),
        );
      }
      return structuredClone(
        [...result].sort((a, b) => (a[orderBy] > b[orderBy] ? 1 : -1)),
      );
    },

    async get(id) {
      const row = rows.find((r) => r.id === id);
      return row ? structuredClone(row) : null;
    },

    async insert(payload) {
      const row = { image_url: null, ...payload, id: nextId() };
      rows.push(row);
      return structuredClone(row);
    },

    async update(id, payload) {
      const row = rows.find((r) => r.id === id);
      if (!row) return null;
      Object.assign(row, payload);
      return structuredClone(row);
    },

    async remove(id) {
      const index = rows.findIndex((r) => r.id === id);
      if (index === -1) return false;
      rows.splice(index, 1);
      if (name === "series") {
        // Meniru "on delete cascade" di skema Supabase.
        const suits = memoryTables.mobile_suits;
        for (let i = suits.length - 1; i >= 0; i--) {
          if (suits[i].series_id === id) suits.splice(i, 1);
        }
      }
      return true;
    },
  };
}

export function table(name) {
  return isSupabaseConfigured ? supabaseRepo(name) : memoryRepo(name);
}

export const dataSource = isSupabaseConfigured ? "supabase" : "memory";
