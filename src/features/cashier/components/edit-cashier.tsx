"use client";

import { FormPage } from "@/components/shared/form-page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";

import { useCashier } from "../queries";
import { CashierForm } from "./cashier-form";

/**
 * Loads the record before mounting the form, so the inputs are seeded with real
 * values on their first render rather than being overwritten a moment later.
 */
export function EditCashier({ id }: { id: string }) {
  const { data, isLoading, error } = useCashier(id);

  return (
    <FormPage backHref={ROUTES.cashierManagement}>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : error || !data ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError
              ? error.message
              : "Kasir tidak ditemukan."}
          </AlertDescription>
        </Alert>
      ) : (
        <CashierForm editing={data} />
      )}
    </FormPage>
  );
}
