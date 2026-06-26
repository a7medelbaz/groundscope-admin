"use client";

import { useEffect } from "react";

interface LocaleHtmlUpdaterProps {
  locale: string;
}

export function LocaleHtmlUpdater({ locale }: LocaleHtmlUpdaterProps) {
  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
