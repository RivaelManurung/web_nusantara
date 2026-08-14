import type { Metadata } from "next";

import { NotBuiltYet } from "@/components/shared/not-built-yet";

export const metadata: Metadata = { title: "Laporan Transaksi" };

export default function Page() {
  return <NotBuiltYet title="Laporan Transaksi" description="Rekap transaksi per periode." />;
}
