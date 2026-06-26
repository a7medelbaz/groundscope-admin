import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
