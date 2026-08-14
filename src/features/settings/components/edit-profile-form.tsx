"use client";

import { Info } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types/auth";

const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super Admin",
  admin: "Admin Toko",
  cashier: "Kasir",
  customer: "Pelanggan",
};

/**
 * The account, as the API reports it.
 *
 * Every field is read-only, because there is no endpoint behind them: the Vue
 * EditProfileForm's submit handler logged the payload and opened a modal
 * saying "fitur update profil belum diimplementasikan". Rendering editable
 * inputs that silently discard what is typed would be worse than saying so, so
 * the notice is on screen and the inputs are disabled until the backend gains
 * a profile-update route.
 */
export function EditProfileForm() {
  const profile = useAuthStore((state) => state.profile);

  if (!profile) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <span className="sr-only">Memuat data profil…</span>
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="size-4" aria-hidden />
        <AlertDescription>
          Perubahan data profil belum tersedia. Hubungi Super Admin bila ada
          data yang perlu diperbarui.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          <AvatarImage src={profile.photo} alt="" />
          <AvatarFallback className="text-lg">
            {initials(profile.name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="font-medium">{profile.name}</p>
          <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReadOnlyField id="profile-name" label="Nama" value={profile.name} />
        <ReadOnlyField
          id="profile-username"
          label="Nama pengguna"
          value={profile.username}
        />
        <ReadOnlyField
          id="profile-email"
          label="Email"
          value={profile.email}
          hint={
            profile.email
              ? profile.email_verified
                ? "Terverifikasi"
                : "Belum terverifikasi"
              : undefined
          }
        />
        <ReadOnlyField
          id="profile-phone"
          label="Nomor telepon"
          value={profile.phone}
          hint={
            profile.phone
              ? profile.phone_verified
                ? "Terverifikasi"
                : "Belum terverifikasi"
              : undefined
          }
        />
        <ReadOnlyField
          id="profile-created-at"
          label="Bergabung sejak"
          value={formatDate(profile.created_at)}
        />
      </div>
    </div>
  );
}

interface ReadOnlyFieldProps {
  id: string;
  label: string;
  value?: string;
  hint?: string;
}

function ReadOnlyField({ id, label, value, hint }: ReadOnlyFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value ?? ""}
        placeholder="Belum diisi"
        readOnly
        disabled
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
