"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/errors";

import {
  usePermissionCatalog,
  useReplaceRolePermissions,
  useRolePermissions,
} from "../queries";
import { groupPermissions, isSuperAdminRole, type Role } from "../types";

interface Props {
  /** The role being edited; null closes the dialog. */
  role: Role | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * The permission matrix: one checkbox per permission, grouped by area.
 *
 * The whole set is submitted on save rather than a diff of individual grants.
 * Two operators editing at once then land on one of the two sets they each
 * chose, instead of interleaving into a third nobody asked for.
 */
export function PermissionMatrixDialog({ role, onOpenChange }: Props) {
  const open = Boolean(role);

  const catalog = usePermissionCatalog(open);
  const current = useRolePermissions(open ? (role?.id ?? null) : null);
  const replaceMutation = useReplaceRolePermissions();

  const [selected, setSelected] = useState<string[]>([]);

  // Seed the checkboxes from the role's stored grants, and clear them again on
  // close: the dialog stays mounted between openings, so without this it would
  // show the previous role's selection while the new one loads.
  //
  // Adjusted during render rather than in an effect. React re-runs this
  // component before touching the DOM, so the stale selection is never painted
  // -- an effect would render it once first, then correct it.
  const snapshot = open ? (current.data ?? null) : null;
  const [seededFrom, setSeededFrom] = useState<typeof snapshot>(null);

  if (snapshot !== seededFrom) {
    setSeededFrom(snapshot);
    setSelected(snapshot?.codes ?? []);
  }

  const groups = useMemo(
    () => groupPermissions(catalog.data ?? []),
    [catalog.data],
  );

  // Superadmin is read-only here: the endpoints that edit permissions
  // themselves require it, so the backend refuses to leave it short of the full
  // catalogue. Showing the matrix disabled is honest; letting the user submit a
  // change that comes back as a 409 is not.
  const isLocked = role ? isSuperAdminRole(role) : false;

  const isLoading = catalog.isLoading || current.isLoading;
  const error = catalog.error ?? current.error;

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggle(code: string, checked: boolean) {
    setSelected((codes) =>
      checked ? [...codes, code] : codes.filter((item) => item !== code),
    );
  }

  function toggleGroup(codes: string[], checked: boolean) {
    setSelected((current) => {
      const without = current.filter((code) => !codes.includes(code));
      return checked ? [...without, ...codes] : without;
    });
  }

  async function save() {
    if (!role || isLocked) return;
    await replaceMutation.mutateAsync({ roleId: role.id, codes: selected });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hak akses {role?.name}</DialogTitle>
          <DialogDescription>
            Centang izin yang boleh dijalankan role ini. Perubahan berlaku untuk
            semua akun dengan role tersebut.
          </DialogDescription>
        </DialogHeader>

        {isLocked ? (
          <Alert>
            <AlertDescription>
              Role superadmin selalu memegang seluruh izin dan tidak dapat
              diubah, agar tidak ada keadaan di mana halaman ini tidak bisa
              dibuka siapa pun.
            </AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>
              {error instanceof ApiError
                ? error.message
                : "Gagal memuat daftar izin."}
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="max-h-[55vh] space-y-6 overflow-y-auto pr-1">
            {groups.map((group) => {
              const codes = group.permissions.map((item) => item.code);
              const checkedCount = codes.filter((code) =>
                selectedSet.has(code),
              ).length;
              const allChecked = checkedCount === codes.length;
              const groupId = `permission-group-${slug(group.label)}`;

              return (
                <fieldset key={group.label} className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <legend className="text-sm font-semibold">
                      {group.label}
                    </legend>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={groupId}
                        checked={allChecked}
                        indeterminate={checkedCount > 0 && !allChecked}
                        disabled={isLocked}
                        onCheckedChange={(checked) =>
                          toggleGroup(codes, checked === true)
                        }
                      />
                      <Label
                        htmlFor={groupId}
                        className="text-muted-foreground text-xs font-normal"
                      >
                        Pilih semua
                      </Label>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.permissions.map((permission) => {
                      const id = `permission-${slug(permission.code)}`;
                      return (
                        <div key={permission.code} className="flex gap-2">
                          <Checkbox
                            id={id}
                            checked={selectedSet.has(permission.code)}
                            disabled={isLocked}
                            onCheckedChange={(checked) =>
                              toggle(permission.code, checked === true)
                            }
                          />
                          <Label
                            htmlFor={id}
                            className="flex-col items-start gap-0.5 font-normal"
                          >
                            <span>{permission.label}</span>
                            <span className="text-muted-foreground font-mono text-xs">
                              {permission.code}
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}

            <p className="text-muted-foreground text-sm" aria-live="polite">
              {selected.length} izin dipilih.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={replaceMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {isLocked ? "Tutup" : "Batal"}
          </Button>
          {isLocked ? null : (
            <Button
              type="button"
              onClick={save}
              disabled={replaceMutation.isPending || isLoading || Boolean(error)}
            >
              {replaceMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Menyimpan…
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Turns a code or heading into something safe to use as a DOM id. */
function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
