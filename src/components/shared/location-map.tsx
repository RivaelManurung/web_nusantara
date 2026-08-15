"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

/**
 * A map for picking or showing a shop's location.
 *
 * OpenStreetMap tiles via Leaflet, deliberately, rather than Google Maps: the
 * previous approach needed NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, that key is empty in
 * this project, and the fallback was two numeric inputs asking an admin to type
 * "-6.2088" by hand. A map that always works beats a better map that usually
 * does not.
 *
 * Must be loaded with `next/dynamic` and `ssr: false` by its consumers: Leaflet
 * touches `window` at module scope, which throws during Next's server render
 * even inside a client component.
 */

/**
 * The marker, drawn as inline HTML rather than Leaflet's default PNG.
 *
 * Leaflet's bundled icon resolves its image by relative URL, which breaks under
 * every bundler unless the asset paths are patched by hand. A divIcon has no
 * asset to lose, renders crisply at any density, and inherits the app's accent
 * colour instead of shipping a second visual language.
 */
const markerIcon = L.divIcon({
  className: "",
  html: `
    <span style="
      display:block; width:22px; height:22px;
      border-radius:9999px 9999px 9999px 2px;
      transform: rotate(-45deg);
      background: var(--color-primary, oklch(55% 0.2 250));
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,.4);
    "></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

/** Keeps the map centred when the coordinates change from outside the map. */
function Recentre({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    // Only pan when the point has genuinely moved off-centre, so dragging the
    // marker does not fight the map for control.
    const current = map.getCenter();
    if (
      Math.abs(current.lat - lat) > 1e-6 ||
      Math.abs(current.lng - lng) > 1e-6
    ) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);

  return null;
}

/** Turns a click anywhere on the map into a new position. */
function ClickToPlace({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (event) => onChange(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

interface LocationMapProps {
  lat: number;
  lng: number;
  /** Omitted for a read-only preview; supplied to make the map a picker. */
  onChange?: (lat: number, lng: number) => void;
  /** Height utility class, so callers control the shape. */
  className?: string;
  /** Describes the map to assistive technology. */
  label: string;
}

export default function LocationMap({
  lat,
  lng,
  onChange,
  className = "h-64",
  label,
}: LocationMapProps) {
  const interactive = typeof onChange === "function";

  return (
    <div
      className={`overflow-hidden rounded-md border ${className}`}
      // The map is a graphic with a text alternative. The coordinates stay
      // available as real form inputs beside it, which is the path a keyboard
      // or screen-reader user actually takes -- a draggable pin is not operable
      // without a pointer, so it is an enhancement, never the only way to set a
      // location.
      role="img"
      aria-label={label}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={interactive}
        dragging={interactive}
        className="size-full"
      >
        <TileLayer
          // Attribution is a licence condition of using OSM tiles, not decoration.
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <Marker
          position={[lat, lng]}
          icon={markerIcon}
          draggable={interactive}
          eventHandlers={
            interactive
              ? {
                  // Typed explicitly: react-leaflet's LeafletEventHandlerFnMap
                  // widens `target` to `any`, so without this the marker's new
                  // position would be read off an untyped object.
                  dragend: (event: L.DragEndEvent) => {
                    const marker = event.target as L.Marker;
                    const { lat: nextLat, lng: nextLng } = marker.getLatLng();
                    onChange?.(nextLat, nextLng);
                  },
                }
              : undefined
          }
        />

        <Recentre lat={lat} lng={lng} />
        {interactive ? <ClickToPlace onChange={onChange} /> : null}
      </MapContainer>
    </div>
  );
}
