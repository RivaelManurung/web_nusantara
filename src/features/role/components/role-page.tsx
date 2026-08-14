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

import { useDeleteRole, useRoles } from "../queries";
import type { Role } from "../types";
import { PermissionMatrixDialog } from "./permission-matrix-dialog";
import { RoleFormDialog } from "./role-form-dialog";
import { useRoleColumns } from "./role-table";

/**
 * Manajemen Role dan Akses.
 *
 * Two dialogs sit over one list: the name form, and the permission matrix. The
 * matrix is not a page of its own because it is only ever reached from a row,
 * and a route would need its own guard for a screen the list already gates.
 */
export function RolePage() {
  const { params, setPage, setSearch } = useListParams();
  const { data, isLoading, isFetching, error } = useRoles(params);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [managing, setManaging] = useState<Role | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);
  // The backend refuses to delete a role users still hold, and its 409 explains
  // what to do first. That sentence is shown in the dialog rather than only in
  // a toast, so it stays on screen next to the action that caused it.
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteMutation = useDeleteRole();

  const handleEdit = useCallback((row: Role) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((row: Role) => {
    setDeleteError(null);
    setPendingDelete(row);
  }, []);

  const columns = useRoleColumns({
    onEdit: handleEdit,
    onManagePermissions: setManaging,
    onDelete: handleDelete,
  });

  async function confirmDelete() {
    if (!pendingDelete) return;

    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
    } catch (cause) {
      // Keep the dialog open: the failure is actionable, and closing it would
      // leave the user with a toast and no idea which role it referred to.
      setDeleteError(
        cause instanceof ApiError ? cause.message : "Gagal menghapus role.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Daftar role akun dan izin yang boleh dijalankan masing-masing."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden />
            Tambah Role
          </Button>
        }
      />

      <SearchInput
        value={params.search}
        onChange={setSearch}
        placeholder="Cari role…"
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
                ? `Tidak ada role yang cocok dengan “${params.search}”.`
                : "Belum ada role."
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

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />

      <PermissionMatrixDialog
        role={managing}
        onOpenChange={(open) => !open && setManaging(null)}
      />

      <ConfirmDialog
        title="Hapus role?"
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
        description={
          deleteError ??
          `“${pendingDelete?.name}” akan dihapus beserta seluruh hak aksesnya.`
        }
        confirmLabel="Hapus"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
