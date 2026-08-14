import { Construction } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface NotBuiltYetProps {
  description: string;
}

/**
 * Placeholder for a route the sidebar offers but no feature implements yet.
 *
 * These five routes existed in the Vue app too, where they were wired to the
 * Dashboard component — so clicking "Pesanan" silently showed sales charts. An
 * honest empty state is better than a screen that looks like the wrong feature,
 * and better than a link that 404s.
 */
export function NotBuiltYet({ description }: NotBuiltYetProps) {
  return (
    <div className="space-y-6">
      <PageHeader description={description} />

      <Alert>
        <Construction className="size-4" aria-hidden />
        <AlertTitle>Halaman ini belum tersedia</AlertTitle>
        <AlertDescription>
          Fitur ini belum dipindahkan dari aplikasi lama. Menu-nya sengaja
          dibiarkan agar struktur navigasi tetap utuh.
        </AlertDescription>
      </Alert>
    </div>
  );
}
