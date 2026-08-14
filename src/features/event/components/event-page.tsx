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

import { useDeleteEvent, useEvents, useSetEventStatus } from "../queries";
import type { AppEvent } from "../types";
import { EventFormDialog } from "./event-form-dialog";
import { useEventColumns } from "./event-table";

export function EventPage() {
  const { params, setPage, setSearch } = useListParams();
  const { data, isLoading, isFetching, error } = useEvents(params);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AppEvent | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AppEvent | null>(null);

  const statusMutation = useSetEventStatus();
  const deleteMutation = useDeleteEvent();

  const handleEdit = useCallback((row: AppEvent) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    (row: AppEvent) =>
      statusMutation.mutate({ id: row.id, isActive: !row.isActive }),
    [statusMutation],
  );

  const columns = useEventColumns({
    onEdit: handleEdit,
    onDelete: setPendingDelete,
    onToggleStatus: handleToggleStatus,
    isTogglingId: statusMutation.isPending ? statusMutation.variables?.id : null,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event"
        description="Promo diskon per produk dan paket bundle berhadiah."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden />
            Tambah event
          </Button>
        }
      />

      <SearchInput
        value={params.search}
        onChange={setSearch}
        placeholder="Cari nama event…"
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
                ? `Tidak ada event yang cocok dengan “${params.search}”.`
                : "Belum ada event."
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

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Hapus event?"
        description={`“${pendingDelete?.name}” akan dihapus beserta daftar produknya.`}
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
