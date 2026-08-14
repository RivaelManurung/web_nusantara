"use client";

import { Plus } from "lucide-react";
import { useCallback, useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useListParams } from "@/hooks/use-list-params";
import { ApiError } from "@/lib/api/errors";

import { useDeleteVoucher, useSetVoucherStatus, useVouchers } from "../queries";
import type { Voucher } from "../types";
import { VoucherFormDialog } from "./voucher-form-dialog";
import { useVoucherColumns } from "./voucher-table";

export function VoucherPage() {
  const { params, setPage, setSearch } = useListParams();
  const { data, isLoading, isFetching, error } = useVouchers(params);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Voucher | null>(null);

  const statusMutation = useSetVoucherStatus();
  const deleteMutation = useDeleteVoucher();

  const handleEdit = useCallback((row: Voucher) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    (row: Voucher) =>
      statusMutation.mutate({ id: row.id, isActive: !row.isActive }),
    [statusMutation],
  );

  const columns = useVoucherColumns({
    onEdit: handleEdit,
    onDelete: setPendingDelete,
    onToggleStatus: handleToggleStatus,
    isTogglingId: statusMutation.isPending ? statusMutation.variables?.id : null,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voucher"
        description="Kupon potongan harga yang ditukar pelanggan dengan poin."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
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

      <VoucherFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Hapus voucher?"
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
