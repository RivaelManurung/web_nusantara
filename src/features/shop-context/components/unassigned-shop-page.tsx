"use client";

import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { useShopContextStore } from "@/features/shop-context/store";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Dead end for an admin who is not assigned to any shop.
 *
 * It sits outside the dashboard shell: there is no shop to manage, so a
 * sidebar full of per-shop pages would only offer links that bounce back here.
 */
export function UnassignedShopPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const clearShopContext = useShopContextStore((state) => state.clear);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    await logout();
    // Otherwise the next person to sign in on this browser inherits the choice.
    clearShopContext();
    toast.success("Anda telah keluar.");
    router.replace(ROUTES.login);
  }

  return (
    <main className="bg-muted/30 flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 py-6 text-center">
          <div className="bg-muted mx-auto flex size-14 items-center justify-center rounded-full">
            <TriangleAlert className="size-7 text-amber-500" aria-hidden />
          </div>

          <h1 className="text-xl font-semibold tracking-tight">
            Akses toko belum ditugaskan
          </h1>
          <p className="text-muted-foreground text-sm">
            Akun Anda belum ditugaskan ke toko mana pun. Hubungi Super Admin
            untuk mendapatkan akses dan mulai mengelola toko.
          </p>

          <Button
            onClick={handleLogout}
            disabled={isSigningOut}
            className="w-full"
          >
            {isSigningOut ? "Keluar…" : "Keluar"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
