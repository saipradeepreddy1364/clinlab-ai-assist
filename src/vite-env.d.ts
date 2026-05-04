/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GEMINI_API_KEY: string
  readonly EXPO_PUBLIC_SUPABASE_URL: string
  readonly EXPO_PUBLIC_SUPABASE_ANON_KEY: string
  readonly EXPO_PUBLIC_GEMINI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
