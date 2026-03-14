import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
/**
 * Supabase client configuration. Initializes the connection to the Supabase backend using environment variables.
 * The client is exported for use across the application to perform database operations.
 */
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase Environment Variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
