"use client";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface SummaryStat {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

interface SummaryCardsProps {
  stats: SummaryStat[];
  isLoading?: boolean;
  /** How many placeholders to show before the first response arrives. */
  skeletonCount?: number;
}

/**
 * The headline figures above a report.
 *
 * Both screens use this rather than the dashboard's StatCards, which carries a
 * hardcoded "vs bulan lalu" delta the reports have no equivalent of -- these
 * numbers describe exactly the period the user picked and nothing else.
 */
export function SummaryCards({
  stats,
  isLoading,
  skeletonCount = 4,
}: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_item, index) => (
          <Card key={`summary-skeleton-${index}`}>
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label}>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {stat.label}
                </span>
                <Icon
                  className="text-muted-foreground size-4 shrink-0"
                  aria-hidden
                />
              </div>

              <p className="text-2xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>

              {stat.hint ? (
                <p className="text-muted-foreground text-xs">{stat.hint}</p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
