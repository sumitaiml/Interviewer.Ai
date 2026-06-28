import { createClient } from "@supabase/supabase-js";

const getSupabaseUrl = (): string => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (url) return url;
  } catch (e) {}

  try {
    const url = process.env.VITE_SUPABASE_URL;
    if (url) return url;
  } catch (e) {}

  return "https://rpdmkdzbxdnvmvznexim.supabase.co";
};

const getSupabaseAnonKey = (): string => {
  try {
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (key) return key;
  } catch (e) {}

  try {
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    if (key) return key;
  } catch (e) {}

  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZG1rZHpieGRudm12em5leGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTI4NTUsImV4cCI6MjA5ODAyODg1NX0.N8-oGllX_TW2Yt5BzsN3fdz2Zrz7ViWZOK-C5Nx3MfM";
};


const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

const createFallbackClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null }),
      signUp: async () => { throw new Error("Supabase Auth is not initialized. Please configure VITE_SUPABASE_ANON_KEY in apps/frontend/.env"); },
      signInWithPassword: async () => { throw new Error("Supabase Auth is not initialized. Please configure VITE_SUPABASE_ANON_KEY in apps/frontend/.env"); },
    }
  } as any;
};

let clientInstance: any;

if (!supabaseAnonKey || supabaseAnonKey === "placeholder-anon-key" || supabaseAnonKey.trim() === "") {
  console.warn(
    "Supabase client is running in fallback mode because VITE_SUPABASE_ANON_KEY is not set. Auth features will be simulated."
  );
  clientInstance = createFallbackClient();
} else {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Failed to initialize live Supabase client, using fallback:", err);
    clientInstance = createFallbackClient();
  }
}

export const supabase = clientInstance;
