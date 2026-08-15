/**
 * Accounts, as the back office sees them.
 *
 * This is the admin's view of somebody else's account. It is distinct from
 * `src/features/auth`, which models the signed-in user's own profile: the two
 * carry different fields and answer to different endpoints, and merging them
 * would put a moderation history on the settings screen.
 */

export const ACCOUNT_ACTIVE = 1;
export const ACCOUNT_BLOCKED = 0;

export interface CustomerSummaryDto {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  photo: string;
  role: string;
  status: number;
  email_verified: boolean;
  phone_verified: boolean;
  order_count: number;
  total_spend: number;
  created_at: string;
}

export interface ModerationEntryDto {
  id: string;
  action: string;
  reason: string;
  actor_id: string;
  actor_name: string;
  created_at: string;
}

export interface CustomerDetailDto extends CustomerSummaryDto {
  gender: string;
  date_of_birth: string | null;
  point_balance: number;
  voucher_claimed: number;
  voucher_used: number;
  last_order_at: string | null;
  moderation: ModerationEntryDto[];
}

export interface CustomerSummary {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  photo: string;
  role: string;
  /** The API models status as an integer; 1 means the account may sign in. */
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  orderCount: number;
  /** Counts only revenue statuses, so a cancelled order never inflates it. */
  totalSpend: number;
  createdAt: string;
}

export interface ModerationEntry {
  id: string;
  action: string;
  reason: string;
  actorId: string;
  actorName: string;
  createdAt: string;
}

export interface CustomerDetail extends CustomerSummary {
  gender: string;
  dateOfBirth: string | null;
  pointBalance: number;
  voucherClaimed: number;
  voucherUsed: number;
  lastOrderAt: string | null;
  /** Block and unblock history, newest first. */
  moderation: ModerationEntry[];
}

export function toCustomerSummary(dto: CustomerSummaryDto): CustomerSummary {
  return {
    id: dto.id,
    name: dto.name,
    username: dto.username,
    email: dto.email,
    phone: dto.phone,
    photo: dto.photo,
    role: dto.role,
    isActive: dto.status === ACCOUNT_ACTIVE,
    emailVerified: dto.email_verified,
    phoneVerified: dto.phone_verified,
    orderCount: dto.order_count,
    totalSpend: dto.total_spend,
    createdAt: dto.created_at,
  };
}

export function toCustomerDetail(dto: CustomerDetailDto): CustomerDetail {
  return {
    ...toCustomerSummary(dto),
    gender: dto.gender,
    dateOfBirth: dto.date_of_birth,
    pointBalance: dto.point_balance,
    voucherClaimed: dto.voucher_claimed,
    voucherUsed: dto.voucher_used,
    lastOrderAt: dto.last_order_at,
    moderation: (dto.moderation ?? []).map((row) => ({
      id: row.id,
      action: row.action,
      reason: row.reason,
      actorId: row.actor_id,
      actorName: row.actor_name,
      createdAt: row.created_at,
    })),
  };
}

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin Toko",
  cashier: "Kasir",
  customer: "Pelanggan",
};

/** An unknown role is echoed rather than blanked, so a newly added one shows. */
export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export function moderationLabel(action: string): string {
  if (action === "BLOCKED") return "Diblokir";
  if (action === "UNBLOCKED") return "Diaktifkan kembali";
  return action;
}

/** The filter state the list screen owns. */
export interface CustomerFilters {
  search: string;
  role: string;
  /** "" = any, "1" = active, "0" = blocked. Kept as a string for the Select. */
  status: string;
}

export const EMPTY_CUSTOMER_FILTERS: CustomerFilters = {
  search: "",
  role: "",
  status: "",
};

/**
 * Accounts worth a second look, from data the detail already carries.
 *
 * Deliberately crude and explainable rather than clever: an account that has
 * claimed several vouchers, used none, and never ordered is the shape of
 * someone farming promotions. It is a prompt to look, never grounds to block --
 * the operator decides, and real anomaly detection belongs server-side where it
 * can see across accounts rather than one at a time.
 */
export function looksSuspicious(customer: CustomerDetail): boolean {
  const hoarding = customer.voucherClaimed >= 3 && customer.voucherUsed === 0;
  return hoarding && customer.orderCount === 0;
}
