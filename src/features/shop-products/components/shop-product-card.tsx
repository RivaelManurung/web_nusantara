"use client";

import { Package } from "lucide-react";
import Image from "next/image";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { ShopProduct } from "../types";

interface Props {
  product: ShopProduct;
}

export function ShopProductCard({ product }: Props) {
  const isOutOfStock = product.stock <= 0;

  return (
    <Card className="overflow-hidden pt-0">
      <div className="bg-muted relative aspect-4/3 w-full">
        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt=""
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 90vw"
            className={cn(
              "object-cover",
              // A dimmed card reads as unavailable at a glance, which matters
              // on a cashier screen scanned rather than read.
              !product.isActive && "grayscale",
            )}
            unoptimized
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <Package className="size-8" aria-hidden />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge active={product.isActive} />
        </div>
      </div>

      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {product.code}
            </Badge>
            <span className="text-muted-foreground truncate text-xs">
              {product.typeProductName}
            </span>
          </div>
          <h3 className="truncate font-semibold" title={product.name}>
            {product.name}
          </h3>
        </div>

        <p className="text-lg font-bold tabular-nums">
          {formatCurrency(product.price)}
        </p>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-muted-foreground text-xs font-medium uppercase">
            Stok
          </span>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              isOutOfStock && "text-destructive",
            )}
          >
            {product.stock}{" "}
            <span className="text-muted-foreground font-normal">
              {product.unit}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
