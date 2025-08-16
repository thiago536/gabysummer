import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

console.log("[v0] URL lida:", supabaseUrl)
console.log("[v0] Anon Key lida:", supabaseAnonKey ? "***configurada***" : "vazia")
console.log("[v0] SUPABASE_URL:", process.env.SUPABASE_URL || "não definida")
console.log("[v0] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "não definida")

// Check if Supabase environment variables are available
export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return url.startsWith("https://") && url.includes(".supabase.co")
  } catch {
    return false
  }
}

// Create a singleton instance of the Supabase client
export const supabase =
  isSupabaseConfigured && isValidUrl(supabaseUrl) ? createClient(supabaseUrl, supabaseAnonKey) : null

if (!supabase) {
  console.log(
    "[v0] Supabase client não foi criado. URL válida:",
    isValidUrl(supabaseUrl),
    "Configurado:",
    isSupabaseConfigured,
  )
}

export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error("Supabase client not configured. Please check your environment variables.")
  }
  return supabase
}
