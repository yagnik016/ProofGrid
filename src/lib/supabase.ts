import { createClient } from '@supabase/supabase-js';

// Fallback to placeholders during next build so the prerender doesn't crash if env vars are empty
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (
  supabaseUrl === 'https://placeholder.supabase.co' || 
  supabaseAnonKey === 'placeholder-anon-key'
) {
  console.warn(
    'Supabase environment variables are missing. Please add them to your .env.local file to connect your database.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
