import { createClient } from '@supabase/supabase-js'

// Create a singleton Supabase connection using the service role key
// This allows bypassing Row Level Security and creating users without logging in
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
