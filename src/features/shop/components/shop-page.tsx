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

import { useDeleteShop, useSetShopStatus, useShops } from "../queries";
import type { Shop } from "../types";
import { ShopFormDialog } from "./shop-form-dialog";
import { useShopColumns } from "./shop-table";

export function ShopPage() {
  const { params, setPage, setSearch } = useListParams();
  const { data, isLoading, isFetching, error } = useShops(params);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Shop | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Shop | null>(null);

  const statusMutation = useSetShopStatus();
  const deleteMutation = useDeleteShop();

  const handleEdit = useCallback((row: Shop) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    (row: Shop) => statusMutation.mutate({ id: row.id, isActive: !row.isActive }),
    [statusMutation],
  );

  const columns = useShopColumns({
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
        title="Manajemen Toko"
        description="Daftar toko beserta kasir dan produk yang ditugaskan."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden />
            Tambah Toko
          </Button>
        }
      />

      <SearchInput
        value={params.search}
        onChange={setSearch}
        placeholder="Cari nama atau alamat toko…"
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
                ? `Tidak ada toko yang cocok dengan “${params.search}”.`
                : "Belum ada toko."
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

      <ShopFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Hapus toko?"
        description={`“${pendingDelete?.name}” akan dihapus beserta penugasan kasir dan stok produknya.`}
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
