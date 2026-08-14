"use client";

import { Trash2, UsersRound, Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";

import type { Cashier } from "@/features/cashier/types";
import type { ProductPick, ShopProductInput } from "../types";

interface Props {
  cashiers: Cashier[];
  products: ProductPick[];
  isLoadingOptions: boolean;

  selectedCashierIds: string[];
  onToggleCashier: (id: string, selected: boolean) => void;
  cashierError?: string;

  selectedProducts: ShopProductInput[];
  onToggleProduct: (option: ProductPick, selected: boolean) => void;
  onChangeProduct: (productId: string, patch: Partial<ShopProductInput>) => void;
  productError?: string;
}

/**
 * Staff and stock.
 *
 * Both pickers are checkbox lists rather than the old combobox: the option sets
 * here are the first page of each catalogue, small enough that showing them
 * outright is clearer than a search-and-select that hides what is already
 * chosen.
 */
export function ShopRelationsFields({
  cashiers,
  products,
  isLoadingOptions,
  selectedCashierIds,
  onToggleCashier,
  cashierError,
  selectedProducts,
  onToggleProduct,
  onChangeProduct,
  productError,
}: Props) {
  if (isLoadingOptions) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  const selectedProductIds = new Set(selectedProducts.map((p) => p.productId));

  return (
    <div className="space-y-6">
      <fieldset className="space-y-2">
        <legend className="flex items-center gap-2 text-sm font-medium">
          <UsersRound className="size-4" aria-hidden />
          Kasir
        </legend>

        <div
          className="max-h-40 space-y-2 overflow-y-auto rounded-lg border p-3"
          aria-describedby={cashierError ? "shop-cashiers-error" : undefined}
        >
          {cashiers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Belum ada kasir yang bisa ditugaskan.
            </p>
          ) : (
            cashiers.map((cashier) => (
              <div key={cashier.id} className="flex items-center gap-3">
                <Checkbox
                  id={`shop-cashier-${cashier.id}`}
                  checked={selectedCashierIds.includes(cashier.id)}
                  onCheckedChange={(checked) =>
                    onToggleCashier(cashier.id, checked === true)
                  }
                />
                <Label
                  htmlFor={`shop-cashier-${cashier.id}`}
                  className="cursor-pointer font-normal"
                >
                  {cashier.name}
                  <span className="text-muted-foreground ml-2 text-xs">
                    {cashier.email}
                  </span>
                </Label>
              </div>
            ))
          )}
        </div>
        {cashierError ? (
          <p id="shop-cashiers-error" className="text-destructive text-sm">
            {cashierError}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="flex items-center gap-2 text-sm font-medium">
          <Warehouse className="size-4" aria-hidden />
          Produk
        </legend>

        <div
          className="max-h-40 space-y-2 overflow-y-auto rounded-lg border p-3"
          aria-describedby={productError ? "shop-products-error" : undefined}
        >
          {products.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Belum ada produk di katalog.
            </p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <Checkbox
                  id={`shop-product-${product.id}`}
                  checked={selectedProductIds.has(product.id)}
                  onCheckedChange={(checked) =>
                    onToggleProduct(product, checked === true)
                  }
                />
                <Label
                  htmlFor={`shop-product-${product.id}`}
                  className="cursor-pointer font-normal"
                >
                  {product.name}
                  {product.code ? (
                    <span className="text-muted-foreground ml-2 text-xs">
                      {product.code}
                    </span>
                  ) : null}
                </Label>
              </div>
            ))
          )}
        </div>
        {productError ? (
          <p id="shop-products-error" className="text-destructive text-sm">
            {productError}
          </p>
        ) : null}

        {selectedProducts.length > 0 ? (
          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">
              Isi stok awal setiap produk. Harga boleh dikosongkan untuk memakai
              harga katalog.
            </p>

            {selectedProducts.map((product) => (
              <div
                key={product.productId}
                className="grid items-end gap-3 sm:grid-cols-[1fr_6rem_9rem_auto]"
              >
                <p className="truncate text-sm font-medium">{product.name}</p>

                <div className="space-y-1">
                  <Label
                    htmlFor={`shop-stock-${product.productId}`}
                    className="text-xs"
                  >
                    Stok
                  </Label>
                  <Input
                    id={`shop-stock-${product.productId}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={product.stock}
                    onChange={(event) =>
                      onChangeProduct(product.productId, {
                        stock: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor={`shop-price-${product.productId}`}
                    className="text-xs"
                  >
                    Harga (opsional)
                  </Label>
                  <Input
                    id={`shop-price-${product.productId}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder={formatCurrency(0)}
                    value={product.price ?? ""}
                    onChange={(event) =>
                      onChangeProduct(product.productId, {
                        price:
                          event.target.value === ""
                            ? null
                            : Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onToggleProduct(
                      { id: product.productId, name: product.name },
                      false,
                    )
                  }
                  aria-label={`Hapus ${product.name} dari toko`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </fieldset>
    </div>
  );
}
