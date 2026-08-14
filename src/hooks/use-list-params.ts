"use client";

import { useCallback, useState } from "react";

import type { ListParams } from "@/types/api";

/**
 * Page and search state for a list screen.
 *
 * Changing the search term resets to page one; without that, searching from
 * page four lands on an empty page and looks like "no results".
 */
export function useListParams(initial: ListParams = {}) {
  const [params, setParams] = useState<
    Required<Pick<ListParams, "page" | "search">>
  >({
    page: initial.page ?? 1,
    search: initial.search ?? "",
  });

  const setPage = useCallback((page: number) => {
    setParams((current) => ({ ...current, page: Math.max(1, page) }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams({ search, page: 1 });
  }, []);

  return { params, setPage, setSearch };
}
