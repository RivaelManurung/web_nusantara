import type { Metadata } from "next";

import { NotBuiltYet } from "@/components/shared/not-built-yet";

export const metadata: Metadata = { title: "Ulasan Pelanggan" };

export default function Page() {
  return <NotBuiltYet title="Ulasan Pelanggan" description="Ulasan dan penilaian dari pembeli." />;
}
