import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Staff paneli rotalarını koruma
  if (request.nextUrl.pathname.startsWith('/students') || 
      request.nextUrl.pathname.startsWith('/courses') ||
      request.nextUrl.pathname.startsWith('/attendance')) {
    
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/staff-login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/students/:path*', '/courses/:path*', '/attendance/:path*']
}