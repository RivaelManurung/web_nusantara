import {
  BadgePercent,
  Banknote,
  CalendarRange,
  ClipboardList,
  Images,
  LayoutDashboard,
  MessageSquareText,
  Package,
  ReceiptText,
  Settings,
  ShieldCheck,
  Store,
  Tags,
  TrendingUp,
  UsersRound,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "./routes";
import type { Role } from "@/types/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * The sidebar, in one place.
 *
 * Visibility is derived from ROUTE_ROLES rather than repeated here, so a link
 * can never appear for a role the route itself rejects -- which is how a
 * sidebar ends up offering pages that immediately bounce to 403.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Utama",
    items: [
      { label: "Dasbor", href: ROUTES.dashboard, icon: LayoutDashboard },
      { label: "Tipe Produk", href: ROUTES.productTypes, icon: Tags },
      { label: "Produk", href: ROUTES.products, icon: Package },
      { label: "Produk Toko", href: ROUTES.shopProducts, icon: Warehouse },
      { label: "Manajemen Toko", href: ROUTES.storeManagement, icon: Store },
      {
        label: "Manajemen Kasir",
        href: ROUTES.cashierManagement,
        icon: UsersRound,
      },
      {
        label: "Ulasan Pelanggan",
        href: ROUTES.customerReviews,
        icon: MessageSquareText,
      },
      { label: "Pesanan", href: ROUTES.orders, icon: ClipboardList },
      { label: "Keuangan", href: ROUTES.finance, icon: Banknote },
    ],
  },
  {
    label: "Promosi",
    items: [
      { label: "Banner", href: ROUTES.banners, icon: Images },
      { label: "Event", href: ROUTES.events, icon: CalendarRange },
      { label: "Voucher", href: ROUTES.vouchers, icon: BadgePercent },
    ],
  },
  {
    label: "Laporan",
    items: [
      {
        label: "Laporan Transaksi",
        href: ROUTES.transactionReports,
        icon: ReceiptText,
      },
      {
        label: "Laporan Keuangan",
        href: ROUTES.financialReports,
        icon: TrendingUp,
      },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { label: "Profil Toko", href: ROUTES.shopProfile, icon: Store },
      { label: "Role dan Akses", href: ROUTES.roles, icon: ShieldCheck },
      { label: "Pengaturan", href: ROUTES.settings, icon: Settings },
    ],
  },
];

/** Drops links the role cannot open, and then any group left empty. */
export function navigationFor(
  role: Role | undefined,
  canOpen: (href: string) => boolean,
): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canOpen(item.href)),
  })).filter((group) => group.items.length > 0);
}
