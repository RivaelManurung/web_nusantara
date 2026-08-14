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

import { useDeleteProduct, useProducts, useSetProductStatus } from "../queries";
import type { Product } from "../types";
import { ProductGalleryDialog } from "./product-gallery-dialog";
import { useProductColumns } from "./product-table";

export function ProductPage() {
  const { params, setPage, setSearch } = useListParams();
  const { data, isLoading, isFetching, error } = useProducts(params);

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [gallery, setGallery] = useState<Product | null>(null);

  const statusMutation = useSetProductStatus();
  const deleteMutation = useDeleteProduct();

  const handleToggleStatus = useCallback(
    (row: Product) =>
      statusMutation.mutate({ id: row.id, isActive: !row.isActive }),
    [statusMutation],
  );

  const columns = useProductColumns({
    editHref: (row) => `${ROUTES.products}/${row.id}/edit`,
    onDelete: setPendingDelete,
    onToggleStatus: handleToggleStatus,
    onViewGallery: setGallery,
    isTogglingId: statusMutation.isPending
      ? statusMutation.variables?.id
      : null,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        description="Katalog produk yang bisa ditugaskan ke setiap toko."
        actions={
          <Button render={<Link href={`${ROUTES.products}/new`} />}>
            <Plus className="size-4" aria-hidden />
            Tambah Produk
          </Button>
        }
      />

      <SearchInput
        value={params.search}
        onChange={setSearch}
        placeholder="Cari nama produk…"
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
            rowHref={(product) => `${ROUTES.products}/${product.id}/edit`}
            emptyMessage={
              params.search
                ? `Tidak ada produk yang cocok dengan “${params.search}”.`
                : "Belum ada produk."
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

      <ProductGalleryDialog
        product={gallery}
        onOpenChange={(open) => !open && setGallery(null)}
      />

      <ConfirmDialog
        title="Hapus produk?"
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        description={`“${pendingDelete?.name}” akan dihapus. Toko yang menjual produk ini bisa ikut terpengaruh.`}
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
