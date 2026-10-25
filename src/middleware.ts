import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = []

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    cookiesToSet.push({ name, value, options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    for (const cookie of cookiesToSet) {
                        response.cookies.set(cookie.name, cookie.value, cookie.options)
                    }
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    cookiesToSet.push({ name, value: '', options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    for (const cookie of cookiesToSet) {
                        response.cookies.set(cookie.name, cookie.value, cookie.options)
                    }
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const configuredAdminEmail = (
        process.env.ADMIN_EMAIL ||
        process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
        ''
    )
        .trim()
        .toLowerCase()

    const isAuthorizedAdmin =
        Boolean(user) &&
        (!configuredAdminEmail || user?.email?.toLowerCase() === configuredAdminEmail)

    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isLoginPage = request.nextUrl.pathname === '/admin/login'

    if (isAdminRoute) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
    }

    if (isAdminRoute && !isLoginPage && !isAuthorizedAdmin) {
        const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url))
        for (const cookie of cookiesToSet) {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options)
        }
        return redirectResponse
    }

    if (isLoginPage && isAuthorizedAdmin) {
        const redirectResponse = NextResponse.redirect(new URL('/admin', request.url))
        for (const cookie of cookiesToSet) {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options)
        }
        return redirectResponse
    }

    return response
}

export const config = {
    matcher: ['/admin/:path*'],
}
