"use client";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  src: string | null;
  alt?: string;
  onOpenChange: (open: boolean) => void;
}

/** Lightbox: shows one image at a readable size over the current screen. */
export function ImagePreviewDialog({
  src,
  alt = "",
  onOpenChange,
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={Boolean(src)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Pratinjau gambar</DialogTitle>
        </DialogHeader>

        {src ? (
          <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-md sm:aspect-video">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-contain"
              unoptimized
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
