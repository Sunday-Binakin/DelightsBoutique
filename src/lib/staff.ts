import { seedStaff } from "@/lib/data/staff";

export const STAFF_PERMISSIONS = [
  "Manage Products",
  "Manage Orders",
  "Manage Customers",
  "Manage Content",
] as const;

export type StaffPermission = (typeof STAFF_PERMISSIONS)[number];

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  permissions: StaffPermission[];
  active: boolean;
  createdAt: string;
  /** Placeholder only — login doesn't verify this yet, see admin-auth.ts. */
  password: string;
}

const STORAGE_KEY = "delight-boutique-staff";

function readAll(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedStaff;
  } catch {
    return seedStaff;
  }
}

function writeAll(staff: StaffMember[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
  } catch {
    // Storage may be full or blocked — the change still applies for this session.
  }
}

function generateId() {
  return `staff-${Date.now().toString(36)}`;
}

export function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

export function getAllStaff(): StaffMember[] {
  return readAll();
}

export function getStaffById(id: string): StaffMember | undefined {
  return readAll().find((s) => s.id === id);
}

export function getStaffByEmail(email: string): StaffMember | undefined {
  const target = email.trim().toLowerCase();
  return readAll().find((s) => s.email.toLowerCase() === target);
}

export function createStaff(input: {
  name: string;
  email: string;
  phone?: string;
  permissions: StaffPermission[];
}): { member: StaffMember; password: string } {
  const password = generatePassword();
  const member: StaffMember = {
    id: generateId(),
    ...input,
    active: true,
    createdAt: new Date().toISOString(),
    password,
  };
  writeAll([...readAll(), member]);
  return { member, password };
}

export function updateStaff(id: string, updates: Partial<StaffMember>): StaffMember | undefined {
  const all = readAll();
  const index = all.findIndex((s) => s.id === id);
  if (index === -1) return undefined;

  const updated = { ...all[index], ...updates };
  const next = [...all];
  next[index] = updated;
  writeAll(next);
  return updated;
}

export function resetStaffPassword(id: string): string | undefined {
  const password = generatePassword();
  const updated = updateStaff(id, { password });
  return updated ? password : undefined;
}
