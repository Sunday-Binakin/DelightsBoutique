"use client";

import { useState } from "react";
import {
  STAFF_PERMISSIONS,
  resetStaffPassword,
  updateStaff,
  type StaffMember,
  type StaffPermission,
} from "@/lib/staff";
import { logAction } from "@/lib/audit-log";
import { Button } from "@/components/ui/Button";

interface StaffPreviewProps {
  staff: StaffMember | null;
  onUpdate: () => void;
}

export function StaffPreview({ staff, onUpdate }: StaffPreviewProps) {
  const [newPassword, setNewPassword] = useState<string | null>(null);

  if (!staff) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
        <p className="text-sm text-muted-foreground">Select a staff member to view them here.</p>
      </div>
    );
  }

  const staffId = staff.id;
  const staffName = staff.name;

  function togglePermission(permission: StaffPermission) {
    const next = staff!.permissions.includes(permission)
      ? staff!.permissions.filter((p) => p !== permission)
      : [...staff!.permissions, permission];
    updateStaff(staffId, { permissions: next });
    logAction(`Updated permissions for "${staffName}"`);
    onUpdate();
  }

  function handleToggleActive() {
    const nextActive = !staff!.active;
    updateStaff(staffId, { active: nextActive });
    logAction(`${nextActive ? "Reactivated" : "Deactivated"} staff member "${staffName}"`);
    onUpdate();
  }

  function handleResetPassword() {
    const password = resetStaffPassword(staffId);
    if (password) {
      logAction(`Reset password for "${staffName}"`);
      setNewPassword(password);
    }
  }

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg font-semibold text-foreground">{staff.name}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            staff.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
          }`}
        >
          {staff.active ? "Active" : "Deactivated"}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{staff.email}</p>
      {staff.phone && <p className="text-sm text-muted-foreground">{staff.phone}</p>}

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Permissions
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {STAFF_PERMISSIONS.map((permission) => (
            <label
              key={permission}
              className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2 text-sm"
            >
              {permission}
              <input
                type="checkbox"
                checked={staff.permissions.includes(permission)}
                onChange={() => togglePermission(permission)}
                className="h-4 w-4 accent-primary"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <Button
          variant={staff.active ? "danger" : "primary"}
          className="flex-1"
          onClick={handleToggleActive}
        >
          {staff.active ? "Deactivate" : "Reactivate"}
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleResetPassword}>
          Reset Password
        </Button>
      </div>

      {newPassword && (
        <div className="mt-3 rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
          New temporary password: <strong>{newPassword}</strong> — share this with {staff.name}
          directly. It won&apos;t be shown again.
        </div>
      )}
    </div>
  );
}
