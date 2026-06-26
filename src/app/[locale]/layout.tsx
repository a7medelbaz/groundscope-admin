import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { Manrope, Tajawal } from "next/font/google";
import React from "react";
import { LocaleUpdater } from "@/components/locale-updater";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const tajawal = Tajawal({
  weight: ["400", "500", "700", "800"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Load messages directly — avoids the next-intl config file discovery requirement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let messages: Record<string, any> = {};
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    // fallback to English if locale file missing
    try {
      messages = (await import(`@/messages/en.json`)).default;
    } catch {
      // no messages available, translations will show keys
    }
  }

  return (
    <LocaleUpdater locale={locale} manropeVar={manrope.variable} tajawalVar={tajawal.variable}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </ThemeProvider>
    </LocaleUpdater>
  );
}
