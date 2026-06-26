import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import React from "react";
import { LocaleHtmlUpdater } from "@/components/locale-html-updater";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <>
      <LocaleHtmlUpdater locale={locale} />
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </ThemeProvider>
    </>
  );
}
