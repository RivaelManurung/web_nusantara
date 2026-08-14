import { api } from "@/lib/api/client";
import type { ListParams, Paginated } from "@/types/api";

import { toShop, type Shop, type ShopDto, type ShopInput } from "./types";

const BASE = "/shop";

/**
 * Endpoints for shops.
 *
 * Writes are multipart because a shop carries a cover and a gallery; the
 * scalar relations (`cashier_ids`, `products`) therefore travel as JSON
 * strings inside the form, which is what the backend already parses.
 */
export const shopApi = {
  async list(params: ListParams): Promise<Paginated<Shop>> {
    const result = await api.getPaginated<ShopDto>(BASE, {
      params: {
        page: params.page ?? 1,
        // An empty search must not become `search=`, which some handlers treat
        // as a filter for the empty string.
        ...(params.search ? { search: params.search } : {}),
      },
    });

    return {
      items: result.items.map(toShop),
      pagination: result.pagination,
    };
  },

  async byId(id: string): Promise<Shop> {
    return toShop(await api.get<ShopDto>(`${BASE}/${id}`));
  },

  async create(input: ShopInput): Promise<Shop> {
    const form = baseFormData(input);
    // A new shop is created active; there is no inactive-on-create flow.
    form.append("status", "1");
    if (input.cover) form.append("cover", input.cover);
    for (const item of input.gallery) {
      if (item.kind === "new") form.append("gallery", item.file);
    }

    return toShop(await api.upload<ShopDto>(`${BASE}/create`, form));
  },

  async update(id: string, input: ShopInput): Promise<Shop> {
    const form = baseFormData(input);
    if (input.cover) form.append("cover", input.cover);
    await appendGalleryForUpdate(form, input);
    // Laravel-style method spoofing, kept from the old client because the
    // backend route is registered behind it.
    form.append("_method", "PUT");

    return toShop(await api.upload<ShopDto>(`${BASE}/${id}/edit`, form, "put"));
  },

  async setStatus(id: string, isActive: boolean): Promise<void> {
    await api.put(`${BASE}/${id}/edit-status`, { status: isActive ? 1 : 0 });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}/delete`);
  },
};

function baseFormData(input: ShopInput): FormData {
  const form = new FormData();
  form.append("name", input.name);
  form.append("description", input.description);
  form.append("full_address", input.fullAddress);
  form.append("lat", String(input.lat));
  // The API spells longitude `lang`.
  form.append("lang", String(input.lng));
  form.append("cashier_ids", JSON.stringify(input.cashierIds));
  form.append(
    "products",
    JSON.stringify(
      input.products.map((product) => ({
        product_id: product.productId,
        stock: product.stock,
        // An absent price means the shop inherits the catalogue price, so an
        // empty field must not be sent as null.
        ...(product.price != null ? { price: product.price } : {}),
        status: product.isActive ? 1 : 0,
      })),
    ),
  );
  return form;
}

/**
 * Gallery handling on edit.
 *
 * The backend has two modes: appending files, or replacing the whole gallery.
 * Removing an image is only expressible as a replace, which means the images
 * the user kept have to be re-uploaded -- so they are fetched back as blobs
 * first. Appending alone avoids that round trip, so it is preferred whenever
 * nothing was removed.
 */
async function appendGalleryForUpdate(
  form: FormData,
  input: ShopInput,
): Promise<void> {
  const newItems = input.gallery.filter((item) => item.kind === "new");

  if (!input.hasRemovedGallery) {
    for (const item of newItems) form.append("gallery", item.file);
    return;
  }

  form.append("replace_gallery", "true");
  for (const item of input.gallery) {
    if (item.kind === "new") {
      form.append("gallery", item.file);
      continue;
    }
    const blob = await fetchAsBlob(item.url);
    form.append("gallery", blob, fileNameFrom(item.url));
  }
}

async function fetchAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Gagal mengunduh ulang gambar galeri: ${url}`);
  }
  return response.blob();
}

function fileNameFrom(url: string): string {
  return url.substring(url.lastIndexOf("/") + 1) || "gallery-image";
}
