"use client";

import React, { useEffect } from "react";

interface LocaleUpdaterProps {
  locale: string;
  manropeVar: string;
  tajawalVar: string;
  children: React.ReactNode;
}

export function LocaleUpdater({ locale, manropeVar, tajawalVar, children }: LocaleUpdaterProps) {
  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "ar" ? "rtl" : "ltr";
    html.classList.add(manropeVar, tajawalVar);
    document.body.style.fontFamily = "var(--font-manrope), var(--font-tajawal)";
  }, [locale, manropeVar, tajawalVar]);

  return <>{children}</>;
}
