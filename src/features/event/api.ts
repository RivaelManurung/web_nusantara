import { api } from "@/lib/api/client";
import type { ListParams, Paginated } from "@/types/api";

import {
  toAppEvent,
  type AppEvent,
  type EventDto,
  type EventInput,
} from "./types";

const BASE = "/event";

/** Endpoints for promotional events. */
export const eventApi = {
  async list(params: ListParams): Promise<Paginated<AppEvent>> {
    const result = await api.getPaginated<EventDto>(BASE, {
      params: {
        page: params.page ?? 1,
        // An empty search must not become `search=`, which some handlers treat
        // as a filter for the empty string.
        ...(params.search ? { search: params.search } : {}),
      },
    });

    return {
      items: result.items.map(toAppEvent),
      pagination: result.pagination,
    };
  },

  async byId(id: string): Promise<AppEvent> {
    return toAppEvent(await api.get<EventDto>(`${BASE}/${id}`));
  },

  async create(input: EventInput): Promise<void> {
    const form = toFormData(input, { isEditing: false });
    // A new event starts hidden, so an incomplete bundle never goes live.
    form.append("status", "0");
    await api.upload<EventDto>(`${BASE}/create`, form);
  },

  async update(id: string, input: EventInput): Promise<void> {
    await api.upload<EventDto>(
      `${BASE}/${id}/edit`,
      toFormData(input, { isEditing: true }),
      "put",
    );
  },

  async setStatus(id: string, isActive: boolean): Promise<void> {
    await api.put(`${BASE}/${id}/edit-status`, { status: isActive ? 1 : 0 });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}/delete`);
  },
};

/**
 * The backend takes the child rows as JSON strings inside a multipart body,
 * which is why they are stringified rather than sent as repeated fields.
 *
 * The cover field is also renamed on edit: creating uses `cover`, replacing
 * uses `new_cover`.
 */
function toFormData(
  input: EventInput,
  { isEditing }: { isEditing: boolean },
): FormData {
  const form = new FormData();
  form.append("name", input.name);
  form.append("type_event", input.typeEvent);
  form.append("start_date", input.startDate);
  form.append("end_date", input.endDate);

  if (input.typeEvent === "BUNDLE") {
    form.append(
      "event_bundle_buys",
      JSON.stringify(
        input.bundleBuys.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      ),
    );
    form.append(
      "event_bundle_rewards",
      JSON.stringify(
        input.bundleRewards.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      ),
    );
  } else {
    form.append(
      "event_products",
      JSON.stringify(
        input.products.map((item) => ({
          product_id: item.productId,
          discount_percent: item.discountPercent,
        })),
      ),
    );
  }

  if (input.cover) {
    form.append(isEditing ? "new_cover" : "cover", input.cover);
  }

  return form;
}
