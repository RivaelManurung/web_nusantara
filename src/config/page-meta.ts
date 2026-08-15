import { ROUTES } from "./routes";

/**
 * The title shown in the top bar, per route.
 *
 * Titles live here rather than being passed by each page, because the bar that
 * renders them sits in the shell, above every page. `noun` is the singular form
 * used to build child-route titles ("Tambah Produk", "Ubah Produk"), so adding
 * a create screen needs no new entry.
 */
interface PageMeta {
  title: string;
  noun?: string;
}

const PAGES: Record<string, PageMeta> = {
  [ROUTES.dashboard]: { title: "Dasbor" },
  [ROUTES.productTypes]: { title: "Tipe Produk", noun: "Tipe Produk" },
  [ROUTES.products]: { title: "Produk", noun: "Produk" },
  [ROUTES.shopProducts]: { title: "Produk Toko" },
  [ROUTES.storeManagement]: { title: "Manajemen Toko", noun: "Toko" },
  [ROUTES.cashierManagement]: { title: "Manajemen Kasir", noun: "Kasir" },
  [ROUTES.customerReviews]: { title: "Ulasan Pelanggan" },
  [ROUTES.customers]: { title: "Pelanggan" },
  [ROUTES.orders]: { title: "Pesanan" },
  [ROUTES.finance]: { title: "Keuangan" },
  [ROUTES.banners]: { title: "Banner", noun: "Banner" },
  [ROUTES.events]: { title: "Event", noun: "Event" },
  [ROUTES.vouchers]: { title: "Voucher", noun: "Voucher" },
  [ROUTES.notifications]: { title: "Notifikasi" },
  [ROUTES.transactionReports]: { title: "Laporan Transaksi" },
  [ROUTES.financialReports]: { title: "Laporan Keuangan" },
  [ROUTES.shopProfile]: { title: "Profil Toko" },
  [ROUTES.settings]: { title: "Pengaturan Akun" },
  [ROUTES.unassignedShop]: { title: "Belum Ada Toko" },
};

/** The nearest ancestor route that declares a title. */
function parentOf(pathname: string): { route: string; meta: PageMeta } | null {
  let best: { route: string; meta: PageMeta } | null = null;

  for (const [route, meta] of Object.entries(PAGES)) {
    if (
      pathname.startsWith(`${route}/`) &&
      route.length > (best?.route.length ?? -1)
    ) {
      best = { route, meta };
    }
  }

  return best;
}

/** Title for the top bar. Child routes derive theirs from the parent. */
export function pageTitleFor(pathname: string): string {
  const exact = PAGES[pathname];
  if (exact) return exact.title;

  const parent = parentOf(pathname);
  if (!parent) return "Nusantara";

  const noun = parent.meta.noun ?? parent.meta.title;
  if (pathname.endsWith("/new")) return `Tambah ${noun}`;
  if (pathname.endsWith("/edit")) return `Ubah ${noun}`;

  return parent.meta.title;
}

/** The list route a create/edit screen should return to, if any. */
export function parentRouteFor(pathname: string): string | null {
  return parentOf(pathname)?.route ?? null;
}
