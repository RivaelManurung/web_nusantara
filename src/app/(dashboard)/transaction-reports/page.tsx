import type { Metadata } from "next";

import { TransactionReportPage } from "@/features/report/components/transaction-report-page";

export const metadata: Metadata = { title: "Laporan Transaksi" };

export default function Page() {
  return <TransactionReportPage />;
}
