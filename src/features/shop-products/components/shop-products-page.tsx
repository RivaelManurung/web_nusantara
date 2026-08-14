"use client";

import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/errors";

import { useShopContextStore } from "@/features/shop-context/store";

import { useCashierShops, useShopProducts, useShopSummary } from "../queries";
import { ShopProductCard } from "./shop-product-card";

export function ShopProductsPage() {
  const shopsQuery = useCashierShops();
  const [chosenShopId, setChosenShopId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // The selected shop is shared with the header switcher and every other
  // per-shop screen, so it comes from the one store rather than a second
  // localStorage key of this page's own.
  const storedShopId = useShopContextStore((state) => state.selectedShopId);
  const hydrateShopContext = useShopContextStore((state) => state.hydrate);
  const selectShop = useShopContextStore((state) => state.selectShop);

  useEffect(() => hydrateShopContext(), [hydrateShopContext]);

  /**
   * The shop actually shown: the cashier's pick, else the one remembered from
   * last time, else the first assignment. Deriving it rather than storing it
   * means a shop the cashier has since been removed from can never stay
   * selected.
   */
  const shopId = useMemo(() => {
    const shops = shopsQuery.data ?? [];
    if (shops.length === 0) return null;

    const isAssigned = (id: string | null) =>
      Boolean(id) && shops.some((shop) => shop.id === id);

    if (isAssigned(chosenShopId)) return chosenShopId;
    if (isAssigned(storedShopId)) return storedShopId;
    return shops[0].id;
  }, [chosenShopId, shopsQuery.data, storedShopId]);

  useEffect(() => {
    if (shopId && shopId !== storedShopId) selectShop(shopId);
  }, [selectShop, shopId, storedShopId]);

  const shopQuery = useShopSummary(shopId);
  const productsQuery = useShopProducts(shopId);

  const products = useMemo(() => {
    const all = productsQuery.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return all;
    // The endpoint returns the whole shop at once and takes no search
    // parameter, so filtering happens here rather than as another request.
    return all.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.code.toLowerCase().includes(term),
    );
  }, [productsQuery.data, search]);

  const error = shopsQuery.error ?? shopQuery.error ?? productsQuery.error;
  const hasNoShops =
    shopsQuery.isSuccess && (shopsQuery.data?.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        description={
          shopQuery.data
            ? `Menampilkan produk untuk ${shopQuery.data.name}.`
            : "Produk yang dijual di toko yang Anda kelola."
        }
        actions={
          (shopsQuery.data?.length ?? 0) > 1 ? (
            <Select
              items={(shopsQuery.data ?? []).map((shop) => ({
                label: shop.name,
                value: shop.id,
              }))}
              value={shopId}
              onValueChange={(value) => setChosenShopId(value)}
            >
              <SelectTrigger aria-label="Pilih toko" className="min-w-52">
                <SelectValue placeholder="Pilih toko" />
              </SelectTrigger>
              <SelectContent>
                {(shopsQuery.data ?? []).map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null
        }
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError ? error.message : "Gagal memuat data."}
          </AlertDescription>
        </Alert>
      ) : hasNoShops ? (
        <Alert>
          <AlertDescription>
            Anda belum ditugaskan ke toko manapun. Hubungi admin untuk
            mendapatkan akses.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari nama atau kode produk…"
          />

          {shopsQuery.isLoading || productsQuery.isLoading ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_item, index) => (
                <li key={`skeleton-${index}`}>
                  <Card className="overflow-hidden pt-0">
                    <Skeleton className="aspect-4/3 w-full rounded-none" />
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center text-sm">
                {search
                  ? `Tidak ada produk yang cocok dengan “${search}”.`
                  : "Toko ini belum menjual produk apa pun."}
              </CardContent>
            </Card>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <li key={product.id}>
                  <ShopProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
