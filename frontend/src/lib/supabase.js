import { createClient } from '@supabase/supabase-js'

// Clean up URL if it has trailing /rest/v1 or trailing slashes
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '')
  .trim()
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '')

const rawKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()

// Check whether real credentials have been configured
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('your-project-id') &&
  rawUrl.startsWith('https://')
)

// Fallback to avoid Vite startup crash if credentials are not configured yet
const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co'
const supabaseKey = isSupabaseConfigured ? rawKey : 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
