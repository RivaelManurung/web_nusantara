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
  customers: "/customers",
  orders: "/orders",
  finance: "/finance",
  banners: "/banners",
  events: "/events",
  vouchers: "/vouchers",
  notifications: "/notifications",
  // The compose screen. It needs no ROUTE_ROLES entry of its own:
  // requirementFor matches by longest prefix, so it inherits /notifications.
  notificationNew: "/notifications/new",
  transactionReports: "/transaction-reports",
  financialReports: "/financial-reports",
  roles: "/roles",
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
  // Blocking an account ends every session it holds, which is not a power an
  // admin toko needs over the whole user base. The API enforces this
  // independently through user.read / user.write; this guard only keeps the
  // link out of the wrong sidebar. The prefix match covers /customers/{id}.
  [ROUTES.customers]: ["superadmin"],
  // The API guards /order by the order.read and order.write permissions rather
  // than by role, and a superadmin holds every code -- so locking the screen to
  // "admin" alone would hide from the one account that can definitely use it.
  // The prefix match in requirementFor covers /orders/{id} too.
  [ROUTES.orders]: ["superadmin", "admin"],
  [ROUTES.finance]: ["admin"],
  [ROUTES.banners]: ["superadmin"],
  [ROUTES.events]: ["superadmin"],
  [ROUTES.vouchers]: ["superadmin"],
  // Sending a notification writes into every customer's inbox and can wake
  // their phone, so it sits with the other superadmin-only promotion screens.
  // The API enforces this independently through the notification.write
  // permission; this guard only keeps the link out of the wrong sidebar.
  [ROUTES.notifications]: ["superadmin"],
  [ROUTES.transactionReports]: ["superadmin"],
  [ROUTES.financialReports]: ["superadmin"],
  // Roles and their permissions decide what every other guard here allows, so
  // the screen that edits them is superadmin-only -- matching the backend,
  // which requires superadmin on all three permission endpoints.
  [ROUTES.roles]: ["superadmin"],
  // The shop-scoped screens mirror the API's staff group exactly: shop/routes.go
  // opens /cashier/shop-names, /cashier/shop-cashier/{id} and
  // /cashier/cashier-shop-product/{id} -- the only three endpoints these two
  // pages call -- to superadmin, admin AND cashier.
  //
  // Listing "admin" alone here locked cashiers out of the whole app: they fail
  // canAccess(/dashboard), so landingRouteFor sends them to /shop-profile, which
  // then rejected them too and bounced them to /403 with nowhere left to go.
  // Any route landingRouteFor can return must admit every role it can send.
  [ROUTES.shopProfile]: ["superadmin", "admin", "cashier"],
  [ROUTES.unassignedShop]: ["superadmin", "admin", "cashier"],
};

/**
 * The role requirement that governs `path`, inherited from its nearest parent.
 *
 * Exact-match lookup was enough while every route was a leaf. Child routes such
 * as /products/new would find no entry and fall through to "no requirement" --
 * meaning a cashier could open the product create form even though /products
 * itself is restricted. The longest matching prefix wins, so a child is at
 * least as protected as its parent.
 */
function requirementFor(path: string): Role[] | undefined {
  let matched: Role[] | undefined;
  let matchedLength = -1;

  for (const [route, roles] of Object.entries(ROUTE_ROLES)) {
    if (!roles) continue;
    const isSelfOrChild = path === route || path.startsWith(`${route}/`);
    if (isSelfOrChild && route.length > matchedLength) {
      matched = roles;
      matchedLength = route.length;
    }
  }

  return matched;
}

/** Whether `role` may open `path`. */
export function canAccess(path: string, role: Role | undefined): boolean {
  const required = requirementFor(path);
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
