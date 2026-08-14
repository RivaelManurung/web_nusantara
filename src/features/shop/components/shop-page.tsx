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

import { useDeleteShop, useSetShopStatus, useShops } from "../queries";
import type { Shop } from "../types";
import { useShopColumns } from "./shop-table";

export function ShopPage() {
  const { params, setPage, setSearch } = useListParams();
  const { data, isLoading, isFetching, error } = useShops(params);

  const [pendingDelete, setPendingDelete] = useState<Shop | null>(null);

  const statusMutation = useSetShopStatus();
  const deleteMutation = useDeleteShop();

  const handleToggleStatus = useCallback(
    (row: Shop) =>
      statusMutation.mutate({ id: row.id, isActive: !row.isActive }),
    [statusMutation],
  );

  const columns = useShopColumns({
    editHref: (row) => `${ROUTES.storeManagement}/${row.id}/edit`,
    onDelete: setPendingDelete,
    onToggleStatus: handleToggleStatus,
    isTogglingId: statusMutation.isPending
      ? statusMutation.variables?.id
      : null,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        description="Daftar toko beserta kasir dan produk yang ditugaskan."
        actions={
          <Button render={<Link href={`${ROUTES.storeManagement}/new`} />}>
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
            rowHref={(shop) => `${ROUTES.storeManagement}/${shop.id}/edit`}
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

      <ConfirmDialog
        title="Hapus toko?"
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
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
