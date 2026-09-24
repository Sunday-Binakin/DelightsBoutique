"use client";

import { useState, type FormEvent } from "react";
import { getAdminSession, updateSessionIdentity } from "@/lib/admin-auth";
import { getOwnerProfile, saveOwnerProfile } from "@/lib/owner-profile";
import { getStaffById, updateStaff, getAllStaff } from "@/lib/staff";
import { logAction } from "@/lib/audit-log";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { Button } from "@/components/ui/Button";

const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

interface DetailsDraft {
  name: string;
  email: string;
  phone: string;
}

export default function AdminAccountPage() {
  const [session] = useState(() => getAdminSession());
  const isOwnerRole = session?.role === "owner";

  const [details, setDetails] = useState<DetailsDraft>(() => {
    if (!session) return { name: "", email: "", phone: "" };
    if (session.role === "owner") {
      const profile = getOwnerProfile();
      return { name: profile.name, email: profile.email, phone: profile.phone ?? "" };
    }
    const staffMember = session.staffId ? getStaffById(session.staffId) : undefined;
    return {
      name: staffMember?.name ?? session.name,
      email: staffMember?.email ?? session.email,
      phone: staffMember?.phone ?? "",
    };
  });
  const [detailsSaved, setDetailsSaved] = useState(true);
  const [detailsError, setDetailsError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (!session) return null;
  const currentSession = session;

  function updateDetail<K extends keyof DetailsDraft>(key: K, value: string) {
    setDetails((prev) => ({ ...prev, [key]: value }));
    setDetailsSaved(false);
    setDetailsError("");
  }

  function handleSaveDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = details.name.trim();
    const email = details.email.trim();
    const phone = details.phone.trim() || undefined;

    if (!name || !email) {
      setDetailsError("Name and email are required.");
      return;
    }

    if (isOwnerRole) {
      saveOwnerProfile({ name, email, phone });
    } else if (currentSession.staffId) {
      const collision = getAllStaff().find(
        (s) => s.id !== currentSession.staffId && s.email.toLowerCase() === email.toLowerCase(),
      );
      if (collision) {
        setDetailsError("Another staff account already uses this email.");
        return;
      }
      updateStaff(currentSession.staffId, { name, email, phone });
    }

    updateSessionIdentity({ name, email });
    logAction("Updated their own profile details");
    setDetailsSaved(true);
  }

  function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    if (isOwnerRole) {
      saveOwnerProfile({ password: newPassword });
    } else if (currentSession.staffId) {
      updateStaff(currentSession.staffId, { password: newPassword });
    }

    logAction("Changed their own password");
    setPasswordError("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: "My Account" }]} />

      <h1 className="font-serif text-2xl font-semibold text-foreground">My Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Update your own profile details and password.
      </p>

      <div className="mt-6 grid gap-6 lg:max-w-2xl">
        <form
          onSubmit={handleSaveDetails}
          className="flex flex-col gap-4 rounded-xl border border-border-subtle p-5"
        >
          <p className="text-sm font-semibold text-foreground">Profile Details</p>
          {detailsError && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{detailsError}</p>
          )}

          <label className={labelClasses}>
            Name
            <input
              required
              value={details.name}
              onChange={(e) => updateDetail("name", e.target.value)}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            Email
            <input
              required
              type="email"
              value={details.email}
              onChange={(e) => updateDetail("email", e.target.value)}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            Phone
            <input
              value={details.phone}
              onChange={(e) => updateDetail("phone", e.target.value)}
              className={inputClasses}
              placeholder="024 000 0000"
            />
          </label>

          <Button type="submit" disabled={detailsSaved} className="self-start">
            {detailsSaved ? "Saved" : "Save Changes"}
          </Button>
        </form>

        <form
          onSubmit={handleChangePassword}
          className="flex flex-col gap-4 rounded-xl border border-border-subtle p-5"
        >
          <p className="text-sm font-semibold text-foreground">Change Password</p>
          {passwordError && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-800">
              Password updated.
            </p>
          )}

          <label className={labelClasses}>
            New Password
            <input
              required
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
                setPasswordSuccess(false);
              }}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            Confirm New Password
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError("");
                setPasswordSuccess(false);
              }}
              className={inputClasses}
            />
          </label>

          <Button type="submit" className="self-start">
            Update Password
          </Button>
          <p className="text-xs text-muted-foreground">
            There&apos;s no backend yet, so login doesn&apos;t actually check this password —
            it&apos;s stored ready for when one is connected.
          </p>
        </form>
      </div>
    </div>
  );
}
