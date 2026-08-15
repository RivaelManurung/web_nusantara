"use client";

import { ExternalLink, Images, Info, Map, MapPin } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect } from "react";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useShopContextStore } from "@/features/shop-context/store";
import { ApiError } from "@/lib/api/errors";

import { useAssignedShops, useShopDetails, useShopProducts } from "../queries";
import { useShopProductColumns } from "./shop-profile-table";

/** Browser-only: Leaflet reads `window` as its module initialises. */
const LocationMap = dynamic(() => import("@/components/shared/location-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />,
});

export function ShopProfilePage() {
  const {
    data: assignedShops,
    isLoading: isLoadingShops,
    error: shopsError,
  } = useAssignedShops();

  // The selected shop is shared app state, persisted by the store; this screen
  // reads it rather than keeping a second copy.
  const selectedShopId = useShopContextStore((state) => state.selectedShopId);
  const isHydrated = useShopContextStore((state) => state.isHydrated);
  const hydrate = useShopContextStore((state) => state.hydrate);
  const selectShop = useShopContextStore((state) => state.selectShop);

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [hydrate, isHydrated]);

  // Fall back to the first assignment when nothing is stored, or when the
  // stored shop is one this cashier no longer works in.
  const selectedId =
    assignedShops && assignedShops.length > 0
      ? (assignedShops.find((shop) => shop.id === selectedShopId)?.id ??
        assignedShops[0].id)
      : null;

  const {
    data: shop,
    isLoading: isLoadingShop,
    error: shopError,
  } = useShopDetails(selectedId);
  const { data: products, isLoading: isLoadingProducts } =
    useShopProducts(selectedId);
  const columns = useShopProductColumns();

  const error = shopsError ?? shopError;

  return (
    <div className="space-y-6">
      <PageHeader
        description="Informasi toko tempat Anda bertugas."
        actions={
          assignedShops && assignedShops.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {assignedShops.map((option) => (
                <Button
                  key={option.id}
                  variant={option.id === selectedId ? "default" : "outline"}
                  size="sm"
                  onClick={() => selectShop(option.id)}
                  aria-pressed={option.id === selectedId}
                >
                  {option.name}
                </Button>
              ))}
            </div>
          ) : null
        }
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof ApiError
              ? error.message
              : "Gagal memuat profil toko."}
          </AlertDescription>
        </Alert>
      ) : isLoadingShops || isLoadingShop ? (
        <ProfileSkeleton />
      ) : assignedShops && assignedShops.length === 0 ? (
        <Alert>
          <AlertDescription>
            Anda belum ditugaskan ke toko manapun. Hubungi admin untuk
            mendapatkan penugasan.
          </AlertDescription>
        </Alert>
      ) : shop ? (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="bg-muted relative h-48 w-full overflow-hidden rounded-t-xl">
                {shop.cover ? (
                  <Image
                    src={shop.cover}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>

              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {shop.name}
                  </h2>
                  <StatusBadge active={shop.isActive} />
                </div>

                <p className="text-muted-foreground flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {shop.fullAddress || "Alamat belum diisi."}
                </p>

                <div className="space-y-1">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <Info className="size-4" aria-hidden />
                    Deskripsi toko
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {shop.description || "Tidak ada deskripsi."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {shop.images.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Images className="size-4" aria-hidden />
                      Galeri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-2 gap-3">
                      {shop.images.map((url) => (
                        <li
                          key={url}
                          className="bg-muted relative h-24 overflow-hidden rounded-md border"
                        >
                          <Image
                            src={url}
                            alt=""
                            fill
                            sizes="160px"
                            className="object-cover"
                            unoptimized
                          />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : null}

              <LocationCard lat={shop.lat} lng={shop.lng} />
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Produk di toko ini
            </h2>
            {/* No rowHref: this listing is read-only and the app has no
                detail page for a shop's product. The only per-product screen
                is the catalogue edit form, which is a different record and
                not what a row here stands for. */}
            <DataTable
              columns={columns}
              data={products ?? []}
              isLoading={isLoadingProducts}
              emptyMessage="Belum ada produk di toko ini."
            />
          </section>
        </>
      ) : null}
    </div>
  );
}

/**
 * Location preview.
 *
 * Previously a Google static-map image guarded by `env.googleMapsApiKey`, which
 * is empty in this project -- so every cashier saw "pratinjau peta tidak
 * tersedia" instead of a map. Leaflet on OpenStreetMap tiles needs no key, so
 * the empty-key branch is gone rather than merely hidden.
 *
 * Read-only: no onChange, so the pin cannot be dragged. A cashier looking at
 * their shop's profile has no business moving it.
 */
function LocationCard({ lat, lng }: { lat: number; lng: number }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Map className="size-4" aria-hidden />
          Lokasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasCoordinates ? (
          <LocationMap
            lat={lat}
            lng={lng}
            className="h-40"
            label={`Peta lokasi toko pada ${lat}, ${lng}`}
          />
        ) : (
          <p className="text-muted-foreground bg-muted/50 rounded-md border p-4 text-sm">
            Koordinat toko ini belum diisi.
          </p>
        )}

        <dl className="text-muted-foreground grid grid-cols-2 gap-2 text-xs tabular-nums">
          <div>
            <dt className="font-medium">Latitude</dt>
            <dd>{lat}</dd>
          </div>
          <div>
            <dt className="font-medium">Longitude</dt>
            <dd>{lng}</dd>
          </div>
        </dl>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs underline underline-offset-4"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          Buka di Google Maps
        </a>
      </CardContent>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-80 lg:col-span-2" />
      <Skeleton className="h-80" />
    </div>
  );
}
