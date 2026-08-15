"use client";

import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency, formatDateTime } from "@/lib/format";

import { useChangeOrderStatus, useOrder, useOrderTimeline } from "../queries";
import {
  isStalled,
  orderTypeLabel,
  paymentLabel,
  statusLabel,
  type OrderDetail,
} from "../types";
import { OrderStatusBadge } from "./order-status-badge";
import { humaniseMinutes } from "./order-table";
import { OrderTimeline } from "./order-timeline";
import { StatusChangeDialog } from "./status-change-dialog";

/**
 * One order in full, with the actions that move it on.
 *
 * The action buttons are built from the order's own next_statuses rather than
 * from a lifecycle table in this file: the server already filtered them by
 * order type, so a take-away order never offers "Mencari kurir" and the screen
 * cannot drift from the validator.
 */
export function OrderDetailPage({ orderId }: { orderId: string }) {
  const query = useOrder(orderId);
  const timelineQuery = useOrderTimeline(orderId);
  const mutation = useChangeOrderStatus(orderId);

  const [target, setTarget] = useState<string | null>(null);

  const order = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        description={
          order
            ? `Pesanan ${order.code || "-"} di ${order.shopName || "-"}.`
            : "Detail pesanan."
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            render={<Link href={ROUTES.orders} />}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Kembali
          </Button>
        }
      />

      {query.error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {query.error instanceof ApiError
              ? query.error.message
              : "Gagal memuat detail pesanan."}
          </AlertDescription>
        </Alert>
      ) : null}

      {query.isLoading ? <DetailSkeleton /> : null}

      {order ? (
        <>
          <StatusCard
            order={order}
            onPick={setTarget}
            isPending={mutation.isPending}
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <ItemsCard order={order} />
              {order.address ? <AddressCard order={order} /> : null}
            </div>

            <div className="space-y-6">
              <CustomerCard order={order} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Riwayat status</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTimeline
                    entries={timelineQuery.data ?? []}
                    isLoading={timelineQuery.isLoading}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Keyed on the target so opening a different transition remounts
              the dialog with an empty reason: a draft typed for "Batalkan"
              must never be submitted against "Terima". */}
          <StatusChangeDialog
            key={target ?? "closed"}
            target={target}
            currentStatus={order.status}
            reasonRequired={
              target !== null && order.reasonRequiredFor.includes(target)
            }
            isPending={mutation.isPending}
            onCancel={() => setTarget(null)}
            onConfirm={(reason) => {
              if (!target) return;
              mutation.mutate(
                { status: target, reason },
                { onSuccess: () => setTarget(null) },
              );
            }}
          />
        </>
      ) : null}
    </div>
  );
}

function StatusCard({
  order,
  onPick,
  isPending,
}: {
  order: OrderDetail;
  onPick: (status: string) => void;
  isPending: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <span className="text-muted-foreground text-sm">
                {orderTypeLabel(order.orderType)} &middot;{" "}
                {paymentLabel(order.paymentMethod)}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Dibuat {formatDateTime(order.createdAt)} &middot; di status ini
              selama {humaniseMinutes(order.stalledForMinutes)}
            </p>
          </div>

          <p className="text-xl font-semibold tabular-nums">
            {formatCurrency(order.total)}
          </p>
        </div>

        {isStalled(order) ? (
          <Alert>
            <AlertDescription>
              Pesanan ini sudah tertahan{" "}
              {humaniseMinutes(order.stalledForMinutes)} di status{" "}
              {statusLabel(order.status)}.
            </AlertDescription>
          </Alert>
        ) : null}

        {order.nextStatuses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {order.nextStatuses.map((status) => (
              <Button
                key={status}
                size="sm"
                variant={
                  order.reasonRequiredFor.includes(status)
                    ? "destructive"
                    : "default"
                }
                disabled={isPending}
                onClick={() => onPick(status)}
              >
                {statusLabel(status)}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Pesanan ini sudah final. Tidak ada perubahan status yang tersedia.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ItemsCard({ order }: { order: OrderDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Item pesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="divide-border divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-md border">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {item.productName || "-"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {item.productCode || "-"} &times; {item.quantity}
                </p>
              </div>
              <p className="text-sm tabular-nums">
                {formatCurrency(item.subTotal)}
              </p>
            </li>
          ))}
          {order.items.length === 0 ? (
            <li className="text-muted-foreground py-3 text-sm">
              Tidak ada item tercatat pada pesanan ini.
            </li>
          ) : null}
        </ul>

        <dl className="space-y-1 text-sm">
          <MoneyRow label="Subtotal" value={order.subTotal} />
          {order.discountEvent > 0 ? (
            <MoneyRow label="Diskon event" value={-order.discountEvent} muted />
          ) : null}
          {order.discountVoucher > 0 ? (
            <MoneyRow
              label="Diskon voucher"
              value={-order.discountVoucher}
              muted
            />
          ) : null}
          {order.shippingFee > 0 ? (
            <MoneyRow label="Ongkos kirim" value={order.shippingFee} muted />
          ) : null}
          <div className="border-border flex items-center justify-between border-t pt-2 font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCurrency(order.total)}</dd>
          </div>
        </dl>

        {order.vouchers.length > 0 ? (
          <div className="text-sm">
            <p className="font-medium">Voucher dipakai</p>
            <ul className="text-muted-foreground mt-1 space-y-1">
              {order.vouchers.map((voucher) => (
                <li key={voucher.voucherId}>
                  <span className="font-mono">{voucher.code || "-"}</span>
                  {voucher.description ? ` — ${voucher.description}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {order.note ? (
          <div className="text-sm">
            <p className="font-medium">Catatan pelanggan</p>
            <p className="text-muted-foreground mt-1">{order.note}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MoneyRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${muted ? "text-muted-foreground" : ""}`}
    >
      <dt>{label}</dt>
      <dd className="tabular-nums">{formatCurrency(value)}</dd>
    </div>
  );
}

function CustomerCard({ order }: { order: OrderDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pelanggan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="font-medium">{order.customerName || "-"}</p>
        <p className="text-muted-foreground">{order.customerEmail || "-"}</p>
        <p className="text-muted-foreground">{order.customerPhone || "-"}</p>
        <p className="text-muted-foreground pt-2">
          Toko: {order.shopName || "-"}
        </p>
        <p className="text-muted-foreground">{order.shopAddress || "-"}</p>
      </CardContent>
    </Card>
  );
}

function AddressCard({ order }: { order: OrderDetail }) {
  const address = order.address;
  if (!address) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address.lat},${address.lng}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4" aria-hidden />
          Alamat pengiriman
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-medium">{address.label || "-"}</p>
        <p className="text-muted-foreground">{address.fullAddress || "-"}</p>
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

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat detail pesanan…</span>
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
