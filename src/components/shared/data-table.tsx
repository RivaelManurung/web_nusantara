"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  /** Shown when the request succeeded but returned nothing. */
  emptyMessage?: string;
  /** Rows of skeleton to show while loading, matching the usual page size. */
  skeletonRows?: number;
  /**
   * Where clicking a row leads. Returning undefined leaves that row inert,
   * which is how a table without detail pages keeps working unchanged.
   *
   * This is a MOUSE CONVENIENCE ONLY. The keyboard and screen-reader path is a
   * real link inside the row's primary cell -- see the note on the component.
   */
  rowHref?: (row: TData) => string | undefined;
}

/**
 * One table for every list screen.
 *
 * The Vue app repeated a hand-written `<table>` in each feature page, so
 * loading and empty states were inconsistent -- some showed a spinner, some
 * showed nothing at all.
 *
 * On `rowHref`: the row carries a click handler and nothing else. An earlier
 * version also put `role="link"`, `tabIndex` and a key handler on the `<tr>`,
 * which reads well until you try it with a screen reader: `role="link"`
 * REPLACES the implicit `role="row"`, detaching the row from the table's
 * accessibility tree and costing every row its row/column context. The
 * accessible path is a real `<Link>` in the row's primary cell, which also
 * gives each row a meaningful name instead of one generic label repeated down
 * the page.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  emptyMessage = "Belum ada data.",
  skeletonRows = 5,
  rowHref,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  /**
   * Rows carry switches and action menus. A click that started on one of those
   * is theirs, not the row's -- without this check, toggling a status would
   * also navigate away from the page you were toggling on.
   */
  function isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest(
        'a, button, input, select, textarea, [role="switch"], [role="checkbox"], [role="menu"], [data-no-row-nav]',
      ),
    );
  }

  function openRow(row: Row<TData>, event: { target: EventTarget | null }) {
    const href = rowHref?.(row.original);
    if (!href || isInteractiveTarget(event.target)) return;

    // A click that is really a text selection should not navigate.
    if (window.getSelection()?.toString()) return;

    router.push(href);
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((_column, cellIndex) => (
                  <TableCell key={`skeleton-cell-${cellIndex}`}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground h-32 text-center"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => {
              const href = rowHref?.(row.original);

              return (
                <TableRow
                  key={row.id}
                  // Click only. The row keeps its implicit role="row"; the
                  // keyboard and screen-reader path is the link in the primary
                  // cell.
                  {...(href
                    ? {
                        onClick: (event: React.MouseEvent) =>
                          openRow(row, event),
                      }
                    : {})}
                  className={cn(
                    href &&
                      "hover:bg-accent/60 cursor-pointer transition-colors duration-150 ease-out",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
