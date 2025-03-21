import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anonymous Key is missing!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});

// Helpers for database tables
export const getTables = () => ({
  provinces: () => supabase.from("provinces"),
  rules: () => supabase.from("rules"),
  results: () => supabase.from("results"),
  bets: () => supabase.from("bets"),
  users: () => supabase.from("users"),
  transactions: () => supabase.from("transactions"),
});

export type Database = {
  provinces: {
    id: string;
    province_id: string;
    name: string;
    code?: string;
    region: string;
    region_type: string;
    draw_days: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  rules: {
    id: string;
    bet_type_id: string;
    name: string;
    description?: string;
    digit_count?: number;
    region_rules: any;
    variants?: any;
    winning_ratio: any;
    created_at: string;
    updated_at: string;
  };
};
