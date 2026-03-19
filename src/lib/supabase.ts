import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const DEFAULT_PROFILE_ID = '00000000-0000-0000-0000-000000000001'

// Helper to log activity
export async function logActivity(tool: string, action: string, details?: string) {
  await supabase.from('activity_log').insert({
    profile_id: DEFAULT_PROFILE_ID,
    tool,
    action,
    details,
  })
}

// Helper to get user preferences
export async function getPreferences() {
  const { data } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', DEFAULT_PROFILE_ID)
    .single()
  return data?.preferences ?? {}
}

// Helper to update preferences
export async function updatePreferences(prefs: Record<string, unknown> | object) {
  const current = await getPreferences()
  const merged = { ...current, ...prefs }
  await supabase
    .from('profiles')
    .update({ preferences: merged, updated_at: new Date().toISOString() })
    .eq('id', DEFAULT_PROFILE_ID)
  return merged
}
