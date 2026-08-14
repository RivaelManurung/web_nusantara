"use client";

import { FormPage } from "@/components/shared/form-page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";

import { useShop } from "../queries";
import { ShopForm } from "./shop-form";

/**
 * Loads the record before mounting the form, so the inputs are seeded with real
 * values on their first render rather than being overwritten a moment later.
 * The list response does not reliably carry the cashier and product relations,
 * which is why the detail endpoint is the source here.
 */
export function EditShop({ id }: { id: string }) {
  const { data, isLoading, error } = useShop(id);

  return (
    <FormPage backHref={ROUTES.storeManagement}>
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : error || !data ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError
              ? error.message
              : "Toko tidak ditemukan."}
          </AlertDescription>
        </Alert>
      ) : (
        <ShopForm editing={data} />
      )}
    </FormPage>
  );
}
