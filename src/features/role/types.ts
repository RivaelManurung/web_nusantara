/** A role as the API returns it. */
export interface RoleDto {
  id: string;
  name: string;
}

/** The shape the UI works with. Roles carry no status and no image. */
export interface Role {
  id: string;
  name: string;
}

export function toRole(dto: RoleDto): Role {
  return { id: dto.id, name: dto.name };
}

/** One entry of the permission catalogue, as the API returns it. */
export interface PermissionDto {
  id: string;
  code: string;
  label: string;
  /** The heading the matrix renders this permission under. */
  group: string;
}

export interface Permission {
  id: string;
  code: string;
  label: string;
  group: string;
}

export function toPermission(dto: PermissionDto): Permission {
  return { id: dto.id, code: dto.code, label: dto.label, group: dto.group };
}

/** A role's assignment, as the API returns it. */
export interface RolePermissionsDto {
  role_id: string;
  role_name: string;
  permission_codes: string[];
}

export interface RolePermissions {
  roleId: string;
  roleName: string;
  codes: string[];
}

export function toRolePermissions(dto: RolePermissionsDto): RolePermissions {
  return {
    roleId: dto.role_id,
    roleName: dto.role_name,
    // A role with nothing granted answers with an empty list; guard against the
    // key being omitted entirely so the matrix never reads `undefined`.
    codes: dto.permission_codes ?? [],
  };
}

export interface RoleInput {
  name: string;
}

/** The catalogue, arranged the way the matrix renders it. */
export interface PermissionGroup {
  label: string;
  permissions: Permission[];
}

/**
 * Groups the flat catalogue by its `group` field, preserving the order the API
 * sent — the backend already orders by group then code, so the sections keep a
 * stable position between loads instead of reshuffling on every fetch.
 */
export function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const groups: PermissionGroup[] = [];

  for (const permission of permissions) {
    const existing = groups.find((group) => group.label === permission.group);
    if (existing) {
      existing.permissions.push(permission);
    } else {
      groups.push({ label: permission.group, permissions: [permission] });
    }
  }

  return groups;
}

/**
 * The one role the backend refuses to leave short of the full catalogue.
 *
 * The endpoints that edit permissions themselves require superadmin, so a
 * superadmin stripped of them could never restore what it gave away. The UI
 * shows the matrix read-only rather than letting the user submit a change the
 * server will reject with a 409.
 */
export const SUPERADMIN_ROLE_NAME = "superadmin";

export function isSuperAdminRole(role: Pick<Role, "name">): boolean {
  return role.name.trim().toLowerCase() === SUPERADMIN_ROLE_NAME;
}
