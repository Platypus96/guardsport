import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            request.cookies.set({ name, value, ...options } as any)
            response.cookies.set({ name, value, ...options } as any)
          },
          remove(name: string, options: Record<string, unknown>) {
            request.cookies.set({ name, value: '', ...options } as any)
            response.cookies.set({ name, value: '', ...options } as any)
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    const isDashboard =
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/assets') ||
      request.nextUrl.pathname.startsWith('/violations') ||
      request.nextUrl.pathname.startsWith('/settings')

    if (!session && isDashboard) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    console.error('Proxy auth error:', error)
    // On error, allow request to pass through rather than blocking
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
