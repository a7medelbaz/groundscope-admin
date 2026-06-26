import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth routes to pass through
  if (pathname.includes("/(auth)") || pathname.includes("/login")) {
    return intlMiddleware(request);
  }

  // 🔖 //TODO: Add session check for protected (dashboard) routes
  // For now, let intl middleware handle routing
  // After Phase 2, add: if (pathname.includes("/(dashboard)")) { check session }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
