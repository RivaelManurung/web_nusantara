import type { Metadata } from "next";

import { RolePage } from "@/features/role/components/role-page";

export const metadata: Metadata = { title: "Manajemen Role dan Akses" };

export default function Page() {
  return <RolePage />;
}
