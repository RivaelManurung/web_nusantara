import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <Image
          src="/images/logo.png"
          alt=""
          width={48}
          height={48}
          className="mx-auto size-12 rounded-lg object-contain"
        />
        <CardTitle className="text-xl">Masuk ke Nusantara</CardTitle>
        <CardDescription>Panel admin Nusantara Oleh-Oleh.</CardDescription>
      </CardHeader>

      <CardContent>
        {/* useSearchParams needs a Suspense boundary to keep the page static. */}
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
