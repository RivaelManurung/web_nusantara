import { api } from "@/lib/api/client";
import type { ListParams, Paginated } from "@/types/api";

import {
  toProduct,
  type Product,
  type ProductDto,
  type ProductInput,
} from "./types";

const BASE = "/product";

/**
 * Endpoints for the product catalogue.
 *
 * The paths follow the backend's existing convention (`/create`, `/:id/edit`,
 * `/:id/delete`) rather than plain REST verbs. Create and update are multipart
 * because both carry a cover image and a gallery.
 */
export const productApi = {
  async list(params: ListParams): Promise<Paginated<Product>> {
    const result = await api.getPaginated<ProductDto>(BASE, {
      params: {
        page: params.page ?? 1,
        // An empty search must not become `search=`, which some handlers treat
        // as a filter for the empty string.
        ...(params.search ? { search: params.search } : {}),
      },
    });

    return {
      items: result.items.map(toProduct),
      pagination: result.pagination,
    };
  },

  async byId(id: string): Promise<Product> {
    return toProduct(await api.get<ProductDto>(`${BASE}/${id}`));
  },

  async create(input: ProductInput): Promise<Product> {
    const form = baseFormData(input);
    // New products start active; the list screen toggles them afterwards.
    form.append("status", "1");
    if (input.cover) form.append("cover", input.cover);

    for (const item of input.gallery) {
      if (item.kind === "new") form.append("gallery", item.file);
    }

    return toProduct(await api.upload<ProductDto>(`${BASE}/create`, form));
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    const form = baseFormData(input);
    // A replacement cover goes under a different key than on create.
    if (input.cover) form.append("new_cover", input.cover);
    await appendGalleryForUpdate(form, input);

    return toProduct(
      await api.upload<ProductDto>(`${BASE}/${id}/edit`, form, "put"),
    );
  },

  async setStatus(id: string, isActive: boolean): Promise<void> {
    await api.put(`${BASE}/${id}/edit-status`, { status: isActive ? 1 : 0 });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}/delete`);
  },
};

function baseFormData(input: ProductInput): FormData {
  const form = new FormData();
  form.append("name", input.name);
  form.append("code", input.code);
  form.append("price", String(input.price));
  form.append("unit", input.unit);
  form.append("description", input.description);
  form.append("type_product_id", input.typeProductId);
  return form;
}

/**
 * The update handler only understands "keep the gallery as it is" or "here is
 * the whole gallery again": there is no endpoint that removes a single image.
 * So an edit that touches the gallery has to re-send the images the user kept,
 * downloaded back from their URLs, alongside the newly picked files.
 */
async function appendGalleryForUpdate(
  form: FormData,
  input: ProductInput,
): Promise<void> {
  if (!input.galleryChanged) {
    form.append("replace_gallery", "false");
    return;
  }

  form.append("replace_gallery", "true");
  for (const item of input.gallery) {
    if (item.kind === "new") {
      form.append("new_gallery", item.file);
      continue;
    }
    const file = await fileFromUrl(item.url);
    if (file) form.append("new_gallery", file, file.name);
  }
}

/** Downloads a stored image so it can be re-uploaded. */
async function fileFromUrl(url: string): Promise<File | null> {
  try {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) return null;
    const blob = await response.blob();
    const name = url.substring(url.lastIndexOf("/") + 1) || "image";
    return new File([blob], name, { type: blob.type });
  } catch {
    // A gallery image the browser cannot fetch back (CORS, expired CDN link)
    // is dropped rather than failing the whole save.
    return null;
  }
}
