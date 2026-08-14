"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvalidSubmit } from "@/hooks/use-invalid-submit";

import { useCreateRole, useUpdateRole } from "../queries";
import type { Role } from "../types";

const schema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Nama maksimal 100 karakter."),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent when creating. */
  editing?: Role | null;
}

/**
 * Create and rename share one dialog.
 *
 * A role is a single field, so a dedicated page would be a navigation for one
 * input — unlike the catalogue features, which carry an image and warrant one.
 */
export function RoleFormDialog({ open, onOpenChange, editing }: Props) {
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onInvalid = useInvalidSubmit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // The dialog stays mounted between openings, so the fields have to be seeded
  // each time it opens; without this, editing a second role would show the
  // first one's name.
  useEffect(() => {
    if (open) reset({ name: editing?.name ?? "" });
  }, [open, editing, reset]);

  async function onSubmit(values: FormValues) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Ubah role" : "Tambah role"}</DialogTitle>
          <DialogDescription>
            Nama role dipakai untuk menentukan hak akses setiap akun.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="role-name">Nama</Label>
            <Input
              id="role-name"
              placeholder="admin"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "role-name-error" : undefined}
              {...register("name")}
            />
            {errors.name ? (
              <p id="role-name-error" className="text-destructive text-sm">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Menyimpan…
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
