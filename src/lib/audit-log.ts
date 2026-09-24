import { getAdminSession } from "@/lib/admin-auth";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
}

const STORAGE_KEY = "delight-boutique-audit-log";
const MAX_ENTRIES = 200;

function readAll(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: AuditEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage may be full or blocked — the action still happened, just unlogged.
  }
}

/** Records who did what, most recent first. Called from the admin mutation points. */
export function logAction(action: string) {
  const session = getAdminSession();
  const entry: AuditEntry = {
    id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    actor: session?.name ?? "Unknown",
    action,
  };
  writeAll([entry, ...readAll()].slice(0, MAX_ENTRIES));
}

export function getAuditLog(): AuditEntry[] {
  return readAll();
}
