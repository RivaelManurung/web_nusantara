/** Who a broadcast is for. */
export type AudienceMode = "ALL" | "USERS" | "SEGMENT";

/** The inbox tab the message lands on. */
export type NotificationChannel = "PROMO" | "TRANSAKSI";

/** The tone the app renders an icon and colour from. */
export type NotificationType =
  | "PROMO"
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

/** Where tapping the notification takes the customer. */
export type NotificationTarget = "" | "ORDER" | "VOUCHER" | "POINT";

// --- the send history -------------------------------------------------
//
// One record per send, not per recipient. The notifications table holds a row
// for every customer, so listing it would show a promo to four hundred people
// four hundred times.

export interface BroadcastDto {
  id: string;
  title: string;
  body: string;
  channel: string;
  type: string;
  target_type: string;
  target_route: string;
  audience_mode: string;
  recipient_count: number;
  saved_count: number;
  push_requested: boolean;
  push_enabled: boolean;
  push_sent: number;
  push_failed: number;
  push_error: string;
  actor_id: string;
  actor_name: string;
  created_at: string;
}

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  channel: string;
  type: string;
  targetType: string;
  targetRoute: string;
  audienceMode: string;
  recipientCount: number;
  savedCount: number;
  pushRequested: boolean;
  pushEnabled: boolean;
  pushSent: number;
  pushFailed: number;
  pushError: string;
  actorId: string;
  actorName: string;
  createdAt: string;
}

export function toBroadcast(dto: BroadcastDto): Broadcast {
  return {
    id: dto.id,
    title: dto.title,
    body: dto.body,
    channel: dto.channel,
    type: dto.type,
    targetType: dto.target_type,
    targetRoute: dto.target_route,
    audienceMode: dto.audience_mode,
    recipientCount: dto.recipient_count,
    savedCount: dto.saved_count,
    pushRequested: dto.push_requested,
    pushEnabled: dto.push_enabled,
    pushSent: dto.push_sent,
    pushFailed: dto.push_failed,
    pushError: dto.push_error,
    actorId: dto.actor_id,
    actorName: dto.actor_name,
    createdAt: dto.created_at,
  };
}

const AUDIENCE_LABELS: Record<string, string> = {
  ALL: "Semua pelanggan",
  USERS: "Pelanggan terpilih",
  SEGMENT: "Segmen",
};

export function audienceLabel(mode: string): string {
  return AUDIENCE_LABELS[mode] ?? mode;
}

const CHANNEL_LABELS: Record<string, string> = {
  PROMO: "Promo",
  TRANSAKSI: "Transaksi",
};

export function channelLabel(channel: string): string {
  return CHANNEL_LABELS[channel] ?? channel;
}

/**
 * How a send actually turned out, in one phrase.
 *
 * Saved and pushed are separate outcomes: a promo written to four hundred
 * inboxes and delivered to ninety phones is normal, and collapsing that into
 * "terkirim" would hide it.
 */
export function deliverySummary(broadcast: Broadcast): string {
  if (!broadcast.pushRequested) return "Hanya inbox";
  if (!broadcast.pushEnabled) return "Push nonaktif di server";
  if (broadcast.pushFailed > 0) {
    return `${broadcast.pushSent} terkirim, ${broadcast.pushFailed} gagal`;
  }
  return `${broadcast.pushSent} perangkat`;
}

/** A candidate recipient, as the API returns it. */
export interface CustomerDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

/** The shape the picker works with. */
export interface Customer {
  id: string;
  name: string;
  /** One line under the name, so two people called Budi are distinguishable. */
  contact: string;
}

export function toCustomer(dto: CustomerDto): Customer {
  return {
    id: dto.id,
    name: dto.name,
    // Phone is the identifier most of these accounts actually have: sign-up is
    // by phone number, and email is often absent.
    contact: dto.phone || dto.email || "Tanpa kontak",
  };
}

/** Segment filters, as the form collects them. */
export interface SegmentInput {
  roleName: string;
  hasOrdered: boolean;
  /** `yyyy-MM-dd`, or empty. */
  registeredFrom: string;
  registeredTo: string;
}

export interface BroadcastInput {
  mode: AudienceMode;
  userIds: string[];
  segment: SegmentInput;
  channel: NotificationChannel;
  type: NotificationType;
  title: string;
  body: string;
  targetType: NotificationTarget;
  targetRoute: string;
  push: boolean;
}

/** What the API reports after a send. */
export interface BroadcastResultDto {
  recipients: number;
  saved: number;
  devices: number;
  push_sent: number;
  push_failed: number;
  push_enabled: boolean;
  push_error?: string;
}

export interface BroadcastResult {
  recipients: number;
  saved: number;
  devices: number;
  pushSent: number;
  pushFailed: number;
  isPushEnabled: boolean;
  pushError?: string;
}

export function toBroadcastResult(dto: BroadcastResultDto): BroadcastResult {
  return {
    recipients: dto.recipients,
    saved: dto.saved,
    devices: dto.devices,
    pushSent: dto.push_sent,
    pushFailed: dto.push_failed,
    isPushEnabled: dto.push_enabled,
    pushError: dto.push_error,
  };
}

/**
 * The request body.
 *
 * The dates go out as timestamps because the API reads them as such. The form
 * collects plain dates, and the end of the range is stretched to the end of
 * that day, so "sampai 31 Agustus" includes the thirty-first rather than
 * stopping at its first second.
 */
export function toBroadcastBody(input: BroadcastInput) {
  const audience: Record<string, unknown> = { mode: input.mode };

  if (input.mode === "USERS") {
    audience.user_ids = input.userIds;
  }

  if (input.mode === "SEGMENT") {
    audience.segment = {
      role_name: input.segment.roleName || undefined,
      has_ordered: input.segment.hasOrdered,
      registered_from: input.segment.registeredFrom
        ? `${input.segment.registeredFrom}T00:00:00Z`
        : undefined,
      registered_to: input.segment.registeredTo
        ? `${input.segment.registeredTo}T23:59:59Z`
        : undefined,
    };
  }

  return {
    audience,
    channel: input.channel,
    type: input.type,
    title: input.title,
    body: input.body,
    target_type: input.targetType,
    target_route: input.targetRoute,
    push: input.push,
  };
}
