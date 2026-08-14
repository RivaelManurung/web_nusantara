import type { Metadata } from "next";

import { NotBuiltYet } from "@/components/shared/not-built-yet";

export const metadata: Metadata = { title: "Pesanan" };

export default function Page() {
  return <NotBuiltYet title="Pesanan" description="Daftar pesanan yang masuk ke toko Anda." />;
}
