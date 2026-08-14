"use client";

import { useCallback } from "react";
import type { FieldErrors } from "react-hook-form";
import { toast } from "sonner";

/**
 * Announces a rejected submit.
 *
 * Inline messages alone are easy to miss: on a long form the first invalid
 * field is often scrolled out of view, so pressing Simpan appears to do
 * nothing. This raises a toast, names the fields, and moves focus to the first
 * one.
 */
export function useInvalidSubmit() {
  return useCallback((errors: FieldErrors) => {
    const names = Object.keys(errors);
    if (names.length === 0) return;

    const first = names[0];
    toast.error(
      names.length === 1
        ? "Ada 1 isian yang belum benar."
        : `Ada ${names.length} isian yang belum benar.`,
      { description: "Periksa kolom yang ditandai merah." },
    );

    // Fall back to the id convention the forms use when the field is not a
    // plain input react-hook-form can focus itself.
    const el =
      document.querySelector<HTMLElement>(`[name="${first}"]`) ??
      document.getElementById(first);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus?.();
  }, []);
}
