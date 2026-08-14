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

import { useBanners, useDeleteBanner, useSetBannerStatus } from "../queries";
import type { Banner } from "../types";
import { useBannerColumns } from "./banner-table";

export function BannerPage() {
  const { params, setPage, setSearch } = useListParams();
  const { data, isLoading, isFetching, error } = useBanners(params);

  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null);

  const statusMutation = useSetBannerStatus();
  const deleteMutation = useDeleteBanner();

  const handleToggleStatus = useCallback(
    (row: Banner) =>
      statusMutation.mutate({ id: row.id, isActive: !row.isActive }),
    [statusMutation],
  );

  const columns = useBannerColumns({
    editHref: (row) => `${ROUTES.banners}/${row.id}/edit`,
    onDelete: setPendingDelete,
    onToggleStatus: handleToggleStatus,
    isTogglingId: statusMutation.isPending
      ? statusMutation.variables?.id
      : null,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        description="Gambar promosi yang tampil di beranda aplikasi."
        actions={
          <Button render={<Link href={`${ROUTES.banners}/new`} />}>
            <Plus className="size-4" aria-hidden />
            Tambah banner
          </Button>
        }
      />

      <SearchInput
        value={params.search}
        onChange={setSearch}
        placeholder="Cari nama banner…"
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
            // The whole row is a shortcut to the same edit page the actions
            // menu points at, so scanning the list does not require aiming at
            // the small trailing button.
            rowHref={(row) => `${ROUTES.banners}/${row.id}/edit`}
            emptyMessage={
              params.search
                ? `Tidak ada banner yang cocok dengan “${params.search}”.`
                : "Belum ada banner."
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
        title="Hapus banner?"
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        description={`“${pendingDelete?.name}” akan dihapus dan tidak lagi tampil di aplikasi.`}
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
