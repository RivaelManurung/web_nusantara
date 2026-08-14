"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { useInvalidSubmit } from "@/hooks/use-invalid-submit";
import { z } from "zod";

import { FormActions } from "@/components/shared/form-actions";
import { ImageField } from "@/components/shared/image-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/config/routes";

import { useCreateTypeProduct, useUpdateTypeProduct } from "../queries";
import type { TypeProduct } from "../types";

const schema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(255, "Nama maksimal 255 karakter."),
  image: z.instanceof(File).nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  /** Absent when creating. */
  editing?: TypeProduct | null;
}

export function TypeProductForm({ editing }: Props) {
  const router = useRouter();
  const isEditing = Boolean(editing);

  const createMutation = useCreateTypeProduct();
  const updateMutation = useUpdateTypeProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onInvalid = useInvalidSubmit();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // Seeded once at mount; the page remounts per record, so there is no stale
    // state to reset.
    defaultValues: { name: editing?.name ?? "", image: null },
  });

  async function onSubmit(values: FormValues) {
    // A new category has nothing to fall back on if no picture is chosen.
    if (!isEditing && !values.image) {
      setError("image", { message: "Gambar wajib dipilih." });
      return;
    }

    const input = { name: values.name, image: values.image };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, input });
    } else {
      await createMutation.mutateAsync(input);
    }

    router.push(ROUTES.productTypes);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="type-product-name">Nama</Label>
        <Input
          id="type-product-name"
          placeholder="Keripik & Kerupuk"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "type-product-name-error" : undefined}
          {...register("name")}
        />
        {errors.name ? (
          <p id="type-product-name-error" className="text-destructive text-sm">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <ImageField
            id="type-product-image"
            label="Gambar"
            currentUrl={editing?.image}
            value={field.value}
            onChange={field.onChange}
            error={errors.image?.message}
          />
        )}
      />

      <FormActions cancelHref={ROUTES.productTypes} isPending={isPending} />
    </form>
  );
}
