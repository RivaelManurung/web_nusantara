"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ProfileMenu } from "@/components/layout/profile-menu";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ShopSwitcher } from "@/features/shop-context/components/shop-switcher";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/config/routes";

/**
 * The dashboard chrome: a fixed sidebar on desktop, a drawer on mobile.
 *
 * The Vue app kept sidebar open/closed state in a Pinia store shared across
 * routes, which meant the drawer stayed open behind the new page after
 * navigating. Here the drawer owns its own state and closes on navigate.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="bg-muted/30 flex min-h-svh">
      <aside className="bg-background hidden w-64 shrink-0 border-r lg:block">
        <div className="flex h-16 items-center border-b px-5">
          <BrandMark />
        </div>
        <ScrollArea className="h-[calc(100svh-4rem)]">
          <SidebarNav />
        </ScrollArea>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Buka menu"
                  >
                    <Menu className="size-5" aria-hidden />
                  </Button>
                }
              />
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigasi</SheetTitle>
                <div className="flex h-16 items-center border-b px-5">
                  <BrandMark />
                </div>
                <ScrollArea className="h-[calc(100svh-4rem)]">
                  <SidebarNav onNavigate={() => setDrawerOpen(false)} />
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <div className="lg:hidden">
              <BrandMark />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Self-hides for roles that manage no shop. */}
            <ShopSwitcher />
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <Link href={ROUTES.dashboard} className="flex items-center gap-2">
      <Image
        src="/images/logo.png"
        alt=""
        width={32}
        height={32}
        className="size-8 rounded-md object-contain"
      />
      <span className="text-base font-semibold tracking-tight">Nusantara</span>
    </Link>
  );
}
