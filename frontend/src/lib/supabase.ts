import { createClient } from '@supabase/supabase-js';

// Get environment variables with explicit hardcoded fallbacks
let supabaseUrlFromEnv = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKeyFromEnv = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Define a type for our Supabase client
type SupabaseClient = ReturnType<typeof createClient>;

// Hardcoded fallbacks for development
const FALLBACK_URL = 'https://stsroanibtqfsxdielxa.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0c3JvYW5pYnRxZnN4ZGllbHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMTg0MTgsImV4cCI6MjA2MDc5NDQxOH0.T479B0isGUygxRpBEuaHdCLip7DAo55FfFYTl_z0rSs';

// Sanitize URLs if they exist
if (typeof supabaseUrlFromEnv === 'string') {
  // Remove any trailing special characters or whitespace
  supabaseUrlFromEnv = supabaseUrlFromEnv.trim().replace(/[%\s]+$/, '');
  
  // Ensure URL has a proper protocol
  if (!supabaseUrlFromEnv.startsWith('http://') && !supabaseUrlFromEnv.startsWith('https://')) {
    supabaseUrlFromEnv = 'https://' + supabaseUrlFromEnv;
  }
}

if (typeof supabaseAnonKeyFromEnv === 'string') {
  supabaseAnonKeyFromEnv = supabaseAnonKeyFromEnv.trim();
}

// Validate URL
let supabaseUrl = FALLBACK_URL;
let supabaseAnonKey = FALLBACK_KEY;

// Only use environment variables if they exist and are valid
if (supabaseUrlFromEnv) {
  try {
    // Test that the URL is valid
    new URL(supabaseUrlFromEnv);
    supabaseUrl = supabaseUrlFromEnv;
    console.log('Using environment Supabase URL:', supabaseUrl);
  } catch (e) {
    console.error('Invalid Supabase URL in environment:', supabaseUrlFromEnv);
    console.error('Error details:', e);
    console.log('Using fallback URL instead:', FALLBACK_URL);
  }
} else {
  console.log('No Supabase URL found in environment, using fallback');
}

if (supabaseAnonKeyFromEnv) {
  supabaseAnonKey = supabaseAnonKeyFromEnv;
  console.log('Using environment Supabase Anon Key');
} else {
  console.log('No Supabase Anon Key found in environment, using fallback');
}

let supabase: SupabaseClient;

try {
  console.log('Creating Supabase client with URL:', supabaseUrl);
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a mock client that doesn't actually connect to Supabase
  supabase = {
    auth: {
      signUp: async () => ({ error: { message: 'Supabase connection error' } }),
      signInWithPassword: async () => ({ error: { message: 'Supabase connection error' } }),
      signOut: async () => {},
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    }
  } as unknown as SupabaseClient;
  console.log('Created mock Supabase client due to error');
}

export default supabase; 