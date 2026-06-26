"use client";

import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Topbar() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  const handleThemeChange = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-text-primary">
          {t("nav.overview")}
        </h1>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="p-2 hover:bg-surface-variant rounded-lg transition-colors relative">
          <span className="text-xl">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-divider" />

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={handleThemeChange}
            className="p-2 hover:bg-surface-variant rounded-lg transition-colors"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <span className="text-xl">
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
          </button>
        )}

        {/* Locale Toggle */}
        <button
          onClick={() =>
            handleLocaleChange(locale === "en" ? "ar" : "en")
          }
          className="px-3 py-2 hover:bg-surface-variant rounded-lg transition-colors text-sm font-semibold text-text-secondary"
        >
          {locale === "en" ? "AR" : "EN"}
        </button>
      </div>
    </header>
  );
}
