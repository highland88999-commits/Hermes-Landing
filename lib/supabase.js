import { createClient } from '@supabase/supabase-js';

// The || string prevents 'npm run build' from crashing when running outside of Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (process.env.NODE_ENV !== 'production' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('Supabase keys missing. Using placeholder for build phase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
