"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartCard,
  TOOLTIP_STYLE,
} from "@/features/dashboard/components/chart-card";
import { formatCompact, formatCurrency, formatDate } from "@/lib/format";

import type { Granularity, RevenuePoint } from "../types";

const MONTH_LABEL = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
});

/**
 * Human label for a bucket.
 *
 * The API sends the first day of the bucket in every granularity, so a monthly
 * point would otherwise read "1 Mar 2026" -- correct but misleading, since the
 * value covers the whole month.
 */
function bucketLabel(bucket: string, granularity: Granularity): string {
  const date = new Date(`${bucket}T00:00:00`);
  if (Number.isNaN(date.getTime())) return bucket;

  if (granularity === "month") return MONTH_LABEL.format(date);
  if (granularity === "week") return `Mgg ${formatDate(date)}`;
  return formatDate(date);
}

interface RevenueChartProps {
  points: RevenuePoint[];
  granularity: Granularity;
  isLoading?: boolean;
}

/**
 * Revenue over time, plus the order count behind it.
 *
 * Two charts rather than one dual-axis chart: rupiah and order counts differ by
 * five orders of magnitude, and a shared axis makes one of the two series a
 * flat line along the bottom.
 */
export function RevenueChart({
  points,
  granularity,
  isLoading,
}: RevenueChartProps) {
  const series = points.map((point) => ({
    label: bucketLabel(point.bucket, granularity),
    gross: point.gross,
    net: point.net,
    orders: point.orderCount,
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <ChartCard
        title="Pendapatan"
        description="Bruto sebelum diskon dibanding neto yang diterima."
        className="xl:col-span-2"
      >
        {isLoading ? (
          <Skeleton className="size-full" />
        ) : series.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={series}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                tickFormatter={(value: number) => formatCompact(value)}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "0.75rem",
                  color: "var(--color-muted-foreground)",
                }}
              />

              <Line
                type="monotone"
                dataKey="gross"
                name="Bruto"
                stroke="var(--color-chart-3)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="net"
                name="Neto"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        title="Jumlah pesanan"
        description="Pesanan yang dihitung sebagai pendapatan."
      >
        {isLoading ? (
          <Skeleton className="size-full" />
        ) : series.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={series}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={36}
                allowDecimals={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
              />
              <Bar
                dataKey="orders"
                name="Pesanan"
                fill="var(--color-chart-1)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      Tidak ada pendapatan pada periode ini.
    </div>
  );
}
