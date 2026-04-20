import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ SUPABASE_URL and SUPABASE_ANON_KEY should be provided in .env');
}

// Inicializando com a chave Anônima (Anon Key) para respeitar as políticas de RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
