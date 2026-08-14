# web_nusantara

Admin panel for Nusantara Oleh-Oleh. A rewrite of `nusantara_web`
(Vue 3 + Vite + Pinia) on **Next.js 16 App Router**, **TypeScript**, and
**shadcn/ui on Base UI**.

## Requirements

- Node 20+
- The API from `service_nusantara` (or `nusantara_service`) running

## Running

```bash
cp .env.example .env.local     # then set NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | yes | API root including the version prefix, e.g. `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | no | Only the shop location picker uses it |

Missing required variables fail at module load (`src/config/env.ts`) rather than
on the first request, so a misconfigured deployment breaks the build instead of
a user's session.

## Deploying to Vercel

1. Import the repository, set **Root Directory** to `web_nusantara`.
2. Add the environment variables **before the first deploy**:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_BASE_URL` | e.g. `https://api.nusantara.example/api/v1` |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | optional |

3. Deploy.

`NEXT_PUBLIC_*` values are **inlined into the bundle at build time**, not read at
runtime. Adding or changing one therefore requires a **redeploy** — restarting
the deployment is not enough.

The build no longer fails when the API URL is missing: it succeeds, and the
sign-in screen says the app is not connected to a server. An earlier version
validated at module load, so a missing variable threw while Next was merely
*evaluating* the module during prerender — which took down `/_not-found`, a page
that never touches the API, and failed the whole build.

## Layout

```
src/
├── app/
│   ├── (auth)/login/            unauthenticated shell
│   ├── (dashboard)/             RouteGuard + AppShell, one folder per route
│   ├── 403/
│   └── layout.tsx               theme → query → session → tooltip providers
├── components/
│   ├── ui/                      shadcn primitives (generated; edit sparingly)
│   ├── shared/                  DataTable, Pagination, SearchInput, ConfirmDialog, ImageField…
│   ├── layout/                  AppShell, SidebarNav, ProfileMenu, ThemeToggle
│   ├── auth/route-guard.tsx     role enforcement
│   └── providers/
├── config/                      env, routes + roles, navigation
├── features/<feature>/          types · api · queries · components
├── hooks/, lib/, stores/, types/
└── proxy.ts                     turns anonymous visitors away before render
```

Features are vertical slices. Changing "how vouchers work" touches one folder.

## What changed from the Vue app

**The clean-architecture layers collapsed.** Each Vue feature had
`data/source` + `data/repository` + `domain/entities` + `domain/repository` +
`domain/use-case` + `presentation/store` — six layers and roughly fourteen files
to list a table. Repositories returned an Either-style `{ left, right }` that
every caller unwrapped before it could do anything.

Here that is `api.ts` (endpoints) + `queries.ts` (TanStack Query hooks).
Failures are thrown `ApiError`s; Query catches them and hands components
`data` / `isLoading` / `error`. The domain→DTO mapping that justified the layers
survives, in `types.ts`.

**Server state left the store.** Every Pinia store hand-rolled its own
`items` / `isLoading` / `error` triple plus a refetch, and they had drifted apart
— some cached, some refetched on every mount, some never invalidated after a
write. TanStack Query owns that now. Only the session and the selected shop
remain in Zustand.

**Auth follows the rewritten backend.** The Vue app stored one `auth_token` in
localStorage. The backend now issues an access/refresh pair, so the client
refreshes proactively before expiry and shares one in-flight refresh across
concurrent requests — refresh tokens are single-use, so six parallel refreshes
would log the user out.

**Route roles have one home.** Paths lived in `router/path.js` and their roles in
`router/index.js`, so adding a page meant editing two files and it was easy to
ship one with no guard. `src/config/routes.ts` holds both, and the sidebar
derives visibility from it — a link cannot appear for a role the route rejects.

**Redirects left the transport layer.** The Vue axios interceptor imported the
auth store and the router to redirect on 401. Here the client raises a callback
and `SessionProvider` decides what that means for navigation.

**Tables and dialogs are shared.** Each Vue page hand-wrote its own `<table>`, so
loading and empty states were inconsistent. One `DataTable`, one `Pagination`,
one `ConfirmDialog`.

## Adding a feature

See [PORTING.md](PORTING.md). The reference implementation is
`src/features/type-product/`.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
# web_nusantara
