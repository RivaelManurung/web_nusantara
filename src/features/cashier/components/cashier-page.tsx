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

import {
  useCashiers,
  useDeleteCashier,
  useSetCashierStatus,
} from "../queries";
import type { Cashier } from "../types";
import { CashierFormDialog } from "./cashier-form-dialog";
import { useCashierColumns } from "./cashier-table";

export function CashierPage() {
  const { params, setPage, setSearch } = useListParams();
  const { data, isLoading, isFetching, error } = useCashiers(params);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cashier | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Cashier | null>(null);

  const statusMutation = useSetCashierStatus();
  const deleteMutation = useDeleteCashier();

  const handleEdit = useCallback((row: Cashier) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    (row: Cashier) =>
      statusMutation.mutate({ id: row.id, isActive: !row.isActive }),
    [statusMutation],
  );

  const columns = useCashierColumns({
    onEdit: handleEdit,
    onDelete: setPendingDelete,
    onToggleStatus: handleToggleStatus,
    isTogglingId: statusMutation.isPending
      ? statusMutation.variables?.id
      : null,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Kasir"
        description="Akun kasir yang dapat ditugaskan ke toko."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden />
            Tambah Kasir
          </Button>
        }
      />

      <SearchInput
        value={params.search}
        onChange={setSearch}
        placeholder="Cari nama atau email kasir…"
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
                ? `Tidak ada kasir yang cocok dengan “${params.search}”.`
                : "Belum ada kasir."
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

      <CashierFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Hapus kasir?"
        description={`Akun “${pendingDelete?.name}” akan dihapus dan tidak dapat lagi masuk ke aplikasi.`}
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
