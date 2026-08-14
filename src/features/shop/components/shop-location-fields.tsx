"use client";

import { ExternalLink, MapPin } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Type-only import; the dialog owns the schema these fields are registered against.
import type { ShopFormValues } from "./shop-form-dialog";

interface Props {
  register: UseFormRegister<ShopFormValues>;
  errors: FieldErrors<ShopFormValues>;
  /** Live values, used for the "open in maps" shortcut. */
  lat: number;
  lng: number;
}

/**
 * Address and coordinates.
 *
 * The Vue app picked coordinates by dragging a marker on an embedded Google
 * Map, which reverse-geocoded into the address field. That map is not ported:
 * the Maps key is optional here (`env.googleMapsApiKey` may be empty), and a
 * form that silently breaks without a key is worse than one that always works.
 * The same three values -- address, lat, lng -- are captured as validated
 * inputs instead, and a link opens the coordinates in Google Maps so they can
 * be checked.
 *
 * TODO: drop an interactive picker in here once a maps key is guaranteed. It
 * only needs to write back into `full_address`, `lat`, and `lng`; nothing else
 * in this feature depends on how those three values are obtained.
 */
export function ShopLocationFields({ register, errors, lat, lng }: Props) {
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
