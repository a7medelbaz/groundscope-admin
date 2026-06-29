import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "ar"] as const;

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale: "en",
  localePrefix: "always",
});

export async function middleware(request: NextRequest) {
  // Run locale routing first; its response carries any cookies we refresh below.
  const response = intlMiddleware(request);

  // Refresh the Supabase auth session on every request and write the rotated
  // tokens back onto the response. Without this, the access token silently
  // expires (~1h) and server-side reads return empty rows under RLS.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Authentication gate. If Supabase is unreachable or misconfigured we fail
  // OPEN (return the normal response) so an outage can't hard-lock the whole app.
  let isAuthenticated = false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {
    return response;
  }

  const { pathname } = request.nextUrl;
  const locale = locales.find((l) => pathname.startsWith(`/${l}`)) ?? "en";
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
  const isLoginPage = pathWithoutLocale.startsWith("/login");

  // Not signed in and not on the login page → send to login.
  if (!isAuthenticated && !isLoginPage) {
    return redirectPreservingCookies(request, response, `/${locale}/login`);
  }

  // Already signed in but sitting on the login page → send into the app.
  if (isAuthenticated && isLoginPage) {
    return redirectPreservingCookies(request, response, `/${locale}`);
  }

  return response;
}

/** Redirect while keeping the refreshed Supabase auth cookies from `response`. */
function redirectPreservingCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
