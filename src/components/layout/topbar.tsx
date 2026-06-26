"use client";

import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Sun, Moon, Languages } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Maps the first path segment (after locale) to its nav translation key. */
const segmentToNavKey: Record<string, string> = {
  "": "nav.overview",
  operations: "nav.operations",
  flights: "nav.flights",
  reports: "nav.reports",
  analytics: "nav.analytics",
  "service-types": "nav.serviceTypes",
  stands: "nav.stands",
  units: "nav.units",
  users: "nav.users",
};

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

  const segment = pathname.replace(`/${locale}`, "").split("/")[1] ?? "";
  const titleKey = segmentToNavKey[segment] ?? "nav.overview";

  const handleLocaleChange = () => {
    const target = locale === "en" ? "ar" : "en";
    router.push(pathname.replace(`/${locale}`, `/${target}`));
  };

  const iconButton =
    "p-2 rounded-control text-text-secondary hover:bg-surface-variant hover:text-text-primary transition-colors";

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      <h1 className="text-lg font-extrabold text-text-primary">{t(titleKey)}</h1>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className={cn(iconButton, "relative")} aria-label={t("nav.reports")}>
          <Bell className="w-5 h-5" strokeWidth={2} />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-secondary-200 rounded-full ring-2 ring-surface" />
        </button>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={iconButton}
            aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" strokeWidth={2} />
            ) : (
              <Moon className="w-5 h-5" strokeWidth={2} />
            )}
          </button>
        )}

        {/* Locale toggle */}
        <button
          onClick={handleLocaleChange}
          className={cn(iconButton, "flex items-center gap-1.5")}
        >
          <Languages className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-semibold">
            {locale === "en" ? "AR" : "EN"}
          </span>
        </button>

        <div className="w-px h-6 bg-divider mx-1" />

        {/* Admin avatar */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center ring-2 ring-surface shadow-card">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-text-primary leading-tight">
              {t("common.administrator")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
