import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key are required');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    localStorage.setItem('supabaseSession', JSON.stringify(session));
  } else if (event === 'SIGNED_OUT') {
    localStorage.removeItem('supabaseSession');
  }
});

// Function to get the current session
export const getSession = () => {
  const sessionStr = localStorage.getItem('supabaseSession');
  return sessionStr ? JSON.parse(sessionStr) : null;
};