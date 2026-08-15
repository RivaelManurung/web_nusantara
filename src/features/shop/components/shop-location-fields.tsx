"use client";

import { ExternalLink, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Skeleton } from "@/components/ui/skeleton";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Type-only import; the dialog owns the schema these fields are registered against.
import type { ShopFormValues } from "./shop-form";

/**
 * Leaflet reads `window` while its module initialises, which throws during
 * Next's server render even from inside a client component. ssr:false is the
 * supported way to say "this one is browser-only".
 */
const LocationMap = dynamic(() => import("@/components/shared/location-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

interface Props {
  register: UseFormRegister<ShopFormValues>;
  errors: FieldErrors<ShopFormValues>;
  /** Live values, used by the map and the "open in maps" shortcut. */
  lat: number;
  lng: number;
  /** Writes a dragged or clicked position back into the form. */
  onPick: (lat: number, lng: number) => void;
}

/**
 * Address and coordinates.
 *
 * The Vue app picked coordinates by dragging a marker on an embedded Google
 * Map. That was not ported at first because the Maps key is optional here and
 * empty in practice, and a form that silently breaks without a key is worse
 * than one that always works.
 *
 * The picker is back, on OpenStreetMap tiles through Leaflet, which needs no
 * key and no billing account -- so the "what if the key is missing" branch this
 * file used to carry is gone entirely rather than merely hidden.
 *
 * The numeric inputs stay, and are not decoration. A draggable pin cannot be
 * operated without a pointer, so the fields are the keyboard and screen-reader
 * path to the same two values; the map is an enhancement over them. They also
 * remain the way to paste coordinates copied from somewhere else.
 */
export function ShopLocationFields({
  register,
  errors,
  lat,
  lng,
  onPick,
}: Props) {
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <fieldset className="space-y-4">
      <legend className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="size-4" aria-hidden />
        Lokasi
      </legend>

      <div className="space-y-2">
        <Label htmlFor="shop-address">Alamat lengkap</Label>
        <Textarea
          id="shop-address"
          rows={2}
          placeholder="Jl. Merdeka No. 10, Medan Petisah, Kota Medan"
          aria-invalid={Boolean(errors.fullAddress)}
          aria-describedby={
            errors.fullAddress ? "shop-address-error" : undefined
          }
          {...register("fullAddress")}
        />
        {errors.fullAddress ? (
          <p id="shop-address-error" className="text-destructive text-sm">
            {errors.fullAddress.message}
          </p>
        ) : null}
      </div>

      {hasCoordinates ? (
        <div className="space-y-2">
          <LocationMap
            lat={lat}
            lng={lng}
            onChange={onPick}
            label={`Peta lokasi toko pada ${lat}, ${lng}. Geser penanda atau klik peta untuk memindahkannya.`}
          />
          <p className="text-muted-foreground text-xs">
            Klik peta atau geser penanda untuk menentukan titik. Koordinat di
            bawah ikut menyesuaikan, dan bisa juga diisi langsung.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="shop-lat">Latitude</Label>
          <Input
            id="shop-lat"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="-6.2088"
            aria-invalid={Boolean(errors.lat)}
            aria-describedby={errors.lat ? "shop-lat-error" : undefined}
            {...register("lat", { valueAsNumber: true })}
          />
          {errors.lat ? (
            <p id="shop-lat-error" className="text-destructive text-sm">
              {errors.lat.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shop-lng">Longitude</Label>
          <Input
            id="shop-lng"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="106.8456"
            aria-invalid={Boolean(errors.lng)}
            aria-describedby={errors.lng ? "shop-lng-error" : undefined}
            {...register("lng", { valueAsNumber: true })}
          />
          {errors.lng ? (
            <p id="shop-lng-error" className="text-destructive text-sm">
              {errors.lng.message}
            </p>
          ) : null}
        </div>
      </div>

      {hasCoordinates ? (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs underline underline-offset-4"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          Periksa titik ini di Google Maps
        </a>
      ) : null}
    </fieldset>
  );
}
