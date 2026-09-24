"use client";

import { useState, type FormEvent } from "react";
import {
  STAFF_PERMISSIONS,
  createStaff,
  getStaffByEmail,
  type StaffMember,
  type StaffPermission,
} from "@/lib/staff";
import { logAction } from "@/lib/audit-log";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { Button, LinkButton } from "@/components/ui/Button";

const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

export default function AdminNewStaffPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [permissions, setPermissions] = useState<StaffPermission[]>([]);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ member: StaffMember; password: string } | null>(null);

  function togglePermission(permission: StaffPermission) {
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (getStaffByEmail(email)) {
      setError("A staff member with this email already exists.");
      return;
    }

    const result = createStaff({ name, email, phone: phone || undefined, permissions });
    logAction(`Added staff member "${name}"`);
    setCreated(result);
  }

  if (created) {
    return (
      <div>
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin/dashboard" },
            { label: "Staff & Permissions", href: "/admin/staff" },
            { label: "Add Staff" },
          ]}
        />
        <h1 className="font-serif text-2xl font-semibold text-foreground">Staff Member Added</h1>
        <div className="mt-6 max-w-md rounded-xl border border-border-subtle p-5">
          <p className="text-sm text-foreground">
            <strong>{created.member.name}</strong> can sign in with:
          </p>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-foreground">{created.member.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Temporary Password</dt>
              <dd className="font-semibold text-foreground">{created.password}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Share this password with them directly — it won&apos;t be shown again. Passwords
            aren&apos;t verified at sign-in yet (that comes with real backend auth), but their
            permissions are enforced as soon as they sign in with this email.
          </p>
        </div>
        <LinkButton href="/admin/staff" className="mt-6">
          Done
        </LinkButton>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Staff & Permissions", href: "/admin/staff" },
          { label: "Add Staff" },
        ]}
      />

      <h1 className="font-serif text-2xl font-semibold text-foreground">Add Staff</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        They&apos;ll only see and be able to use the sections you grant below.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <label className={labelClasses}>
          Full Name
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
        </label>

        <label className={labelClasses}>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            placeholder="staff@delightsboutique.com"
          />
        </label>

        <label className={labelClasses}>
          Phone (optional)
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
        </label>

        <div>
          <p className="text-sm font-medium text-foreground">Permissions</p>
          <div className="mt-2 flex flex-col gap-2">
            {STAFF_PERMISSIONS.map((permission) => (
              <label
                key={permission}
                className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2 text-sm"
              >
                {permission}
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            ))}
          </div>
        </div>

        <Button type="submit">Add Staff</Button>
      </form>
    </div>
  );
}
