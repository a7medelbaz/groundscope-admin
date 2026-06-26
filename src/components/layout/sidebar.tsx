"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogoutButton } from "@/app/[locale]/(dashboard)/logout-button";
import { navIcons } from "@/lib/utils/nav-icons";
import { cn } from "@/lib/utils/cn";

const navigationGroups = [
  {
    label: "main",
    items: [
      { key: "nav.overview", href: "/" },
      { key: "nav.operations", href: "/operations" },
      { key: "nav.flights", href: "/flights" },
      { key: "nav.reports", href: "/reports" },
      { key: "nav.analytics", href: "/analytics" },
    ],
  },
  {
    label: "masterData",
    items: [
      { key: "nav.serviceTypes", href: "/service-types" },
      { key: "nav.stands", href: "/stands" },
      { key: "nav.units", href: "/units" },
      { key: "nav.users", href: "/users" },
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
    <aside className="w-64 bg-surface border-e border-border h-screen flex flex-col overflow-y-auto">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-control bg-gradient-brand flex items-center justify-center shadow-card">
          <span className="text-white font-extrabold text-lg">G</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-text-primary leading-tight truncate">
            {t("app.name")}
          </h2>
          <p className="text-[11px] text-text-hint leading-tight truncate">
            {t("app.tagline")}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-6">
        {navigationGroups.map((group, index) => (
          <div key={group.label}>
            {index > 0 && (
              <p className="text-[11px] font-semibold text-text-hint uppercase tracking-wide px-3 mb-2">
                {t("nav.masterData")}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = navIcons[item.key];
                const active = isActiveLink(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors",
                        active
                          ? "text-primary-200 font-semibold bg-primary-200/10"
                          : "text-text-secondary hover:bg-surface-variant hover:text-text-primary"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-rail"
                          className="absolute inset-y-1.5 start-0 w-1 rounded-full bg-primary-200"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      {Icon && <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />}
                      <span className="text-sm">{t(item.key)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-divider">
        <LogoutButton />
      </div>
    </aside>
  );
}
