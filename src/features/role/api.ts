import { api } from "@/lib/api/client";
import type { ListParams, Paginated } from "@/types/api";

import {
  toPermission,
  toRole,
  toRolePermissions,
  type Permission,
  type PermissionDto,
  type Role,
  type RoleDto,
  type RoleInput,
  type RolePermissions,
  type RolePermissionsDto,
} from "./types";

const BASE = "/role";
const PERMISSIONS = "/permission";

/**
 * Roles and the permissions assigned to them.
 *
 * The paths follow the backend's existing convention (`/create`, `/:id/edit`,
 * `/:id/delete`) rather than plain REST verbs. Roles carry JSON rather than
 * multipart: they have no image.
 */
export const roleApi = {
  async list(params: ListParams): Promise<Paginated<Role>> {
    const result = await api.getPaginated<RoleDto>(BASE, {
      params: {
        page: params.page ?? 1,
        // An empty search must not become `search=`, which the handler reads as
        // a filter for the empty string.
        ...(params.search ? { search: params.search } : {}),
      },
    });

    return {
      items: result.items.map(toRole),
      pagination: result.pagination,
    };
  },

  async create(input: RoleInput): Promise<Role> {
    return toRole(await api.post<RoleDto>(`${BASE}/create`, input));
  },

  async update(id: string, input: RoleInput): Promise<Role> {
    return toRole(await api.put<RoleDto>(`${BASE}/${id}/edit`, input));
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}/delete`);
  },

  /**
   * The whole permission catalogue. It is a couple of dozen rows that change
   * only on deploy, so the endpoint is not paginated.
   */
  async permissions(): Promise<Permission[]> {
    const items = await api.get<PermissionDto[]>(PERMISSIONS);
    return (items ?? []).map(toPermission);
  },

  async permissionsFor(roleId: string): Promise<RolePermissions> {
    return toRolePermissions(
      await api.get<RolePermissionsDto>(`${BASE}/${roleId}/permission`),
    );
  },

  /** Replaces the role's grants with exactly `codes`. */
  async replacePermissions(
    roleId: string,
    codes: string[],
  ): Promise<RolePermissions> {
    return toRolePermissions(
      await api.put<RolePermissionsDto>(`${BASE}/${roleId}/permission/edit`, {
        permission_codes: codes,
      }),
    );
  },
};
