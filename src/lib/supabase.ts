import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Support both Vite (web) and Expo (mobile) environment variable formats
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 
                    (import.meta as any).env?.EXPO_PUBLIC_SUPABASE_URL || 
                    "https://zruonfdnfvgmaebanvdm.supabase.co";

const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
                        (import.meta as any).env?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydW9uZmRuZnZnbWFlYmFudmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTczODksImV4cCI6MjA5MjU5MzM4OX0.AfutlmSt6ix8TNm0Lc70P2R2U554CXSaa7DxPyY8Hz4";

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
