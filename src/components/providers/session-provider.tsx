"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { ROUTES } from "@/config/routes";
import { setSessionExpiredHandler } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Restores the stored session once, and wires the API client's "session is
 * gone" signal to a redirect.
 *
 * The Vue app put this redirect inside its axios interceptor, which meant the
 * transport layer imported the store and the router. Here the client only
 * raises a callback and this component decides what that means for navigation.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const restore = useAuthStore((state) => state.restore);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    void restore();
  }, [restore]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      clear();
      toast.error("Sesi Anda telah berakhir. Silakan masuk kembali.");
      router.replace(ROUTES.login);
    });

    return () => setSessionExpiredHandler(() => {});
  }, [clear, router]);

  return <>{children}</>;
}
