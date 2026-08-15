import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { statusLabel, statusTone, type StatusTone } from "../types";

/**
 * The status of one order.
 *
 * components/shared/status-badge.tsx cannot serve here: it models a boolean
 * (aktif / nonaktif), while an order moves through twelve states that read very
 * differently -- "Dibatalkan" and "Selesai" are both terminal but must never
 * look alike at a glance.
 *
 * Colour is never the only signal. The label always spells the status out, so
 * the badge stays readable in greyscale and to anyone who cannot separate the
 * red from the green.
 */
const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  waiting:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  progress: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  danger: "bg-destructive/10 text-destructive dark:bg-destructive/20",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent", TONE_CLASSES[statusTone(status)])}
    >
      {statusLabel(status)}
    </Badge>
  );
}
