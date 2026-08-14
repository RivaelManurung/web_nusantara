"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Frame shared by every chart on the dashboard.
 *
 * Recharts' ResponsiveContainer measures its parent, so the fixed height lives
 * here: a chart inside an auto-height box measures zero and never paints.
 */
export function ChartCard({
  title,
  description,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

/** Tooltip chrome, matched to the popover tokens so both themes work. */
export const TOOLTIP_STYLE = {
  backgroundColor: "var(--color-popover)",
  color: "var(--color-popover-foreground)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  fontSize: "0.8125rem",
} as const;
