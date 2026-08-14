import type { Metadata } from "next";

import { NotBuiltYet } from "@/components/shared/not-built-yet";

export const metadata: Metadata = { title: "Keuangan" };

export default function Page() {
  return <NotBuiltYet title="Keuangan" description="Ringkasan pemasukan dan penarikan dana." />;
}
