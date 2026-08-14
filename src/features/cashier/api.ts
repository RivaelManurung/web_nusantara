import { api } from "@/lib/api/client";
import type { ListParams, Paginated } from "@/types/api";

import {
  toCashier,
  type Cashier,
  type CashierDto,
  type CashierInput,
} from "./types";

const BASE = "/cashier";

/**
 * Endpoints for cashier accounts.
 *
 * The paths follow the backend's existing convention (`/create`, `/:id/edit`,
 * `/:id/delete`). Note that a cashier has no `/edit-status` route: the status
 * toggle posts to the same `/edit` endpoint with only `status` filled in.
 */
export const cashierApi = {
  async list(params: ListParams): Promise<Paginated<Cashier>> {
    const result = await api.getPaginated<CashierDto>(BASE, {
      params: {
        page: params.page ?? 1,
        // An empty search must not become `search=`, which some handlers treat
        // as a filter for the empty string.
        ...(params.search ? { search: params.search } : {}),
      },
    });

    return {
      items: result.items.map(toCashier),
      pagination: result.pagination,
    };
  },

  async byId(id: string): Promise<Cashier> {
    return toCashier(await api.get<CashierDto>(`${BASE}/${id}`));
  },

  async create(input: CashierInput): Promise<Cashier> {
    const form = new FormData();
    form.append("name", input.name);
    form.append("username", input.username);
    if (input.email) form.append("email", input.email);
    if (input.password) form.append("password", input.password);
    // A new cashier is created active; there is no inactive-on-create flow.
    form.append("status", "1");
    if (input.image) form.append("image", input.image);

    return toCashier(await api.upload<CashierDto>(`${BASE}/create`, form));
  },

  async update(id: string, input: CashierInput): Promise<Cashier> {
    const form = new FormData();
    form.append("name", input.name);
    form.append("username", input.username);
    // Only send the file when one was picked, so editing a name does not clear
    // the existing photo.
    if (input.image) form.append("image", input.image);
    // Laravel-style method spoofing, kept from the old client because the
    // backend route is registered behind it.
    form.append("_method", "PUT");

    return toCashier(
      await api.upload<CashierDto>(`${BASE}/${id}/edit`, form, "put"),
    );
  },

  /**
   * Status lives on the main edit endpoint, so it must be sent as multipart
   * like every other write to that route.
   */
  async setStatus(id: string, isActive: boolean): Promise<Cashier> {
    const form = new FormData();
    form.append("status", isActive ? "1" : "0");
    form.append("_method", "PUT");

    return toCashier(
      await api.upload<CashierDto>(`${BASE}/${id}/edit`, form, "put"),
    );
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}/delete`);
  },
};
