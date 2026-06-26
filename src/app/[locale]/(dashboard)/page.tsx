import { useTranslations } from "next-intl";
import { LogoutButton } from "./logout-button";

export default function DashboardPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              {t("nav.overview")}
            </h1>
            <p className="text-text-secondary">
              Phase 2: Authentication — Admin access verified
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Status Card */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {t("app.name")} Admin Dashboard
          </h2>
          <ul className="space-y-2 text-text-secondary">
            <li>✅ Phase 1: Foundation — Design system, i18n, theme</li>
            <li>✅ Phase 2: Authentication — Login and admin gate</li>
            <li>🔄 Phase 3: Layout shell (coming next)</li>
            <li>📋 Phase 4-12: Feature modules</li>
          </ul>
          <p className="text-text-hint text-sm mt-4">
            You are logged in as an admin. This is a placeholder dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
