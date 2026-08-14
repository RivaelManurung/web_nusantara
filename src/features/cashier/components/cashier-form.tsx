"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useInvalidSubmit } from "@/hooks/use-invalid-submit";
import { z } from "zod";

import { FormActions } from "@/components/shared/form-actions";
import { ImageField } from "@/components/shared/image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/config/routes";

import { useCreateCashier, useUpdateCashier } from "../queries";
import type { Cashier } from "../types";

const baseSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(255, "Nama maksimal 255 karakter."),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter.")
    .max(50, "Username maksimal 50 karakter.")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username hanya boleh berisi huruf, angka, titik, garis bawah, dan strip.",
    ),
  email: z.string(),
  password: z.string(),
  image: z.instanceof(File).nullable(),
});

type FormValues = z.infer<typeof baseSchema>;

/**
 * Email and password are create-only, so their rules are attached
 * conditionally: requiring them while editing would block a save that only
 * changes the name.
 */
function schemaFor(isEditing: boolean) {
  if (isEditing) return baseSchema;

  return baseSchema.superRefine((values, ctx) => {
    if (!z.string().email().safeParse(values.email).success) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Format email tidak valid.",
      });
    }
    if (values.password.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password minimal 8 karakter.",
      });
    }
  });
}

interface Props {
  /** Absent when creating. */
  editing?: Cashier | null;
}

export function CashierForm({ editing }: Props) {
  const router = useRouter();
  const isEditing = Boolean(editing);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const createMutation = useCreateCashier();
  const updateMutation = useUpdateCashier();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const resolver = useMemo(
    () => zodResolver(schemaFor(isEditing)),
    [isEditing],
  );

  const onInvalid = useInvalidSubmit();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver,
    // Seeded once at mount; the page remounts per record, so there is no stale
    // state to reset.
    defaultValues: {
      name: editing?.name ?? "",
      username: editing?.username ?? "",
      email: editing?.email ?? "",
      password: "",
      image: null,
    },
  });

  async function onSubmit(values: FormValues) {
    // A new cashier has no existing photo to fall back on.
    if (!isEditing && !values.image) {
      setError("image", { message: "Foto wajib dipilih." });
      return;
    }

    if (editing) {
      // The edit endpoint ignores email and password, so they are not sent.
      await updateMutation.mutateAsync({
        id: editing.id,
        input: {
          name: values.name,
          username: values.username,
          image: values.image,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
        image: values.image,
      });
    }

    router.push(ROUTES.cashierManagement);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cashier-name">Nama lengkap</Label>
          <Input
            id="cashier-name"
            placeholder="Budi Santoso"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "cashier-name-error" : undefined}
            {...register("name")}
          />
          {errors.name ? (
            <p id="cashier-name-error" className="text-destructive text-sm">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cashier-username">Username</Label>
          <Input
            id="cashier-username"
            placeholder="budi.santoso"
            autoComplete="off"
            aria-invalid={Boolean(errors.username)}
            aria-describedby={
              errors.username ? "cashier-username-error" : undefined
            }
            {...register("username")}
          />
          {errors.username ? (
            <p id="cashier-username-error" className="text-destructive text-sm">
              {errors.username.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cashier-email">Email</Label>
        <Input
          id="cashier-email"
          type="email"
          placeholder="budi@contoh.id"
          // The backend does not accept an email change on edit, so showing
          // it as editable would promise something that never happens.
          disabled={isEditing}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={
            errors.email ? "cashier-email-error" : "cashier-email-hint"
          }
          {...register("email")}
        />
        {errors.email ? (
          <p id="cashier-email-error" className="text-destructive text-sm">
            {errors.email.message}
          </p>
        ) : isEditing ? (
          <p id="cashier-email-hint" className="text-muted-foreground text-xs">
            Email tidak dapat diubah setelah kasir dibuat.
          </p>
        ) : null}
      </div>

      {isEditing ? null : (
        <div className="space-y-2">
          <Label htmlFor="cashier-password">Password</Label>
          <div className="relative">
            <Input
              id="cashier-password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              className="pr-10"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "cashier-password-error" : undefined
              }
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={
                isPasswordVisible
                  ? "Sembunyikan password"
                  : "Tampilkan password"
              }
            >
              {isPasswordVisible ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </Button>
          </div>
          {errors.password ? (
            <p id="cashier-password-error" className="text-destructive text-sm">
              {errors.password.message}
            </p>
          ) : null}
        </div>
      )}

      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <ImageField
            id="cashier-photo"
            label="Foto"
            currentUrl={editing?.photo ?? undefined}
            value={field.value}
            onChange={field.onChange}
            error={errors.image?.message}
          />
        )}
      />

      <FormActions
        cancelHref={ROUTES.cashierManagement}
        isPending={isPending}
      />
    </form>
  );
}
