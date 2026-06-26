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
  
  let messages = {};
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
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
