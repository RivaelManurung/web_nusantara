"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ChartCard, TOOLTIP_STYLE } from "./chart-card";

/** PLACEHOLDER DATA -- no sales-by-category endpoint exists yet. */
const PLACEHOLDER_SLICES = [
  { name: "Keripik & kerupuk", value: 38, color: "var(--color-chart-1)" },
  { name: "Minuman", value: 24, color: "var(--color-chart-2)" },
  { name: "Bumbu dapur", value: 19, color: "var(--color-chart-3)" },
  { name: "Kue kering", value: 12, color: "var(--color-chart-4)" },
  { name: "Lainnya", value: 7, color: "var(--color-chart-5)" },
];

export function ProductMixChart() {
  return (
    <ChartCard
      title="Penjualan per tipe produk"
      description="Contoh data — belum terhubung ke API."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={PLACEHOLDER_SLICES}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="var(--color-background)"
            strokeWidth={2}
          >
            {PLACEHOLDER_SLICES.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => `${Number(value)}%`}
          />
          <Legend
            wrapperStyle={{
              fontSize: "0.75rem",
              color: "var(--color-muted-foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
