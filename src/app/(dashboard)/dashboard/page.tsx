import type { Metadata } from "next";

import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

export const metadata: Metadata = { title: "Dasbor" };

export default function Page() {
  return <DashboardPage />;
}
