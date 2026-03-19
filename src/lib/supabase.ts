import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    _supabase = createClient(url, key)
  }
  return _supabase
}

// lazy proxy so imports don't blow up when env vars are missing
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const DEFAULT_PROFILE_ID = '00000000-0000-0000-0000-000000000001'

export async function logActivity(tool: string, action: string, details?: string) {
  await getSupabase().from('activity_log').insert({
    profile_id: DEFAULT_PROFILE_ID,
    tool,
    action,
    details,
  })
}

export async function getPreferences() {
  const { data } = await getSupabase()
    .from('profiles')
    .select('preferences')
    .eq('id', DEFAULT_PROFILE_ID)
    .single()
  return data?.preferences ?? {}
}

export async function updatePreferences(prefs: Record<string, unknown> | object) {
  const current = await getPreferences()
  const merged = { ...current, ...prefs }
  await getSupabase()
    .from('profiles')
    .update({ preferences: merged, updated_at: new Date().toISOString() })
    .eq('id', DEFAULT_PROFILE_ID)
  return merged
}
