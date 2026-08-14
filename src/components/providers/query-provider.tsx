"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ApiError } from "@/lib/api/errors";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Created in state so React does not build a second client on re-render, and
  // so each user gets their own cache during SSR.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry(failureCount, error) {
              // Retrying a rejected request cannot help and, for 429, actively
              // makes the lockout worse.
              if (
                error instanceof ApiError &&
                error.status > 0 &&
                error.status < 500
              ) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: { retry: false },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
