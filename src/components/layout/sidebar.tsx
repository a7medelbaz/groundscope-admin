"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/app/[locale]/(dashboard)/logout-button";

const navigationGroups = [
  {
    label: "main",
    items: [
      { key: "nav.overview", href: "/", icon: "📊" },
      { key: "nav.operations", href: "/operations", icon: "⚙️" },
      { key: "nav.flights", href: "/flights", icon: "✈️" },
      { key: "nav.reports", href: "/reports", icon: "📋" },
      { key: "nav.analytics", href: "/analytics", icon: "📈" },
    ],
  },
  {
    label: "masterData",
    items: [
      { key: "nav.serviceTypes", href: "/service-types", icon: "🏷️" },
      { key: "nav.stands", href: "/stands", icon: "🅿️" },
      { key: "nav.units", href: "/units", icon: "🚗" },
      { key: "nav.users", href: "/users", icon: "👥" },
    ],
  },
];

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/en" || pathname === "/ar";
    }
    return pathname.includes(href);
  };

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-divider">
        <h2 className="text-xl font-bold text-text-primary">{t("app.name")}</h2>
        <p className="text-xs text-text-hint mt-1">{t("app.tagline")}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        {navigationGroups.map((group, index) => (
          <div key={group.label}>
            {index > 0 && (
              <p className="text-xs font-semibold text-text-hint uppercase px-2 mb-3">
                {t(`nav.masterData`)}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActiveLink(item.href)
                        ? "bg-primary-200/15 text-primary-200 font-semibold"
                        : "text-text-secondary hover:bg-surface-variant"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{t(item.key)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-divider">
        <LogoutButton />
      </div>
    </aside>
  );
}
