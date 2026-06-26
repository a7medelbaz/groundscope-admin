import { getReportById } from "@/lib/queries/reports";
import { ReportDetailView } from "@/components/sections/report-detail-view";
import { PageHeader } from "@/components/ui/page-header";
import { ClipboardList } from "lucide-react";
import { notFound } from "next/navigation";

interface ReportDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const { id } = await params;

  let report;
  try {
    report = await getReportById(id);
  } catch (error) {
    console.error("Failed to fetch report:", error);
    notFound();
  }

  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Report Details" icon={ClipboardList} />
      <ReportDetailView report={report} />
    </div>
  );
}
