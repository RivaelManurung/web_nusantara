import type { Metadata } from "next";

import { NotBuiltYet } from "@/components/shared/not-built-yet";

export const metadata: Metadata = { title: "Laporan Keuangan" };

export default function Page() {
  return <NotBuiltYet title="Laporan Keuangan" description="Rekap keuangan per periode." />;
}
