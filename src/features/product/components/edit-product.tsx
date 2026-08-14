"use client";

import { FormPage } from "@/components/shared/form-page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";

import { useProduct } from "../queries";
import { ProductForm } from "./product-form";

/**
 * Loads the record before mounting the form, so the inputs are seeded with real
 * values on their first render rather than being overwritten a moment later.
 */
export function EditProduct({ id }: { id: string }) {
  const { data, isLoading, error } = useProduct(id);

  return (
    <FormPage backHref={ROUTES.products}>
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : error || !data ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError
              ? error.message
              : "Produk tidak ditemukan."}
          </AlertDescription>
        </Alert>
      ) : (
        <ProductForm editing={data} />
      )}
    </FormPage>
  );
}
