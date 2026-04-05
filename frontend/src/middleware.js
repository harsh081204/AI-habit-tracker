import { NextResponse } from 'next/server';

// 1. Specify which paths are protected
const protectedRoutes = ['/journal', '/profile'];
const authRoutes = ['/login', '/signup'];

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Check if the path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // 3. SECURE THE PROTECTED ROUTES
  // If no token exists and user tries to access a protected route, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    // Optional: Add a redirect param to return here after login
    // url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 4. PREVENT LOGGED-IN USERS FROM SEEING AUTH PAGES
  // If user has a token and tries to access login/signup, send them to the journal
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/journal', request.url));
  }

  return NextResponse.next();
}

// 5. Config to avoid running on static files/api
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
