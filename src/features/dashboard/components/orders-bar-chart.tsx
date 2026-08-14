"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard, TOOLTIP_STYLE } from "./chart-card";

/** PLACEHOLDER DATA -- no orders-per-day endpoint exists yet. */
const PLACEHOLDER_SERIES = [
  { day: "Sen", online: 42, offline: 28 },
  { day: "Sel", online: 51, offline: 31 },
  { day: "Rab", online: 47, offline: 26 },
  { day: "Kam", online: 58, offline: 34 },
  { day: "Jum", online: 73, offline: 41 },
  { day: "Sab", online: 88, offline: 62 },
  { day: "Min", online: 69, offline: 55 },
];

export function OrdersBarChart() {
  return (
    <ChartCard
      title="Pesanan per hari"
      description="Contoh data — belum terhubung ke API."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={PLACEHOLDER_SERIES}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          />
          <Legend
            wrapperStyle={{
              fontSize: "0.75rem",
              color: "var(--color-muted-foreground)",
            }}
          />

          <Bar
            dataKey="online"
            name="Online"
            fill="var(--color-chart-1)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="offline"
            name="Kasir"
            fill="var(--color-chart-3)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
