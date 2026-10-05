import type { SessionDto, StaffPermission } from "@/lib/api/types";

export function isOwner(session: SessionDto | null | undefined): boolean {
  return session?.role === "Owner";
}

/** Owner can do everything; a staff member only what they've been granted. */
export function hasPermission(
  session: SessionDto | null | undefined,
  permission: StaffPermission,
): boolean {
  if (!session) return false;
  if (session.role === "Owner") return true;
  return session.permissions.includes(permission);
}

export function getRequiredPermission(pathname: string): StaffPermission | null {
  if (pathname.startsWith("/admin/staff")) return "manageStaff";
  if (pathname.startsWith("/admin/products") || pathname.startsWith("/admin/categories")) {
    return "manageProducts";
  }
  if (pathname.startsWith("/admin/orders") || pathname.startsWith("/admin/notifications")) {
    return "manageOrders";
  }
  if (pathname.startsWith("/admin/customers")) return "manageCustomers";
  if (pathname.startsWith("/admin/content")) return "manageContent";
  if (pathname.startsWith("/admin/reports")) return "viewReports";
  return null;
}

export function canAccess(session: SessionDto | null | undefined, pathname: string): boolean {
  if (pathname.startsWith("/admin/staff/")) return hasPermission(session, "manageStaff");
  if (pathname === "/admin/staff") {
    return hasPermission(session, "manageStaff") || hasPermission(session, "viewAuditLog");
  }
  const required = getRequiredPermission(pathname);
  if (required === null) return true;
  return hasPermission(session, required);
}
