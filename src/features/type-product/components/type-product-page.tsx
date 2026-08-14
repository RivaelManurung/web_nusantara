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

import {
  useDeleteTypeProduct,
  useSetTypeProductStatus,
  useTypeProducts,
} from "../queries";
import type { TypeProduct } from "../types";
import { useTypeProductColumns } from "./type-product-table";

/**
 * Reference implementation for a list screen.
 *
 * Every other CRUD feature follows this shape: params hook, one query, a form
 * dialog, a confirm dialog, and columns built by a hook.
 */
export function TypeProductPage() {
  const { params, setPage, setSearch } = useListParams();
  const { data, isLoading, isFetching, error } = useTypeProducts(params);

  const [pendingDelete, setPendingDelete] = useState<TypeProduct | null>(null);

  const statusMutation = useSetTypeProductStatus();
  const deleteMutation = useDeleteTypeProduct();

  const handleToggleStatus = useCallback(
    (row: TypeProduct) =>
      statusMutation.mutate({ id: row.id, isActive: !row.isActive }),
    [statusMutation],
  );

  const columns = useTypeProductColumns({
    editHref: (row) => `${ROUTES.productTypes}/${row.id}/edit`,
    onDelete: setPendingDelete,
    onToggleStatus: handleToggleStatus,
    isTogglingId: statusMutation.isPending
      ? statusMutation.variables?.id
      : null,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        description="Kelompok kategori yang dipakai katalog produk."
        actions={
          <Button render={<Link href={`${ROUTES.productTypes}/new`} />}>
            <Plus className="size-4" aria-hidden />
            Tambah Tipe
          </Button>
        }
      />

      <SearchInput
        value={params.search}
        onChange={setSearch}
        placeholder="Cari tipe produk…"
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
                ? `Tidak ada tipe produk yang cocok dengan “${params.search}”.`
                : "Belum ada tipe produk."
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
        title="Hapus tipe produk?"
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        description={`“${pendingDelete?.name}” akan dihapus. Produk yang memakai tipe ini bisa ikut terpengaruh.`}
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
