import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
/**
 * Supabase client configuration. Initializes the connection to the Supabase backend using environment variables.
 * The client is exported for use across the application to perform database operations.
 */
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase Environment Variables: SUPABASE_URL or SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
