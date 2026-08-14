# Porting a feature from `nusantara_web`

The reference implementation is **`src/features/type-product/`**. Copy its shape;
do not invent a second one.

## Where things go

```
src/features/<feature>/
├── types.ts                    DTO (wire shape) + domain type + `toX()` mapper
├── api.ts                      endpoint functions, returns domain types
├── queries.ts                  TanStack Query hooks (list/create/update/delete)
└── components/
    ├── <feature>-page.tsx      "use client" page body
    ├── <feature>-table.tsx     `use<Feature>Columns()` hook
    └── <feature>-form-dialog.tsx

src/app/(dashboard)/<route>/page.tsx   server component: metadata + render the page body
```

## Rules

1. **The old clean-architecture layers collapse.** `data/source` +
   `data/repository` + `domain/use-case` + `presentation/store` become `api.ts`
   + `queries.ts`. Do not recreate `IRepository`, `UseCase` classes, or the
   `left`/`right` Either wrapper — failures are thrown `ApiError`s and TanStack
   Query catches them.
2. **No Pinia-style store per feature.** Server state lives in TanStack Query.
   Only genuinely global state (session, selected shop) belongs in
   `src/stores/`.
3. **The DTO is not the view model.** The API sends `status: 0 | 1`; the UI uses
   `isActive: boolean`. Map at the boundary in `types.ts`.
4. **Endpoints keep the backend's existing convention**: `GET /x`,
   `POST /x/create`, `GET /x/:id`, `PUT /x/:id/edit`, `PUT /x/:id/edit-status`,
   `DELETE /x/:id/delete`. Creates and updates that carry a file use
   `api.upload()`.
5. **Never send an empty `search`**, which some handlers read as a filter for
   the empty string. See `typeProductApi.list`.
6. **Validate with zod + react-hook-form.** Every input needs a `<Label
   htmlFor>`, `aria-invalid`, and `aria-describedby` pointing at its error.
7. **Toasts for mutation results** (`sonner`), inline `<Alert>` for a failed
   list load. Never `alert()` or a bespoke modal store.
8. **Money and dates** go through `@/lib/format` — `formatCurrency`,
   `formatDate`, `formatDateTime`. Do not call `Intl` inline.
9. **Add the route to `src/config/routes.ts`** (`ROUTE_ROLES`) and, if it is
   navigable, to `src/config/navigation.ts`. A link is filtered out
   automatically when the role cannot open the route.
10. **Indonesian UI copy**, sentence case. Code, comments, and identifiers in
    English.

## Checklist per feature

- [ ] `types.ts` maps every field the old `*Entity.js` exposed
- [ ] `api.ts` covers every method of the old `*RemoteSource.js`
- [ ] list screen: search, pagination, loading skeleton, empty state, error state
- [ ] create + edit share one dialog, seeded via `reset()` on open
- [ ] destructive actions go through `<ConfirmDialog destructive>`
- [ ] `npx tsc --noEmit` clean, `npm run lint` clean
