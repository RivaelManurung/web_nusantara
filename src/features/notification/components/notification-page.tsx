"use client";

import { ArrowLeft, BellRing, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/config/routes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useSendNotification } from "../queries";
import type {
  AudienceMode,
  BroadcastResult,
  Customer,
  NotificationChannel,
  NotificationTarget,
  NotificationType,
  SegmentInput,
} from "../types";
import { AudiencePicker } from "./audience-picker";

const MAX_TITLE = 255;
const MAX_BODY = 1000;

const CHANNELS: { value: NotificationChannel; label: string }[] = [
  { value: "PROMO", label: "Promo" },
  { value: "TRANSAKSI", label: "Transaksi" },
];

const TYPES: { value: NotificationType; label: string }[] = [
  { value: "PROMO", label: "Promo" },
  { value: "INFO", label: "Informasi" },
  { value: "SUCCESS", label: "Berhasil" },
  { value: "WARNING", label: "Peringatan" },
  { value: "ERROR", label: "Gagal" },
];

/**
 * The deep-link target. "NONE" stands in for the empty string the API expects,
 * because a Select item cannot carry an empty value.
 */
const TARGETS: { value: string; label: string }[] = [
  { value: "NONE", label: "Tidak membuka halaman" },
  { value: "VOUCHER", label: "Halaman voucher" },
  { value: "ORDER", label: "Halaman pesanan" },
  { value: "POINT", label: "Halaman poin" },
];

const EMPTY_SEGMENT: SegmentInput = {
  roleName: "",
  hasOrdered: false,
  registeredFrom: "",
  registeredTo: "",
};

/**
 * Composes one notification and sends it to the mobile app.
 *
 * This screen is a form rather than a list: the messages it sends live in each
 * customer's own inbox, which the back office does not read. What it does show
 * afterwards is the delivery breakdown -- "tersimpan untuk 400 pelanggan,
 * terkirim ke 90 perangkat" is a normal result, and the gap between the two is
 * the only way to notice that most customers never allowed notifications.
 */
export function NotificationPage() {
  const [mode, setMode] = useState<AudienceMode>("ALL");
  const [selected, setSelected] = useState<Customer[]>([]);
  const [segment, setSegment] = useState<SegmentInput>(EMPTY_SEGMENT);

  const [channel, setChannel] = useState<NotificationChannel>("PROMO");
  const [type, setType] = useState<NotificationType>("PROMO");
  const [target, setTarget] = useState<string>("NONE");
  const [targetRoute, setTargetRoute] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [push, setPush] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<BroadcastResult | null>(null);

  const send = useSendNotification();

  function validate(): boolean {
    const found: Record<string, string> = {};

    if (!title.trim()) found.title = "Judul wajib diisi.";
    if (!body.trim()) found.body = "Isi pesan wajib diisi.";

    if (mode === "USERS" && selected.length === 0) {
      found.audience = "Pilih minimal satu pelanggan.";
    }

    if (mode === "SEGMENT") {
      const hasFilter =
        segment.roleName.trim() !== "" ||
        segment.hasOrdered ||
        segment.registeredFrom !== "" ||
        segment.registeredTo !== "";
      // The server refuses an empty segment too -- it would silently mean
      // "everybody". Catching it here saves a round trip and explains why.
      if (!hasFilter) found.audience = "Isi minimal satu filter segmen.";
    }

    setErrors(found);
    return Object.keys(found).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    const outcome = await send.mutateAsync({
      mode,
      userIds: selected.map((customer) => customer.id),
      segment,
      channel,
      type,
      title: title.trim(),
      body: body.trim(),
      targetType: (target === "NONE" ? "" : target) as NotificationTarget,
      targetRoute: targetRoute.trim(),
      push,
    });

    setResult(outcome);
    // The message is cleared but the audience is not: a follow-up to the same
    // segment is the common next action.
    setTitle("");
    setBody("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Kirim pengumuman atau promo ke aplikasi pelanggan."
        actions={
          <Button
            variant="outline"
            size="sm"
            render={<Link href={ROUTES.notifications} />}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Riwayat
          </Button>
        }
      />

      {result ? <ResultPanel result={result} /> : null}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Isi notifikasi</CardTitle>
            <CardDescription>
              Judul dan isi inilah yang muncul di layar kunci pelanggan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="notification-title">Judul</Label>
              <Input
                id="notification-title"
                placeholder="Promo Merdeka 17 Agustus"
                value={title}
                maxLength={MAX_TITLE}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={
                  errors.title ? "notification-title-error" : undefined
                }
                onChange={(event) => setTitle(event.target.value)}
              />
              {errors.title ? (
                <p
                  id="notification-title-error"
                  className="text-destructive text-sm"
                >
                  {errors.title}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-body">Isi pesan</Label>
              <Textarea
                id="notification-body"
                rows={4}
                placeholder="Diskon 50% untuk semua oleh-oleh, hari ini saja."
                value={body}
                maxLength={MAX_BODY}
                aria-invalid={Boolean(errors.body)}
                aria-describedby={
                  errors.body ? "notification-body-error" : undefined
                }
                onChange={(event) => setBody(event.target.value)}
              />
              <p className="text-muted-foreground text-sm">
                {body.length}/{MAX_BODY} karakter.
              </p>
              {errors.body ? (
                <p
                  id="notification-body-error"
                  className="text-destructive text-sm"
                >
                  {errors.body}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="notification-channel">Tab inbox</Label>
                <Select
                  items={CHANNELS}
                  value={channel}
                  onValueChange={(value) =>
                    setChannel(value as NotificationChannel)
                  }
                >
                  <SelectTrigger id="notification-channel" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-type">Jenis</Label>
                <Select
                  items={TYPES}
                  value={type}
                  onValueChange={(value) => setType(value as NotificationType)}
                >
                  <SelectTrigger id="notification-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-target">Aksi saat diketuk</Label>
                <Select
                  items={TARGETS}
                  value={target}
                  // Base UI reports a cleared selection as null; this control
                  // always has a value, so a clear falls back to "no action"
                  // rather than leaving the field empty.
                  onValueChange={(value) => setTarget(value ?? "NONE")}
                >
                  <SelectTrigger id="notification-target" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGETS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-route">Rute (opsional)</Label>
                <Input
                  id="notification-route"
                  placeholder="/rewards"
                  value={targetRoute}
                  onChange={(event) => setTargetRoute(event.target.value)}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Switch
                id="notification-push"
                checked={push}
                onCheckedChange={setPush}
              />
              <div className="space-y-0.5">
                <Label htmlFor="notification-push">Kirim push ke HP</Label>
                <p className="text-muted-foreground text-sm">
                  Matikan jika notifikasi cukup menunggu di inbox aplikasi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penerima</CardTitle>
            <CardDescription>
              Pilih siapa yang menerima notifikasi ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AudiencePicker
              mode={mode}
              onModeChange={setMode}
              selected={selected}
              onSelectedChange={setSelected}
              segment={segment}
              onSegmentChange={setSegment}
              error={errors.audience}
              disabled={send.isPending}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="submit" disabled={send.isPending}>
            {send.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Mengirim…
              </>
            ) : (
              <>
                <BellRing className="size-4" aria-hidden />
                Kirim notifikasi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

/** The delivery breakdown of the last send. */
function ResultPanel({ result }: { result: BroadcastResult }) {
  const stats = [
    { label: "Penerima", value: result.recipients },
    { label: "Masuk inbox", value: result.saved },
    { label: "Perangkat", value: result.devices },
    { label: "Push terkirim", value: result.pushSent },
    { label: "Push gagal", value: result.pushFailed },
  ];

  return (
    <Alert variant={result.pushError ? "destructive" : "default"}>
      <AlertTitle>Notifikasi terkirim</AlertTitle>
      <AlertDescription className="space-y-3">
        <dl className="flex flex-wrap gap-x-6 gap-y-2">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-muted-foreground text-xs">{stat.label}</dt>
              <dd className="font-medium tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>

        {!result.isPushEnabled ? (
          <p>
            Push belum aktif di server, jadi notifikasi hanya tersimpan di inbox
            aplikasi. Isi kredensial Firebase (FCM_CREDENTIALS) untuk
            mengaktifkannya.
          </p>
        ) : null}

        {result.pushError ? <p>{result.pushError}</p> : null}

        {result.isPushEnabled && result.devices === 0 ? (
          <p>
            Tidak ada perangkat terdaftar untuk penerima ini — pelanggan perlu
            membuka aplikasi dan mengizinkan notifikasi terlebih dahulu.
          </p>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
