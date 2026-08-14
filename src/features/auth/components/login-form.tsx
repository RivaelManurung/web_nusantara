"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { useInvalidSubmit } from "@/hooks/use-invalid-submit";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { landingRouteFor } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";
import { useState } from "react";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  // Rate limiting is the one failure worth pinning above the form: it tells the
  // user to wait, which a toast that disappears after four seconds does not.
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);

  const onInvalid = useInvalidSubmit();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setLockoutMessage(null);

    try {
      const profile = await login(values);
      toast.success(`Selamat datang kembali, ${profile.name}!`);

      // Honour where the middleware was sending them, but never bounce back to
      // an external URL a query string could smuggle in.
      const next = searchParams.get("next");
      const destination =
        next && next.startsWith("/") ? next : landingRouteFor(profile.role);

      router.replace(destination);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;

      if (apiError?.code === "RATE_LIMITED") {
        const seconds = apiError.retryAfterSeconds;
        setLockoutMessage(
          seconds
            ? `${apiError.message} Coba lagi dalam ${seconds} detik.`
            : apiError.message,
        );
        return;
      }

      toast.error(apiError?.message ?? "Gagal masuk. Coba lagi.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-4"
      noValidate
    >
      {lockoutMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{lockoutMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@nusantara.test"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email ? (
          <p id="email-error" className="text-destructive text-sm">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Kata Sandi</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        {errors.password ? (
          <p id="password-error" className="text-destructive text-sm">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Memproses…
          </>
        ) : (
          "Masuk"
        )}
      </Button>
    </form>
  );
}
