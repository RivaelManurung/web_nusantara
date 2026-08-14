"use client";

import { Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { SearchInput } from "@/components/shared/search-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProducts } from "@/features/product/queries";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency } from "@/lib/format";

import type { EventProduct } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Ids already in the list, shown as picked and not selectable again. */
  selectedIds: string[];
  onSelect: (product: EventProduct) => void;
}

/**
 * Searchable product picker.
 *
 * The Vue original was an inline dropdown with infinite scroll; a dialog is used
 * instead because the event form is itself a dialog, and a popup anchored inside
 * a scrolling dialog body drifts away from its input.
 *
 * The caller mounts this only while it is open, so the product query does not
 * run for every event form that is never used to pick anything.
 */
export function ProductSelectorDialog({
  open,
  onOpenChange,
  title,
  selectedIds,
  onSelect,
}: Props) {
  // Reset per visit rather than per render: the caller unmounts this when it
  // closes, so each opening starts from an unfiltered list.
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, error } = useProducts({
    page: 1,
    search,
  });

  const products = (data?.items ?? []).map<EventProduct>((product) => ({
    id: product.id,
    name: product.name,
    code: product.code,
    price: product.price,
    unit: product.unit,
    image: product.coverImage ?? "",
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Pilih produk untuk ditambahkan ke daftar. Produk yang sudah dipilih
            ditandai.
          </DialogDescription>
        </DialogHeader>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari nama atau kode produk…"
        />

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>
              {error instanceof ApiError
                ? error.message
                : "Gagal memuat produk."}
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-72 rounded-lg border">
            {isLoading ? (
              <div className="text-muted-foreground flex h-72 items-center justify-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Memuat produk…
              </div>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground flex h-72 items-center justify-center px-4 text-center text-sm">
                {search
                  ? `Tidak ada produk yang cocok dengan “${search}”.`
                  : "Belum ada produk."}
              </p>
            ) : (
              <ul className="divide-y" aria-busy={isFetching}>
                {products.map((product) => {
                  const isPicked = selectedIds.includes(product.id);

                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        disabled={isPicked}
                        onClick={() => {
                          onSelect(product);
                          onOpenChange(false);
                        }}
                        className="hover:bg-accent flex w-full items-center gap-3 p-3 text-left transition-colors disabled:pointer-events-none disabled:opacity-60"
                      >
                        <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-md border">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-contain p-1"
                              unoptimized
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {product.code} · {formatCurrency(product.price)}
                          </p>
                        </div>

                        {isPicked ? (
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Check className="size-4" aria-hidden />
                            Dipilih
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
