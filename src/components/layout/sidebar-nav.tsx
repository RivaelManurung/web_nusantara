"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationFor } from "@/config/navigation";
import { canAccess } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface SidebarNavProps {
  /** Called after a link is followed, so the mobile drawer can close itself. */
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.profile?.role);

  const groups = navigationFor(role, (href) => canAccess(href, role));

  return (
    <nav className="space-y-6 px-3 py-4" aria-label="Navigasi utama">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-muted-foreground px-3 pb-2 text-xs font-semibold tracking-wider uppercase">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
