"use client";

import { FormPage } from "@/components/shared/form-page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";

import { useTypeProduct } from "../queries";
import { TypeProductForm } from "./type-product-form";

/**
 * Loads the record before mounting the form, so the inputs are seeded with real
 * values on their first render rather than being overwritten a moment later.
 */
export function EditTypeProduct({ id }: { id: string }) {
  const { data, isLoading, error } = useTypeProduct(id);

  return (
    <FormPage backHref={ROUTES.productTypes}>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : error || !data ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError
              ? error.message
              : "Tipe produk tidak ditemukan."}
          </AlertDescription>
        </Alert>
      ) : (
        <TypeProductForm editing={data} />
      )}
    </FormPage>
  );
}
