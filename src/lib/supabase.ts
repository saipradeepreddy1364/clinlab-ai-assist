import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Support both Vite (web) and Expo (mobile) environment variable formats
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 
                    (import.meta as any).env?.EXPO_PUBLIC_SUPABASE_URL || 
                    (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_SUPABASE_URL : '') || '';

const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
                        (import.meta as any).env?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                        (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY : '') || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Missing Supabase environment variables! Check your .env file or Vercel settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
