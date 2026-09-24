"use client";

import { useState } from "react";
import { getAllStaff, type StaffMember } from "@/lib/staff";
import { getAuditLog } from "@/lib/audit-log";
import { Tabs } from "@/components/ui/Tabs";
import { StaffPreview } from "@/components/admin/StaffPreview";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { LinkButton } from "@/components/ui/Button";

const ALL = "all";
const ACTIVE = "active";
const DEACTIVATED = "deactivated";

const TAB_STAFF = "Staff Accounts";
const TAB_AUDIT = "Audit Trail";

function StaffTable({
  staff,
  selectedId,
  onSelect,
}: {
  staff: StaffMember[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (staff.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-muted-foreground">
        No staff members here yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border-subtle bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Staff Member</th>
            <th className="px-4 py-3">Permissions</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr
              key={member.id}
              onClick={() => onSelect(member.id)}
              className={`cursor-pointer border-b border-border-subtle last:border-0 hover:bg-muted/60 ${
                selectedId === member.id ? "bg-muted" : ""
              }`}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <p className="text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </td>
              <td className="px-4 py-3">
                {member.permissions.length === 0 ? (
                  <span className="text-muted-foreground">None</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {member.permissions.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground/80"
                      >
                        {p.replace("Manage ", "")}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                    member.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
                  }`}
                >
                  {member.active ? "Active" : "Deactivated"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditTrailSection() {
  const entries = getAuditLog();

  if (entries.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-muted-foreground">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border-subtle bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Who</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-border-subtle last:border-0">
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {new Date(entry.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">
                {entry.actor}
              </td>
              <td className="px-4 py-3">{entry.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminStaffPage() {
  const [tab, setTab] = useState(TAB_STAFF);
  const [staff, setStaff] = useState<StaffMember[]>(() => getAllStaff());
  const [filter, setFilter] = useState<string>(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function refresh() {
    setStaff(getAllStaff());
  }

  function selectFilter(value: string) {
    setFilter(value);
    setSelectedId(null);
  }

  const activeCount = staff.filter((s) => s.active).length;
  const inFilter =
    filter === ACTIVE
      ? staff.filter((s) => s.active)
      : filter === DEACTIVATED
        ? staff.filter((s) => !s.active)
        : staff;

  const selectedStaff = staff.find((s) => s.id === selectedId) ?? null;

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: "Staff & Permissions" }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Staff & Permissions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create staff accounts and control what each one can do.
          </p>
        </div>
        <LinkButton href="/admin/staff/new">+ Add Staff</LinkButton>
      </div>

      <div className="mt-6">
        <Tabs tabs={[TAB_STAFF, TAB_AUDIT]} active={tab} onChange={setTab} />
      </div>

      {tab === TAB_AUDIT ? (
        <AuditTrailSection />
      ) : staff.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border-subtle py-20 text-center text-sm text-muted-foreground">
          No staff accounts yet — add one to grant limited access to the admin panel.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[180px_1fr_340px]">
          <aside className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => selectFilter(ALL)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                filter === ALL ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              All Staff
              <span className={filter === ALL ? "text-white/80" : "text-muted-foreground"}>
                {staff.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => selectFilter(ACTIVE)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                filter === ACTIVE ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              Active
              <span className={filter === ACTIVE ? "text-white/80" : "text-muted-foreground"}>
                {activeCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => selectFilter(DEACTIVATED)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                filter === DEACTIVATED ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              Deactivated
              <span className={filter === DEACTIVATED ? "text-white/80" : "text-muted-foreground"}>
                {staff.length - activeCount}
              </span>
            </button>
          </aside>

          <div>
            <StaffTable staff={inFilter} selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          <StaffPreview staff={selectedStaff} onUpdate={refresh} />
        </div>
      )}
    </div>
  );
}
