import { createClient } from "@supabase/supabase-js";

const getEnvVar = (name: string): string => {
  try {
    if (typeof import.meta !== "undefined" && (import.meta as any).env) {
      const env = (import.meta as any).env as Record<string, string | undefined>;
      if (env[name]) return env[name]!;
    }
  } catch (e) {}

  try {
    if (typeof process !== "undefined" && process.env) {
      const env = process.env as Record<string, string | undefined>;
      if (env[name]) return env[name]!;
    }
  } catch (e) {}

  return "";
};

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL") || "https://rpdmkdzbxdnvmvznexim.supabase.co";
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY");

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
