"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FormPageProps {
  /** Where "back" and "cancel" return to. */
  backHref: string;
  backLabel?: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Chrome for a create/edit screen.
 *
 * The card spans the content area rather than sitting in a narrow column: on a
 * desktop the capped width left most of the screen empty while the form itself
 * scrolled. Field grids inside decide their own column count, so the extra
 * width becomes more fields per row, not longer lines of text.
 */
export function FormPage({
  backHref,
  backLabel = "Kembali",
  description,
  children,
}: FormPageProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          render={<Link href={backHref} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {backLabel}
        </Button>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>

      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </div>
  );
}
