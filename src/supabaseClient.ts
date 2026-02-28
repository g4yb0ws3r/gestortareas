import { createClient } from '@supabase/supabase-js';

// Use process.env for compatibility with the 'define' in vite.config.ts
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide a dummy URL if missing to prevent immediate crash during initialization
// The app will show a warning if these are not properly configured
const finalUrl = supabaseUrl || 'https://placeholder-project.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
