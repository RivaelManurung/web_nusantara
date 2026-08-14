"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/routes";
import { useShopContextStore } from "@/features/shop-context/store";
import { useAuthStore } from "@/stores/auth-store";

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin Toko",
  cashier: "Kasir",
  customer: "Pelanggan",
};

export function ProfileMenu() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!profile) return null;

  async function handleLogout() {
    setIsSigningOut(true);
    await logout();
    // The selected shop outlives the session otherwise, so the next admin to
    // sign in on this browser starts out managing the previous one's shop.
    useShopContextStore.getState().clear();
    toast.success("Anda telah keluar.");
    router.replace(ROUTES.login);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
            <Avatar className="size-8">
              <AvatarImage src={profile.photo} alt="" />
              <AvatarFallback>{initials(profile.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-left sm:block">
              <span className="block text-sm leading-tight font-medium">
                {profile.name}
              </span>
              <span className="text-muted-foreground block text-xs leading-tight">
                {ROLE_LABELS[profile.role] ?? profile.role}
              </span>
            </span>
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium">{profile.name}</span>
          <span className="text-muted-foreground block text-xs">
            {profile.email ?? profile.phone ?? "-"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href={ROUTES.settings} />}>
          <UserRound className="size-4" aria-hidden />
          Profil Saya
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={ROUTES.settings} />}>
          <Settings className="size-4" aria-hidden />
          Pengaturan
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isSigningOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" aria-hidden />
          {isSigningOut ? "Keluar…" : "Keluar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
