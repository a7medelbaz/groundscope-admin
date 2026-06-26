import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default function DashboardPage() {
  const t = useTranslations();

  return (
    <>
      <PageHeader
        title={t("nav.overview")}
        description="Real-time airport ground services coordination"
      />

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t("app.name")} Admin Dashboard
          </h2>

          <ul className="space-y-3 text-text-secondary">
            <li className="flex items-start gap-3">
              <span>✅</span>
              <div>
                <p className="font-semibold text-text-primary">Phase 1: Foundation</p>
                <p className="text-sm text-text-hint">Design system, i18n, theme setup</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span>✅</span>
              <div>
                <p className="font-semibold text-text-primary">Phase 2: Authentication</p>
                <p className="text-sm text-text-hint">Login and admin-only access control</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span>✅</span>
              <div>
                <p className="font-semibold text-text-primary">Phase 3: Layout Shell</p>
                <p className="text-sm text-text-hint">Sidebar, Topbar, UI primitives</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span>🔄</span>
              <div>
                <p className="font-semibold text-text-primary">Phase 4-12: Feature Modules</p>
                <p className="text-sm text-text-hint">CRUD operations and real-time features</p>
              </div>
            </li>
          </ul>

          <p className="text-text-hint text-sm pt-4 border-t border-divider">
            You are logged in as an admin. Navigate using the sidebar to access different modules.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
