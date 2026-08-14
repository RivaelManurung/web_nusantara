"use client";

import {
  ClipboardList,
  Package,
  TrendingDown,
  TrendingUp,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * PLACEHOLDER DATA -- there is no dashboard summary endpoint yet.
 *
 * The Vue dashboard was the unmodified Mosaic template: "Acme Plus", "$24,780",
 * "Top Countries". Rather than carry that fiction across, the numbers here are
 * flagged as examples on screen and are the only thing to replace once the API
 * gains a summary route.
 */
const PLACEHOLDER_STATS: Stat[] = [
  {
    label: "Penjualan bulan ini",
    value: formatCurrency(24_780_000),
    deltaPercent: 12.5,
    icon: Wallet,
  },
  {
    label: "Pesanan",
    value: "1.284",
    deltaPercent: 4.2,
    icon: ClipboardList,
  },
  {
    label: "Produk aktif",
    value: "342",
    deltaPercent: -1.8,
    icon: Package,
  },
  {
    label: "Pelanggan baru",
    value: "168",
    deltaPercent: 9.1,
    icon: UsersRound,
  },
];

interface Stat {
  label: string;
  value: string;
  /** Change against the previous period; negative renders as a decline. */
  deltaPercent: number;
  icon: LucideIcon;
}

export function StatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {PLACEHOLDER_STATS.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  const isUp = stat.deltaPercent >= 0;
  const DeltaIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {stat.label}
          </span>
          <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
        </div>

        <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>

        <p
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isUp
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive",
          )}
        >
          <DeltaIcon className="size-3.5" aria-hidden />
          {isUp ? "+" : ""}
          {stat.deltaPercent.toLocaleString("id-ID", {
            maximumFractionDigits: 1,
          })}
          %
          <span className="text-muted-foreground font-normal">
            vs bulan lalu
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
