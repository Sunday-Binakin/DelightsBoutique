"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SITE } from "@/lib/constants";
import { adminSignIn } from "@/lib/admin-auth";
import { logAction } from "@/lib/audit-log";
import { Button } from "@/components/ui/Button";

const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend yet — passwords aren't verified. If the email matches a
    // staff record, the session takes on their identity/permissions;
    // otherwise it's treated as the Owner. See admin-auth.ts.
    const result = adminSignIn(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    logAction("Signed in");
    router.push("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-background p-8">
        <p className="font-serif text-xl font-semibold text-primary">{SITE.name}</p>
        <h1 className="mt-1 text-lg font-semibold text-foreground">Admin Sign In</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Staff and owner access to manage products and orders.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
          )}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="owner@delightsboutique.com"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              placeholder="••••••••"
            />
          </label>
          <Button type="submit" className="mt-2">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
