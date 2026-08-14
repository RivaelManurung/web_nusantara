"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { useListParams } from "@/hooks/use-list-params";
import { ApiError } from "@/lib/api/errors";

import { useDeleteVoucher, useSetVoucherStatus, useVouchers } from "../queries";
import type { Voucher } from "../types";
import { useVoucherColumns } from "./voucher-table";

export function VoucherPage() {
  const { params, setPage, setSearch } = useListParams();
  const { data, isLoading, isFetching, error } = useVouchers(params);

  const [pendingDelete, setPendingDelete] = useState<Voucher | null>(null);

  const statusMutation = useSetVoucherStatus();
  const deleteMutation = useDeleteVoucher();

  const handleToggleStatus = useCallback(
    (row: Voucher) =>
      statusMutation.mutate({ id: row.id, isActive: !row.isActive }),
    [statusMutation],
  );

  const columns = useVoucherColumns({
    editHref: (row) => `${ROUTES.vouchers}/${row.id}/edit`,
    onDelete: setPendingDelete,
    onToggleStatus: handleToggleStatus,
    isTogglingId: statusMutation.isPending
      ? statusMutation.variables?.id
      : null,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        description="Kupon potongan harga yang ditukar pelanggan dengan poin."
        actions={
          <Button render={<Link href={`${ROUTES.vouchers}/new`} />}>
            <Plus className="size-4" aria-hidden />
            Tambah voucher
          </Button>
        }
      />

      <SearchInput
        value={params.search}
        onChange={setSearch}
        placeholder="Cari kode voucher…"
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError ? error.message : "Gagal memuat data."}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            rowHref={(voucher) => `${ROUTES.vouchers}/${voucher.id}/edit`}
            emptyMessage={
              params.search
                ? `Tidak ada voucher yang cocok dengan “${params.search}”.`
                : "Belum ada voucher."
            }
          />

          {data ? (
            <Pagination
              pagination={data.pagination}
              onPageChange={setPage}
              isLoading={isFetching}
            />
          ) : null}
        </>
      )}

      <ConfirmDialog
        title="Hapus voucher?"
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        description={`“${pendingDelete?.code}” akan dihapus. Voucher yang sudah diklaim pelanggan bisa ikut terpengaruh.`}
        confirmLabel="Hapus"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteMutation.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
