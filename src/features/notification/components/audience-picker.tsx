"use client";

import { X } from "lucide-react";

import { DateField } from "@/components/shared/date-field";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useListParams } from "@/hooks/use-list-params";
import { ApiError } from "@/lib/api/errors";

import { useCustomerCandidates } from "../queries";
import type { AudienceMode, Customer, SegmentInput } from "../types";

const MODES: { value: AudienceMode; label: string; hint: string }[] = [
  {
    value: "ALL",
    label: "Semua pelanggan",
    hint: "Setiap akun aktif menerima notifikasi ini.",
  },
  {
    value: "USERS",
    label: "Pilih pelanggan",
    hint: "Cari dan centang penerima satu per satu.",
  },
  {
    value: "SEGMENT",
    label: "Segmen",
    hint: "Saring berdasarkan role, riwayat transaksi, atau tanggal daftar.",
  },
];

interface AudiencePickerProps {
  mode: AudienceMode;
  onModeChange: (mode: AudienceMode) => void;
  /** Kept as whole records, not ids, so a chosen name survives a new search. */
  selected: Customer[];
  onSelectedChange: (selected: Customer[]) => void;
  segment: SegmentInput;
  onSegmentChange: (segment: SegmentInput) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Chooses who receives the notification.
 *
 * The three modes are mutually exclusive, and each keeps its own state while
 * hidden: switching to "Segmen" to check something and back does not throw
 * away a list of hand-picked recipients.
 */
export function AudiencePicker({
  mode,
  onModeChange,
  selected,
  onSelectedChange,
  segment,
  onSegmentChange,
  error,
  disabled,
}: AudiencePickerProps) {
  const { params, setPage, setSearch } = useListParams();
  const candidates = useCustomerCandidates(params, mode === "USERS");

  const selectedIds = new Set(selected.map((customer) => customer.id));

  function toggle(customer: Customer, checked: boolean) {
    onSelectedChange(
      checked
        ? [...selected, customer]
        : selected.filter((item) => item.id !== customer.id),
    );
  }

  return (
    <fieldset className="space-y-4" disabled={disabled}>
      <legend className="text-sm font-medium">Penerima</legend>

      <RadioGroup
        value={mode}
        onValueChange={(value) => onModeChange(value as AudienceMode)}
        aria-describedby={error ? "audience-error" : undefined}
      >
        {MODES.map((option) => (
          <label
            key={option.value}
            htmlFor={`audience-${option.value}`}
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5"
          >
            <RadioGroupItem
              id={`audience-${option.value}`}
              value={option.value}
              className="mt-0.5"
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-medium">{option.label}</span>
              <span className="block text-muted-foreground text-sm">
                {option.hint}
              </span>
            </span>
          </label>
        ))}
      </RadioGroup>

      {error ? (
        <p id="audience-error" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      {mode === "USERS" ? (
        <div className="space-y-3 rounded-lg border p-3">
          <SearchInput
            value={params.search}
            onChange={setSearch}
            placeholder="Cari nama, email, atau nomor telepon…"
          />

          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selected.map((customer) => (
                <Badge key={customer.id} variant="secondary" className="gap-1">
                  {customer.name}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-4"
                    aria-label={`Hapus ${customer.name} dari daftar penerima`}
                    onClick={() => toggle(customer, false)}
                  >
                    <X className="size-3" aria-hidden />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : null}

          {candidates.error ? (
            <Alert variant="destructive">
              <AlertDescription>
                {candidates.error instanceof ApiError
                  ? candidates.error.message
                  : "Gagal memuat daftar pelanggan."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <ul className="divide-y rounded-md border">
                {candidates.isLoading
                  ? Array.from({ length: 4 }, (_, index) => (
                      <li key={index} className="p-3">
                        <Skeleton className="h-9 w-full" />
                      </li>
                    ))
                  : (candidates.data?.items ?? []).map((customer) => (
                      <li key={customer.id}>
                        <label
                          htmlFor={`customer-${customer.id}`}
                          className="flex cursor-pointer items-center gap-3 p-3"
                        >
                          <Checkbox
                            id={`customer-${customer.id}`}
                            checked={selectedIds.has(customer.id)}
                            onCheckedChange={(checked) =>
                              toggle(customer, checked === true)
                            }
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {customer.name}
                            </span>
                            <span className="block truncate text-muted-foreground text-sm">
                              {customer.contact}
                            </span>
                          </span>
                        </label>
                      </li>
                    ))}

                {!candidates.isLoading &&
                (candidates.data?.items.length ?? 0) === 0 ? (
                  <li className="text-muted-foreground p-3 text-sm">
                    {params.search
                      ? `Tidak ada pelanggan yang cocok dengan “${params.search}”.`
                      : "Belum ada pelanggan terdaftar."}
                  </li>
                ) : null}
              </ul>

              {candidates.data ? (
                <Pagination
                  pagination={candidates.data.pagination}
                  onPageChange={setPage}
                  isLoading={candidates.isFetching}
                />
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {mode === "SEGMENT" ? (
        <div className="grid gap-4 rounded-lg border p-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="segment-role">Role</Label>
            <Input
              id="segment-role"
              placeholder="customer"
              value={segment.roleName}
              onChange={(event) =>
                onSegmentChange({ ...segment, roleName: event.target.value })
              }
            />
            <p className="text-muted-foreground text-sm">
              Kosongkan untuk semua role.
            </p>
          </div>

          <div className="flex items-start gap-3 sm:pt-8">
            <Checkbox
              id="segment-has-ordered"
              checked={segment.hasOrdered}
              onCheckedChange={(checked) =>
                onSegmentChange({ ...segment, hasOrdered: checked === true })
              }
            />
            <Label htmlFor="segment-has-ordered" className="text-sm font-normal">
              Hanya yang pernah bertransaksi
            </Label>
          </div>

          <DateField
            id="segment-registered-from"
            label="Daftar sejak"
            value={segment.registeredFrom}
            onChange={(value) =>
              onSegmentChange({ ...segment, registeredFrom: value })
            }
          />

          <DateField
            id="segment-registered-to"
            label="Daftar sampai"
            value={segment.registeredTo}
            onChange={(value) =>
              onSegmentChange({ ...segment, registeredTo: value })
            }
          />
        </div>
      ) : null}
    </fieldset>
  );
}
