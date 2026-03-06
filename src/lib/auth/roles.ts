export type StaffRole = 'admin' | 'staff' | 'manager';

interface UserWithRole {
  role?: string;
  roles?: string[];
}

/**
 * Returns true if the user has the given role (checks role and roles array).
 */
export function hasRole(
  user: UserWithRole | null | undefined,
  role: string
): boolean {
  if (!user) return false;
  if (user.role === role) return true;
  return Array.isArray(user.roles) && user.roles.includes(role);
}

const STAFF_ROLES: StaffRole[] = ['admin', 'staff', 'manager'];

/**
 * Returns true if the user has any staff or admin role (can access dashboard).
 */
export function hasStaffOrAdminRole(
  user: UserWithRole | null | undefined
): boolean {
  if (!user) return false;
  return STAFF_ROLES.some((r) => hasRole(user, r));
}

export interface UserWithPermissions {
  permissions?: string[];
}

/**
 * Returns true if the user has the given permission (from auth-api /me permissions array).
 */
export function hasPermission(
  user: UserWithPermissions | null | undefined,
  permission: string
): boolean {
  if (!user?.permissions || !Array.isArray(user.permissions)) return false;
  return user.permissions.includes(permission);
}
