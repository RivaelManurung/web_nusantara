"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { canAccess, ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Blocks a page until the session is known, then enforces the route's roles.
 *
 * The middleware already turns anonymous visitors away, but it cannot see the
 * user's role: the session marker cookie deliberately carries no claims. Role
 * checks therefore happen here, where the profile is loaded.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isReady } = useAuthStore();

  const allowed = canAccess(pathname, profile?.role);

  useEffect(() => {
    if (!isReady) return;

    if (!profile) {
      router.replace(ROUTES.login);
      return;
    }
    if (!allowed) {
      router.replace(ROUTES.forbidden);
    }
  }, [allowed, isReady, profile, router]);

  if (!isReady || !profile || !allowed) {
    return <PageSkeleton />;
  }

  return <>{children}</>;
}

function PageSkeleton() {
  return (
    <div className="space-y-4 p-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman…</span>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
