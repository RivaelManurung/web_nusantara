"use client";

import { Search, UsersRound, Warehouse, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  onChangeProduct: (
    productId: string,
    patch: Partial<ShopProductInput>,
  ) => void;
  productError?: string;
}

/**
 * Staff and stock.
 *
 * The previous version split product entry across two lists: a checkbox list to
 * pick products, and a separate list further down to type each one's stock and
 * price. Nothing connected them but the product name, so setting stock meant
 * ticking a box, scrolling past the fold, and finding the matching row by
 * reading. With a catalogue of 28 items that is a matching exercise, not a form.
 *
 * Here a product is one row, and its stock and price live in that row. Picking
 * and filling are the same gesture, and the columns are labelled once at the top
 * instead of on every row.
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
  const [query, setQuery] = useState("");

  const selectedById = useMemo(
    () => new Map(selectedProducts.map((row) => [row.productId, row])),
    [selectedProducts],
  );

  /**
   * The catalogue page plus anything already attached to this shop.
   *
   * The picker only loads the first page of the catalogue, so a shop can hold
   * products that page does not contain. Listing the catalogue alone would make
   * those rows invisible and therefore impossible to edit or remove -- the
   * attachment would survive every save without ever being shown.
   */
  const pickable = useMemo(() => {
    const inCatalogue = new Set(products.map((product) => product.id));

    const attachedElsewhere = selectedProducts
      .filter((row) => !inCatalogue.has(row.productId))
      .map<ProductPick>((row) => ({ id: row.productId, name: row.name }));

    return [...products, ...attachedElsewhere];
  }, [products, selectedProducts]);

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return pickable;
    return pickable.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.code?.toLowerCase().includes(term),
    );
  }, [pickable, query]);

  if (isLoadingOptions) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section
        icon={<UsersRound className="size-4" aria-hidden />}
        title="Kasir"
        summary={`${selectedCashierIds.length} dari ${cashiers.length} dipilih`}
        error={cashierError}
        errorId="shop-cashiers-error"
      >
        {cashiers.length === 0 ? (
          <EmptyState>Belum ada kasir yang bisa ditugaskan.</EmptyState>
        ) : (
          <ul className="max-h-56 overflow-y-auto p-1">
            {cashiers.map((cashier) => {
              const checked = selectedCashierIds.includes(cashier.id);
              return (
                <li key={cashier.id}>
                  <Label
                    htmlFor={`shop-cashier-${cashier.id}`}
                    className={cn(
                      // min-h keeps the row a comfortable tap target even
                      // though the visible control is a 16px box.
                      "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-normal",
                      "transition-colors duration-150 ease-out",
                      checked ? "bg-primary/8" : "hover:bg-accent/60",
                    )}
                  >
                    <Checkbox
                      id={`shop-cashier-${cashier.id}`}
                      checked={checked}
                      onCheckedChange={(next) =>
                        onToggleCashier(cashier.id, next === true)
                      }
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {cashier.name}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {cashier.email}
                      </span>
                    </span>
                  </Label>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section
        icon={<Warehouse className="size-4" aria-hidden />}
        title="Produk"
        summary={`${selectedProducts.length} dari ${pickable.length} dipilih`}
        error={productError}
        errorId="shop-products-error"
      >
        <div className="space-y-3 p-3">
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama atau kode produk…"
              aria-label="Cari produk"
              className="pl-9"
            />
          </div>

          <p className="text-muted-foreground text-xs text-pretty">
            Centang produk yang dijual di toko ini, lalu isi stok awalnya.
            Kosongkan harga untuk memakai harga katalog.
          </p>
        </div>

        {/* Column headings, stated once. Each input still carries its own
            accessible name, so a screen reader is not relying on these. */}
        <div
          className="text-muted-foreground hidden border-y px-3 py-1.5 text-xs font-medium sm:grid sm:grid-cols-[minmax(0,1fr)_5.5rem_8rem]"
          aria-hidden
        >
          <span>Produk</span>
          <span className="pl-3">Stok</span>
          <span className="pl-3">Harga toko</span>
        </div>

        {visibleProducts.length === 0 ? (
          <EmptyState>
            {pickable.length === 0
              ? "Belum ada produk di katalog."
              : `Tidak ada produk yang cocok dengan “${query}”.`}
          </EmptyState>
        ) : (
          <ul className="max-h-80 overflow-y-auto p-1">
            {visibleProducts.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                selection={selectedById.get(product.id)}
                onToggle={onToggleProduct}
                onChange={onChangeProduct}
              />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

interface ProductRowProps {
  product: ProductPick;
  /** Present only when the product is attached to this shop. */
  selection?: ShopProductInput;
  onToggle: (option: ProductPick, selected: boolean) => void;
  onChange: (productId: string, patch: Partial<ShopProductInput>) => void;
}

function ProductRow({
  product,
  selection,
  onToggle,
  onChange,
}: ProductRowProps) {
  const checked = Boolean(selection);

  return (
    <li
      className={cn(
        "rounded-lg px-2 transition-colors duration-150 ease-out",
        checked ? "bg-primary/8" : "hover:bg-accent/60",
      )}
    >
      <div className="grid items-center gap-y-2 py-1.5 sm:grid-cols-[minmax(0,1fr)_5.5rem_8rem] sm:gap-x-3">
        <Label
          htmlFor={`shop-product-${product.id}`}
          className="flex min-h-11 cursor-pointer items-center gap-3 font-normal"
        >
          <Checkbox
            id={`shop-product-${product.id}`}
            checked={checked}
            onCheckedChange={(next) => onToggle(product, next === true)}
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {product.name}
            </span>
            {product.code ? (
              <span className="text-muted-foreground block truncate font-mono text-xs">
                {product.code}
              </span>
            ) : null}
          </span>
        </Label>

        {checked && selection ? (
          <>
            {/* The heading above names these columns visually; the sr-only
                label names them per product for assistive tech. */}
            <div className="pl-8 sm:pl-0">
              <Label
                htmlFor={`shop-stock-${product.id}`}
                className="text-muted-foreground text-xs sm:sr-only"
              >
                Stok {product.name}
              </Label>
              <Input
                id={`shop-stock-${product.id}`}
                type="number"
                min={0}
                inputMode="numeric"
                value={selection.stock}
                onChange={(event) =>
                  onChange(product.id, {
                    stock: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                className="tabular-nums"
              />
            </div>

            <div className="flex items-end gap-1 pl-8 sm:pl-0">
              <div className="min-w-0 flex-1">
                <Label
                  htmlFor={`shop-price-${product.id}`}
                  className="text-muted-foreground text-xs sm:sr-only"
                >
                  Harga toko untuk {product.name}
                </Label>
                <Input
                  id={`shop-price-${product.id}`}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  // The catalogue price as the placeholder makes "leave empty
                  // to use the catalogue price" a number rather than a promise.
                  placeholder={
                    product.price != null ? String(product.price) : "katalog"
                  }
                  value={selection.price ?? ""}
                  onChange={(event) =>
                    onChange(product.id, {
                      price:
                        event.target.value === ""
                          ? null
                          : Math.max(0, Number(event.target.value) || 0),
                    })
                  }
                  className="tabular-nums"
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive size-9 shrink-0"
                onClick={() => onToggle(product, false)}
                aria-label={`Keluarkan ${product.name} dari toko`}
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>
          </>
        ) : null}
      </div>

      {checked && selection?.price == null && product.price != null ? (
        <p className="text-muted-foreground pb-1.5 pl-8 text-xs tabular-nums sm:pl-11">
          Memakai harga katalog {formatCurrency(product.price)}
        </p>
      ) : null}
    </li>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  summary: string;
  error?: string;
  errorId: string;
  children: React.ReactNode;
}

/**
 * A titled, bordered group with a live count in its header.
 *
 * The outer radius is a step larger than the rows inside it so the nested
 * corners stay optically concentric once the 4px padding is accounted for.
 */
function Section({
  icon,
  title,
  summary,
  error,
  errorId,
  children,
}: SectionProps) {
  return (
    <fieldset className="space-y-2">
      <div
        className={cn(
          "overflow-hidden rounded-xl border",
          error && "border-destructive",
        )}
        aria-describedby={error ? errorId : undefined}
      >
        <legend className="sr-only">{title}</legend>

        <header className="bg-muted/40 flex items-center justify-between gap-3 border-b px-3 py-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            {icon}
            {title}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {summary}
          </span>
        </header>

        {children}
      </div>

      {error ? (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground px-3 py-8 text-center text-sm text-pretty">
      {children}
    </p>
  );
}
