import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary">
        {t("app.name")}
      </h1>
      <p className="text-text-secondary mt-2">
        Phase 1: Foundation — App is running!
      </p>
      <p className="text-text-hint mt-4">
        Next: Implement Phase 2 (Authentication)
      </p>
    </div>
  );
}
