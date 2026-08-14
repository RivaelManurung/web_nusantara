"use client";

import { Check, ChevronDown, Loader2, Store } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";

import { useShopContext } from "../queries";

/**
 * "Which shop am I managing" control, for the dashboard header.
 *
 * Three states, as in the Vue original: a spinner while the assignment loads,
 * a plain label when there is exactly one shop (nothing to switch to), and a
 * menu otherwise.
 *
 * It also owns the redirect for an admin with no shop at all. The Vue app did
 * this in a router guard; here it lives with the query that already knows the
 * answer, and this component is mounted on every dashboard page, so the effect
 * is the same without a second place to fetch the list.
 */
export function ShopSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuthStore((state) => state.profile?.role);

  const { shops, activeShop, activeShopId, hasAssignedShops, isLoading, selectShop } =
    useShopContext();

  useEffect(() => {
    if (role !== "admin") return;
    if (hasAssignedShops !== false) return;
    if (pathname === ROUTES.unassignedShop) return;

    router.replace(ROUTES.unassignedShop);
  }, [hasAssignedShops, pathname, role, router]);

  if (role !== "admin") return null;

  if (isLoading) {
    return (
      <div
        className="text-muted-foreground flex items-center gap-2 px-3 text-sm"
        aria-live="polite"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden />
        <span className="hidden sm:inline">Memuat toko…</span>
      </div>
    );
  }

  if (shops.length === 0) return null;

  if (shops.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3">
        <Store className="text-muted-foreground size-4" aria-hidden />
        <span className="max-w-40 truncate text-sm font-medium">
          {shops[0].name}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-auto gap-2 px-2 py-1.5"
            aria-label="Pilih toko aktif"
          >
            <Store className="text-muted-foreground size-4" aria-hidden />
            <span className="hidden text-left lg:block">
              <span className="text-muted-foreground block text-xs leading-tight">
                Toko aktif
              </span>
              <span className="block max-w-40 truncate text-sm leading-tight font-medium">
                {activeShop?.name ?? "Pilih toko"}
              </span>
            </span>
            <ChevronDown
              className="text-muted-foreground hidden size-4 lg:block"
              aria-hidden
            />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Pilih toko</DropdownMenuLabel>
        {shops.map((shop) => (
          <DropdownMenuItem
            key={shop.id}
            onClick={() => selectShop(shop.id)}
            className="justify-between gap-2"
          >
            <span className="truncate">{shop.name}</span>
            {shop.id === activeShopId ? (
              <Check className="size-4" aria-hidden />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
