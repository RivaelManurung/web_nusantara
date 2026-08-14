"use client";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Product } from "../types";

interface Props {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}

/** Read-only view of every image attached to a product. */
export function ProductGalleryDialog({ product, onOpenChange }: Props) {
  const images = product
    ? [...(product.coverImage ? [product.coverImage] : []), ...product.images]
    : [];

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Galeri {product?.name}</DialogTitle>
          <DialogDescription>
            {images.length > 0
              ? `${images.length} gambar tersimpan untuk produk ini.`
              : "Produk ini belum punya gambar."}
          </DialogDescription>
        </DialogHeader>

        {images.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((url) => (
              <li
                key={url}
                className="bg-muted relative aspect-square overflow-hidden rounded-md border"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 200px, 45vw"
                  className="object-contain p-1"
                  unoptimized
                />
              </li>
            ))}
          </ul>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
