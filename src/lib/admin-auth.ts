import { getStaffByEmail, getStaffById, type StaffPermission } from "@/lib/staff";

// Placeholder auth until a real backend exists: passwords are never
// verified here (any password is accepted). What IS real: if the entered
// email matches a staff record, the session takes on that staff member's
// identity and permissions; any other email is treated as the Owner
// (full access) — this keeps today's "any credentials work" testing
// convenience while making permission gating genuinely testable.
export interface AdminSession {
  role: "owner" | "staff";
  staffId?: string;
  email: string;
  name: string;
}

const SESSION_KEY = "delight-boutique-admin-session";

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}

export function isOwner(): boolean {
  return getAdminSession()?.role === "owner";
}

export function adminSignIn(email: string): { ok: true } | { ok: false; error: string } {
  const staffMember = getStaffByEmail(email);

  if (staffMember) {
    if (!staffMember.active) {
      return { ok: false, error: "This staff account has been deactivated. Contact the owner." };
    }
    const session: AdminSession = {
      role: "staff",
      staffId: staffMember.id,
      email: staffMember.email,
      name: staffMember.name,
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Session just won't persist across reloads if storage is blocked.
    }
    return { ok: true };
  }

  const session: AdminSession = { role: "owner", email, name: "Owner" };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Session just won't persist across reloads if storage is blocked.
  }
  return { ok: true };
}

/** Keeps the active session's cached name/email in sync after a self-service profile edit. */
export function updateSessionIdentity(updates: Partial<Pick<AdminSession, "name" | "email">>) {
  const session = getAdminSession();
  if (!session) return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, ...updates }));
  } catch {
    // Session just won't reflect the change until next login if storage is blocked.
  }
}

export function adminSignOut() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clean up if storage is already unavailable.
  }
}

/** Owner can do everything; a staff member only what they've been granted. */
export function hasPermission(permission: StaffPermission): boolean {
  const session = getAdminSession();
  if (!session) return false;
  if (session.role === "owner") return true;

  const staffMember = session.staffId ? getStaffById(session.staffId) : undefined;
  return staffMember?.permissions.includes(permission) ?? false;
}

/** Staff & Permissions itself is owner-only — staff can't manage other staff. */
export function getRequiredPermission(pathname: string): StaffPermission | "owner" | null {
  if (pathname.startsWith("/admin/staff")) return "owner";
  if (pathname.startsWith("/admin/products") || pathname.startsWith("/admin/categories")) {
    return "Manage Products";
  }
  if (pathname.startsWith("/admin/orders") || pathname.startsWith("/admin/notifications")) {
    return "Manage Orders";
  }
  if (pathname.startsWith("/admin/customers")) return "Manage Customers";
  if (pathname.startsWith("/admin/content")) return "Manage Content";
  return null;
}

export function canAccess(pathname: string): boolean {
  const required = getRequiredPermission(pathname);
  if (required === null) return true;
  if (required === "owner") return isOwner();
  return hasPermission(required);
}
