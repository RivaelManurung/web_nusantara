import { api } from "@/lib/api/client";
import type { ListParams, Paginated } from "@/types/api";

import {
  toBanner,
  type Banner,
  type BannerDto,
  type BannerInput,
} from "./types";

const BASE = "/banner";

/**
 * Endpoints for promotional banners.
 *
 * The paths follow the backend's existing convention (`/create`, `/:id/edit`,
 * `/:id/edit-status`, `/:id/delete`) rather than plain REST verbs.
 */
export const bannerApi = {
  async list(params: ListParams): Promise<Paginated<Banner>> {
    const result = await api.getPaginated<BannerDto>(BASE, {
      params: {
        page: params.page ?? 1,
        // An empty search must not become `search=`, which some handlers treat
        // as a filter for the empty string.
        ...(params.search ? { search: params.search } : {}),
      },
    });

    return {
      items: result.items.map(toBanner),
      pagination: result.pagination,
    };
  },

  async byId(id: string): Promise<Banner> {
    return toBanner(await api.get<BannerDto>(`${BASE}/${id}`));
  },

  async create(input: BannerInput): Promise<Banner> {
    const form = toFormData(input);
    // Status is settable only at creation time.
    form.append("status", input.isActive === false ? "0" : "1");
    return toBanner(await api.upload<BannerDto>(`${BASE}/create`, form));
  },

  async update(id: string, input: BannerInput): Promise<Banner> {
    return toBanner(
      await api.upload<BannerDto>(
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

function toFormData(input: BannerInput): FormData {
  const form = new FormData();
  form.append("name", input.name);
  form.append("description", input.description);
  // Only send the file when one was picked, so editing the text does not clear
  // the existing artwork.
  if (input.image) form.append("image", input.image);
  return form;
}
