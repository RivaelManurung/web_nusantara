"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { useInvalidSubmit } from "@/hooks/use-invalid-submit";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useChangePassword } from "../queries";

/**
 * The confirmation check runs here rather than on the server round trip, which
 * is what the Vue ChangePasswordUseCase did too -- there is no reason to spend
 * a request to be told the two new fields disagree.
 */
const schema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi sekarang wajib diisi."),
    newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter."),
    confirmationPassword: z.string().min(1, "Konfirmasi wajib diisi."),
  })
  .refine((values) => values.newPassword === values.confirmationPassword, {
    path: ["confirmationPassword"],
    message: "Konfirmasi kata sandi baru tidak cocok.",
  });

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  currentPassword: "",
  newPassword: "",
  confirmationPassword: "",
};

export function ChangePasswordForm() {
  const mutation = useChangePassword();

  const onInvalid = useInvalidSubmit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  async function onSubmit(values: FormValues) {
    await mutation.mutateAsync({
      current_password: values.currentPassword,
      new_password: values.newPassword,
      confirmation_password: values.confirmationPassword,
    });
    // Only clear on success: after a rejected attempt the user should not have
    // to retype the password they got right.
    reset(EMPTY);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="max-w-md space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="current-password">Kata sandi sekarang</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
          aria-describedby={
            errors.currentPassword ? "current-password-error" : undefined
          }
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p id="current-password-error" className="text-destructive text-sm">
            {errors.currentPassword.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">Kata sandi baru</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword)}
          aria-describedby={
            errors.newPassword ? "new-password-error" : undefined
          }
          {...register("newPassword")}
        />
        {errors.newPassword ? (
          <p id="new-password-error" className="text-destructive text-sm">
            {errors.newPassword.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmation-password">
          Konfirmasi kata sandi baru
        </Label>
        <Input
          id="confirmation-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmationPassword)}
          aria-describedby={
            errors.confirmationPassword
              ? "confirmation-password-error"
              : undefined
          }
          {...register("confirmationPassword")}
        />
        {errors.confirmationPassword ? (
          <p
            id="confirmation-password-error"
            className="text-destructive text-sm"
          >
            {errors.confirmationPassword.message}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Memproses…
            </>
          ) : (
            "Simpan"
          )}
        </Button>
      </div>
    </form>
  );
}
