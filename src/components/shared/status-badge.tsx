import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  /** The API models status as an integer, where 1 means active. */
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({
  active,
  activeLabel = "Aktif",
  inactiveLabel = "Nonaktif",
}: StatusBadgeProps) {
  return (
    <Badge variant={active ? "default" : "secondary"}>
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}
