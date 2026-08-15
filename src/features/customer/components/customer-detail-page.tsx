"use client";

import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ROUTES } from "@/config/routes";
import { PointPanel } from "@/features/point/components/point-panel";
import { VoucherPanel } from "@/features/point/components/voucher-panel";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

import { useCustomer, useSetCustomerStatus } from "../queries";
import {
  looksSuspicious,
  moderationLabel,
  roleLabel,
  type CustomerDetail,
} from "../types";
import { BlockDialog } from "./block-dialog";

/**
 * One account in full, with the moderation controls.
 *
 * The order history lives on the orders screen, reachable from here by a
 * pre-filtered link rather than duplicated: one table of orders is enough, and
 * a second copy would drift from the first.
 */
export function CustomerDetailPage({ customerId }: { customerId: string }) {
  const query = useCustomer(customerId);
  const mutation = useSetCustomerStatus(customerId);
  const [confirming, setConfirming] = useState(false);

  const customer = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        description={customer ? `Akun ${customer.name}.` : "Detail akun."}
        actions={
          <Button
            variant="outline"
            size="sm"
            render={<Link href={ROUTES.customers} />}
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
              : "Gagal memuat detail akun."}
          </AlertDescription>
        </Alert>
      ) : null}

      {query.isLoading ? <DetailSkeleton /> : null}

      {customer ? (
        <>
          {!customer.isActive ? (
            <Alert variant="destructive">
              <AlertDescription>
                Akun ini diblokir dan tidak bisa masuk.
                {customer.moderation[0]?.reason
                  ? ` Alasan terakhir: ${customer.moderation[0].reason}`
                  : ""}
              </AlertDescription>
            </Alert>
          ) : null}

          {looksSuspicious(customer) ? (
            <Alert>
              <ShieldAlert className="size-4" aria-hidden />
              <AlertDescription>
                Akun ini mengklaim {customer.voucherClaimed} voucher, belum
                memakai satu pun, dan belum pernah memesan. Pola ini layak
                diperiksa sebelum diambil tindakan.
              </AlertDescription>
            </Alert>
          ) : null}

          <IdentityCard
            customer={customer}
            isPending={mutation.isPending}
            onModerate={() => setConfirming(true)}
          />

          {/* The account's own data is split by question rather than stacked:
              "who is this" (Ringkasan), "why is their balance wrong" (Poin),
              and "what promotions have they taken" (Voucher). The moderation
              controls stay above the tabs because they apply to the account
              whichever tab is open. */}
          <Tabs defaultValue="summary">
            <TabsList variant="line" className="mb-6">
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="points">Poin</TabsTrigger>
              <TabsTrigger value="vouchers">Voucher</TabsTrigger>
            </TabsList>

            <TabsContent value="points">
              <PointPanel userId={customer.id} />
            </TabsContent>

            <TabsContent value="vouchers">
              <VoucherPanel userId={customer.id} />
            </TabsContent>

            <TabsContent value="summary">
          <div className="grid gap-6 lg:grid-cols-3">
            <StatsCard customer={customer} />
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Riwayat moderasi</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.moderation.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Belum ada tindakan yang pernah diambil terhadap akun ini.
                  </p>
                ) : (
                  <ol className="space-y-4">
                    {customer.moderation.map((entry) => (
                      <li
                        key={entry.id}
                        className="border-border border-l-2 pl-4"
                      >
                        <Badge
                          variant={
                            entry.action === "BLOCKED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {moderationLabel(entry.action)}
                        </Badge>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {formatDateTime(entry.createdAt)} &middot;{" "}
                          {entry.actorName || "Sistem"}
                        </p>
                        {entry.reason ? (
                          <p className="mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Alasan:{" "}
                            </span>
                            {entry.reason}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
            </TabsContent>
          </Tabs>

          {/* Keyed so a draft reason never survives into the next dialog. */}
          <BlockDialog
            key={confirming ? "open" : "closed"}
            open={confirming}
            isBlocking={customer.isActive}
            customerName={customer.name}
            isPending={mutation.isPending}
            onCancel={() => setConfirming(false)}
            onConfirm={(reason) =>
              mutation.mutate(
                { isActive: !customer.isActive, reason },
                { onSuccess: () => setConfirming(false) },
              )
            }
          />
        </>
      ) : null}
    </div>
  );
}

function IdentityCard({
  customer,
  isPending,
  onModerate,
}: {
  customer: CustomerDetail;
  isPending: boolean;
  onModerate: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={customer.photo || undefined} alt="" />
            <AvatarFallback className="text-lg">
              {initials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-lg font-semibold">{customer.name || "-"}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{roleLabel(customer.role)}</Badge>
              <StatusBadge
                active={customer.isActive}
                activeLabel="Aktif"
                inactiveLabel="Diblokir"
              />
            </div>
            <p className="text-muted-foreground text-sm">
              {customer.email || "-"}
              {customer.emailVerified ? " (terverifikasi)" : ""}
            </p>
            <p className="text-muted-foreground text-sm">
              {customer.phone || "-"}
              {customer.phoneVerified ? " (terverifikasi)" : ""}
            </p>
          </div>
        </div>

        <Button
          variant={customer.isActive ? "destructive" : "default"}
          size="sm"
          disabled={isPending}
          onClick={onModerate}
        >
          {customer.isActive ? "Blokir akun" : "Aktifkan kembali"}
        </Button>
      </CardContent>
    </Card>
  );
}

function StatsCard({ customer }: { customer: CustomerDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ringkasan</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          <Row label="Bergabung" value={formatDate(customer.createdAt)} />
          <Row
            label="Pesanan terakhir"
            value={
              customer.lastOrderAt
                ? formatDateTime(customer.lastOrderAt)
                : "Belum pernah"
            }
          />
          <Row
            label="Jumlah pesanan"
            value={customer.orderCount.toLocaleString("id-ID")}
          />
          <Row
            label="Total belanja"
            value={formatCurrency(customer.totalSpend)}
          />
          <Row
            label="Saldo poin"
            value={customer.pointBalance.toLocaleString("id-ID")}
          />
          <Row
            label="Voucher diklaim / dipakai"
            value={`${customer.voucherClaimed} / ${customer.voucherUsed}`}
          />
        </dl>

        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          render={<Link href={`${ROUTES.orders}?customer_id=${customer.id}`} />}
        >
          Lihat pesanan akun ini
        </Button>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat detail akun…</span>
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72" />
        <Skeleton className="h-72 lg:col-span-2" />
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
