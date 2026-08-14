import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = { title: "Akses Ditolak" };

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <ShieldAlert className="text-muted-foreground size-12" aria-hidden />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Akses Ditolak</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Peran akun Anda tidak memiliki izin untuk membuka halaman ini. Hubungi
          administrator bila Anda merasa ini keliru.
        </p>
      </div>
      <Button render={<Link href={ROUTES.dashboard} />}>
        Kembali ke Dasbor
      </Button>
    </div>
  );
}
