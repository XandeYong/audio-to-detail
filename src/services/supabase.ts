import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

// These should be set in your .env or Expo config
// They are public keys — safe to include in the app bundle
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      async getItem(key: string) {
        try {
          return await SecureStore.getItemAsync(key);
        } catch {
          return null;
        }
      },
      async setItem(key: string, value: string) {
        try {
          await SecureStore.setItemAsync(key, value);
        } catch {
          // Silently fail on web or when secure store unavailable
        }
      },
      async removeItem(key: string) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch {
          // Silently fail
        }
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
