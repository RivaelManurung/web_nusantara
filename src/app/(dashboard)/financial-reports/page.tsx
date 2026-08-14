import type { Metadata } from "next";

import { FinancialReportPage } from "@/features/report/components/financial-report-page";

export const metadata: Metadata = { title: "Laporan Keuangan" };

export default function Page() {
  return <FinancialReportPage />;
}
