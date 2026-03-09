import { NextResponse, type NextRequest } from 'next/server';

// Check if we're in development mode (no Supabase configured)
const isDevMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL === '' ||
                   process.env.NODE_ENV === 'development';

export async function middleware(request: NextRequest) {
  // In development mode, allow all routes without authentication
  // Authentication is handled client-side with localStorage mock
  if (isDevMode) {
    return NextResponse.next({
      request,
    });
  }

  // In production, use Supabase authentication
  // For now, just allow the request through
  // The full Supabase middleware is in src/lib/supabase/middleware.ts
  return NextResponse.next({
    request,
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
