"use client";

import { FormPage } from "@/components/shared/form-page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";

import { useVoucher } from "../queries";
import { VoucherForm } from "./voucher-form";

/**
 * Loads the record before mounting the form, so the inputs are seeded with real
 * values on their first render rather than being overwritten a moment later.
 */
export function EditVoucher({ id }: { id: string }) {
  const { data, isLoading, error } = useVoucher(id);

  return (
    <FormPage backHref={ROUTES.vouchers}>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : error || !data ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError
              ? error.message
              : "Voucher tidak ditemukan."}
          </AlertDescription>
        </Alert>
      ) : (
        <VoucherForm editing={data} />
      )}
    </FormPage>
  );
}
