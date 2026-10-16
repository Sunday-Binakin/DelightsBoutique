"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { SITE } from "@/lib/constants";
import { login, verifyOtp, resendOtp } from "@/lib/api/auth";
import { ApiError, describeApiError } from "@/lib/api/client";
import { SESSION_QUERY_KEY } from "@/lib/use-session";
import { Button } from "@/components/ui/Button";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, ShieldCheckIcon } from "@/components/ui/icons";

const inputClasses =
  "w-full rounded-xl border border-input-border bg-background px-3.5 py-2.5 pl-10 text-sm outline-none transition-colors focus:border-primary disabled:opacity-50";

export default function AdminLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [loginToken, setLoginToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleCredentialsSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { loginToken: token } = await login(email, password);
      setLoginToken(token);
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiError && err.code === "STAFF_DEACTIVATED") {
        setError("This staff account has been deactivated. Contact the owner.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError(describeApiError(err, "Something went wrong. Please try again."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const session = await verifyOtp(loginToken, code);
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
      router.push("/admin/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("That code is incorrect or has expired.");
      } else {
        setError(describeApiError(err, "Couldn't verify the code. Please try again."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setResent(false);
    try {
      await resendOtp(loginToken);
      setResent(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(describeApiError(err, ""));
      } else {
        setError("Couldn't resend the code — try signing in again.");
        setStep("credentials");
      }
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 to-accent/25 blur-3xl sm:h-[28rem] sm:w-[28rem]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-accent/20 to-primary/20 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" aria-label={SITE.name} className="inline-flex">
            <Image src="/logo-gradient.png" alt={SITE.name} width={392} height={340} priority className="h-14 w-auto" />
          </Link>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Admin Portal</p>
        </div>

        <div className="rounded-3xl border border-border-subtle bg-background p-8 shadow-xl shadow-foreground/5">
          {step === "credentials" ? (
            <>
              <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Staff and owner access to manage products and orders.
              </p>
              <form onSubmit={handleCredentialsSubmit} className="mt-6 flex flex-col gap-4">
                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
                )}
                <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                  Email
                  <div className="relative">
                    <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      disabled={submitting}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClasses}
                      placeholder="owner@delightsboutique.com"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                  Password
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={submitting}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClasses} pr-10`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </label>
                <Button type="submit" className="mt-2 w-full" disabled={submitting}>
                  {submitting ? "Signing In…" : "Sign In"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheckIcon className="h-5 w-5" />
                </span>
                <h1 className="text-xl font-semibold text-foreground">Check your email</h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the 6-digit code we emailed to <span className="font-medium text-foreground">{email}</span>.
              </p>
              <form onSubmit={handleOtpSubmit} className="mt-6 flex flex-col gap-4">
                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
                )}
                {resent && (
                  <p className="rounded-xl bg-green-50 px-3.5 py-2.5 text-sm text-green-800">
                    A new code is on its way.
                  </p>
                )}
                <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                  Verification Code
                  <input
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    disabled={submitting}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ""));
                      setResent(false);
                    }}
                    className="w-full rounded-xl border border-input-border bg-background px-3.5 py-3 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition-colors focus:border-primary disabled:opacity-50"
                    placeholder="······"
                  />
                </label>
                <Button type="submit" className="mt-2 w-full" disabled={submitting}>
                  {submitting ? "Verifying…" : "Verify & Sign In"}
                </Button>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-center text-sm font-medium text-primary hover:underline"
                >
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setCode("");
                    setError("");
                  }}
                  className="text-center text-sm text-muted-foreground hover:underline"
                >
                  Back to sign in
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            ← Back to {SITE.name}
          </Link>
        </p>
      </div>
    </div>
  );
}
