import { NextResponse, type NextRequest } from "next/server";

import { PUBLIC_ROUTES, ROUTES } from "@/config/routes";

/**
 * Keeps anonymous visitors out of the dashboard before any of it renders.
 *
 * Next 16 renamed this convention from `middleware` to `proxy`.
 *
 * It reads a marker cookie only. The access token stays in localStorage and is
 * never sent here, so this layer can tell "signed in or not" but not who --
 * role checks belong to RouteGuard, which has the profile.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("nusantara.session");

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (hasSession && pathname === ROUTES.login) {
      return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    const login = new URL(ROUTES.login, request.url);
    // Remember where they were headed so sign-in can return them there.
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next's own assets and the favicon.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
