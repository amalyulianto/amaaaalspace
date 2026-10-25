import { createServerClient, type CookieOptions } from '@supabase/ssr'

export function createAdminClient() {
    if (typeof window !== 'undefined') {
        throw new Error('createAdminClient() can only be called on the server.')
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase server environment variables.')
    }

    return createServerClient(supabaseUrl, serviceRoleKey, {
        cookies: {
            get(_name: string) {
                return undefined
            },
            set(_name: string, _value: string, _options: CookieOptions) {},
            remove(_name: string, _options: CookieOptions) {},
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    })
}
