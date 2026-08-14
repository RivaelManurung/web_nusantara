import { api } from "@/lib/api/client";
import type { ListParams, Paginated } from "@/types/api";

import {
  toTypeProduct,
  type TypeProduct,
  type TypeProductDto,
  type TypeProductInput,
} from "./types";

const BASE = "/type-product";

/**
 * Endpoints for product categories.
 *
 * The paths are the backend's existing convention (`/create`, `/:id/edit`,
 * `/:id/delete`) rather than plain REST verbs, kept as-is so this rewrite does
 * not require the API to change at the same time.
 */
export const typeProductApi = {
  async list(params: ListParams): Promise<Paginated<TypeProduct>> {
    const result = await api.getPaginated<TypeProductDto>(BASE, {
      params: {
        page: params.page ?? 1,
        // An empty search must not become `search=`, which some handlers treat
        // as a filter for the empty string.
        ...(params.search ? { search: params.search } : {}),
      },
    });

    return {
      items: result.items.map(toTypeProduct),
      pagination: result.pagination,
    };
  },

  async byId(id: string): Promise<TypeProduct> {
    return toTypeProduct(await api.get<TypeProductDto>(`${BASE}/${id}`));
  },

  async create(input: TypeProductInput): Promise<TypeProduct> {
    return toTypeProduct(
      await api.upload<TypeProductDto>(`${BASE}/create`, toFormData(input)),
    );
  },

  async update(id: string, input: TypeProductInput): Promise<TypeProduct> {
    return toTypeProduct(
      await api.upload<TypeProductDto>(
        `${BASE}/${id}/edit`,
        toFormData(input),
        "put",
      ),
    );
  },

  async setStatus(id: string, isActive: boolean): Promise<void> {
    await api.put(`${BASE}/${id}/edit-status`, { status: isActive ? 1 : 0 });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}/delete`);
  },
};

function toFormData(input: TypeProductInput): FormData {
  const form = new FormData();
  form.append("name", input.name);
  // Only send the file when one was picked, so editing a name does not clear
  // the existing image.
  if (input.image) form.append("image", input.image);
  return form;
}
