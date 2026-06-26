import { getRequestConfig } from "next-intl/server";

const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  const validLocale = (locale || "en") as Locale;

  if (!locales.includes(validLocale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  return {
    messages: (await import(`./messages/${validLocale}.json`)).default,
    timeZone: "UTC" as const,
    now: new Date(),
    locale: validLocale,
  };
});
