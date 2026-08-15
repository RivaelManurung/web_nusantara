"use client";

import { RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";

import { useCustomerRoles, useCustomers } from "../queries";
import {
  EMPTY_CUSTOMER_FILTERS,
  roleLabel,
  type CustomerFilters as Filters,
  type CustomerSummary,
} from "../types";
import { useCustomerColumns } from "./customer-table";

/** The Select cannot hold an empty string, so "no filter" needs a sentinel. */
const ALL = "all";

/**
 * "Pelanggan": every account, and the way into moderating one.
 *
 * The role filter's options come from the API rather than a constant here, so
 * adding a role on the permission screen does not leave this filter unable to
 * find its holders.
 */
export function CustomerPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_CUSTOMER_FILTERS);
  const [page, setPage] = useState(1);

  const changeFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((previous) => ({ ...previous, ...patch }));
    setPage(1);
  }, []);

  const query = useCustomers(filters, page);
  const rolesQuery = useCustomerRoles();

  const detailHref = useCallback(
    (row: CustomerSummary) => `${ROUTES.customers}/${row.id}`,
    [],
  );
  const columns = useCustomerColumns({ detailHref });

  const hasFilters =
    filters.search !== "" || filters.role !== "" || filters.status !== "";

  return (
    <div className="space-y-6">
      <PageHeader description="Semua akun terdaftar, beserta riwayat belanja dan status aksesnya." />

      <Card>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="customer-search">Cari</Label>
              <SearchInput
                value={filters.search}
                onChange={(value) => changeFilters({ search: value })}
                placeholder="Nama, email, telepon…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-role">Role</Label>
              <Select
                value={filters.role === "" ? ALL : filters.role}
                onValueChange={(next) =>
                  changeFilters({ role: next === ALL ? "" : String(next) })
                }
              >
                <SelectTrigger id="customer-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua role</SelectItem>
                  {(rolesQuery.data ?? []).map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-status">Status</Label>
              <Select
                value={filters.status === "" ? ALL : filters.status}
                onValueChange={(next) =>
                  changeFilters({ status: next === ALL ? "" : String(next) })
                }
              >
                <SelectTrigger id="customer-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua status</SelectItem>
                  <SelectItem value="1">Aktif</SelectItem>
                  <SelectItem value="0">Diblokir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasFilters}
                onClick={() => {
                  setFilters(EMPTY_CUSTOMER_FILTERS);
                  setPage(1);
                }}
              >
                <RotateCcw className="size-4" aria-hidden />
                Atur ulang
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {query.error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {query.error instanceof ApiError
              ? query.error.message
              : "Gagal memuat daftar akun."}
          </AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        data={query.data?.items ?? []}
        isLoading={query.isLoading}
        emptyMessage="Tidak ada akun yang cocok dengan filter ini."
        rowHref={detailHref}
      />

      {query.data ? (
        <Pagination
          pagination={query.data.pagination}
          onPageChange={setPage}
          isLoading={query.isFetching}
        />
      ) : null}
    </div>
  );
}
