"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession, SESSION_QUERY_KEY } from "@/lib/use-session";
import { changePassword, getProfile, updateProfile, type ProfileDto } from "@/lib/api/account";
import { describeApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";

const rowClasses = "flex justify-between gap-3 py-2.5 text-sm";
const inputClasses =
  "w-full rounded-lg border border-input-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

function ProfileForm({ profile }: { profile: ProfileDto }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const save = useMutation({
    mutationFn: () => {
      const nextPhone = phone.trim();
      return updateProfile({
        name: name.trim(),
        ...(nextPhone !== (profile.phone ?? "") ? { phone: nextPhone } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["account-profile"] });
      toast.success("Profile updated.");
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    save.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-serif text-lg font-semibold text-foreground">Profile</h2>
      <label className={labelClasses}>
        Name
        <input
          required
          disabled={save.isPending}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
        />
      </label>
      <label className={labelClasses}>
        Phone number
        <input
          required
          disabled={save.isPending}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClasses}
        />
      </label>
      {save.isError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {describeApiError(save.error, "Couldn't save your profile. Try again.")}
        </p>
      )}
      <Button type="submit" disabled={save.isPending} className="self-start">
        {save.isPending ? "Saving…" : "Save Profile"}
      </Button>
    </form>
  );
}

function PasswordForm() {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const change = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed.");
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    change.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-serif text-lg font-semibold text-foreground">Change Password</h2>
      <label className={labelClasses}>
        Current password
        <input
          type="password"
          required
          autoComplete="current-password"
          disabled={change.isPending}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={inputClasses}
        />
      </label>
      <label className={labelClasses}>
        New password (at least 8 characters)
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={change.isPending}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClasses}
        />
      </label>
      <label className={labelClasses}>
        Confirm new password
        <input
          type="password"
          required
          autoComplete="new-password"
          disabled={change.isPending}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClasses}
        />
      </label>
      {mismatch && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          The new passwords don&apos;t match.
        </p>
      )}
      {change.isError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {describeApiError(change.error, "Couldn't change your password. Check the current one.")}
        </p>
      )}
      <Button type="submit" disabled={change.isPending} className="self-start">
        {change.isPending ? "Changing…" : "Change Password"}
      </Button>
    </form>
  );
}

export default function AdminAccountPage() {
  const { data: session, isLoading } = useSession();
  const profile = useQuery({ queryKey: ["account-profile"], queryFn: getProfile });

  if (isLoading || profile.isLoading) return <LoadingBlock />;
  if (!session) return null;
  if (profile.isError || !profile.data) {
    return <QueryError label="your account" onRetry={profile.refetch} />;
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: "My Account" }]} />

      <h1 className="font-serif text-2xl font-semibold text-foreground">My Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your details and password.</p>

      <div className="mt-6 grid max-w-3xl gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border-subtle p-5">
          <dl className="divide-y divide-border-subtle">
            <div className={rowClasses}>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-foreground">{session.email}</dd>
            </div>
            <div className={rowClasses}>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="text-foreground">{session.role}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <ProfileForm profile={profile.data} />
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle p-5">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
