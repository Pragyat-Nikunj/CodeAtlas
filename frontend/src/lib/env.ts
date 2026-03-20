// lib/env.ts
import dotenv from 'dotenv';
dotenv.config();

const env = {
  apiUrl: process.env.NEXT_PUBLIC_URI!,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
} as const;

export default env;