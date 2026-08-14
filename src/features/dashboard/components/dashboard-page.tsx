"use client";

import { Info } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";

import { OrdersBarChart } from "./orders-bar-chart";
import { ProductMixChart } from "./product-mix-chart";
import { SalesTrendChart } from "./sales-trend-chart";
import { StatCards } from "./stat-cards";

/**
 * The dashboard.
 *
 * The Vue original was the Mosaic template's demo page, unedited: thirteen
 * cards about "Acme Plus" and "Top Countries", none of them wired to the
 * Nusantara API. Nothing was invented to replace it -- the layout was reduced
 * to the four figures and three charts this business actually tracks, the
 * numbers are marked on screen as examples, and every one of them is a
 * constant at the top of its own component, so swapping in a real summary
 * endpoint is a local change.
 */
export function DashboardPage() {
  const name = useAuthStore((state) => state.profile?.name);

  return (
    <div className="space-y-6">
      <PageHeader
        description={
          name
            ? `Selamat datang kembali, ${name}.`
            : "Ringkasan aktivitas toko."
        }
      />

      <Alert>
        <Info className="size-4" aria-hidden />
        <AlertDescription>
          Angka dan grafik di halaman ini masih data contoh. Belum ada endpoint
          ringkasan dasbor di API.
        </AlertDescription>
      </Alert>

      <StatCards />

      <div className="grid gap-4 xl:grid-cols-3">
        <SalesTrendChart />
        <ProductMixChart />
        <OrdersBarChart />
      </div>
    </div>
  );
}
