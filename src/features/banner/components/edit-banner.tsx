"use client";

import { FormPage } from "@/components/shared/form-page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";

import { useBanner } from "../queries";
import { BannerForm } from "./banner-form";

/**
 * Loads the record before mounting the form, so the inputs are seeded with real
 * values on their first render rather than being overwritten a moment later.
 */
export function EditBanner({ id }: { id: string }) {
  const { data, isLoading, error } = useBanner(id);

  return (
    <FormPage backHref={ROUTES.banners}>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : error || !data ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError
              ? error.message
              : "Banner tidak ditemukan."}
          </AlertDescription>
        </Alert>
      ) : (
        <BannerForm editing={data} />
      )}
    </FormPage>
  );
}
