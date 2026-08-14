"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompact, formatCurrency } from "@/lib/format";

import { ChartCard, TOOLTIP_STYLE } from "./chart-card";

/** PLACEHOLDER DATA -- no sales-over-time endpoint exists yet. */
const PLACEHOLDER_SERIES = [
  { month: "Jan", current: 18_200_000, previous: 15_400_000 },
  { month: "Feb", current: 21_500_000, previous: 17_900_000 },
  { month: "Mar", current: 19_800_000, previous: 18_600_000 },
  { month: "Apr", current: 24_100_000, previous: 19_200_000 },
  { month: "Mei", current: 26_700_000, previous: 21_800_000 },
  { month: "Jun", current: 23_400_000, previous: 22_400_000 },
  { month: "Jul", current: 28_900_000, previous: 23_100_000 },
  { month: "Agu", current: 31_200_000, previous: 24_700_000 },
];

export function SalesTrendChart() {
  return (
    <ChartCard
      title="Penjualan per bulan"
      description="Contoh data — belum terhubung ke API."
      className="xl:col-span-2"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={PLACEHOLDER_SERIES}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="sales-current-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-chart-1)"
                stopOpacity={0.45}
              />
              <stop
                offset="100%"
                stopColor="var(--color-chart-1)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
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

          <Area
            type="monotone"
            dataKey="current"
            name="Tahun ini"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="url(#sales-current-fill)"
          />
          <Area
            type="monotone"
            dataKey="previous"
            name="Tahun lalu"
            stroke="var(--color-chart-3)"
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
