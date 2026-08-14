"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // Transitions on every colour token make the theme switch look like a
      // flash rather than a change.
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
