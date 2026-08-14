import type { Role } from "@/types/auth";

/**
 * Every path in the app, and who may open it.
 *
 * The Vue app split this across router/path.js and per-route `meta.roles` in
 * router/index.js, so adding a page meant editing two files and it was easy to
 * ship one without a role guard. Here a route is its permission.
 */
export const ROUTES = {
  login: "/login",
  forbidden: "/403",
  unassignedShop: "/unassigned-shop",

  dashboard: "/dashboard",
  productTypes: "/product-types",
  products: "/products",
  shopProducts: "/shop-products",
  storeManagement: "/store-management",
  cashierManagement: "/cashier-management",
  customerReviews: "/customer-reviews",
  orders: "/orders",
  finance: "/finance",
  banners: "/banners",
  events: "/events",
  vouchers: "/vouchers",
  transactionReports: "/transaction-reports",
  financialReports: "/financial-reports",
  settings: "/settings",
  shopProfile: "/shop-profile",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Routes reachable without a session. */
export const PUBLIC_ROUTES: string[] = [ROUTES.login, ROUTES.forbidden];

/**
 * Role requirements, mirroring the Vue router's meta.roles. A path missing here
 * is open to any signed-in user.
 */
export const ROUTE_ROLES: Partial<Record<string, Role[]>> = {
  [ROUTES.dashboard]: ["superadmin", "admin"],
  [ROUTES.productTypes]: ["superadmin"],
  [ROUTES.products]: ["superadmin", "admin"],
  [ROUTES.shopProducts]: ["admin"],
  [ROUTES.storeManagement]: ["superadmin"],
  [ROUTES.cashierManagement]: ["superadmin"],
  [ROUTES.customerReviews]: ["superadmin"],
  [ROUTES.orders]: ["admin"],
  [ROUTES.finance]: ["admin"],
  [ROUTES.banners]: ["superadmin"],
  [ROUTES.events]: ["superadmin"],
  [ROUTES.vouchers]: ["superadmin"],
  [ROUTES.transactionReports]: ["superadmin"],
  [ROUTES.financialReports]: ["superadmin"],
  [ROUTES.shopProfile]: ["admin"],
  [ROUTES.unassignedShop]: ["admin"],
};

/** Whether `role` may open `path`. */
export function canAccess(path: string, role: Role | undefined): boolean {
  const required = ROUTE_ROLES[path];
  if (!required) return true;
  if (!role) return false;
  return required.includes(role);
}

/** Where to send a user after signing in, based on what their role can see. */
export function landingRouteFor(role: Role | undefined): string {
  return canAccess(ROUTES.dashboard, role)
    ? ROUTES.dashboard
    : ROUTES.shopProfile;
}
