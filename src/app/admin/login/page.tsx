"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { SITE } from "@/lib/constants";
import { login, verifyOtp, resendOtp } from "@/lib/api/auth";
import { ApiError, describeApiError } from "@/lib/api/client";
import { SESSION_QUERY_KEY } from "@/lib/use-session";
import { Button } from "@/components/ui/Button";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

const inputClasses =
  "w-full rounded-lg border border-input-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50";

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
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-2xl border border-input-border bg-background p-8">
        <p className="font-serif text-xl font-semibold text-primary">{SITE.name}</p>
        <h1 className="mt-1 text-lg font-semibold text-foreground">Admin Sign In</h1>

        {step === "credentials" ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Staff and owner access to manage products and orders.
            </p>
            <form onSubmit={handleCredentialsSubmit} className="mt-6 flex flex-col gap-4">
              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
              )}
              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                Email
                <input
                  type="email"
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="owner@delightsboutique.com"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                Password
                <div className="relative">
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
              <Button type="submit" className="mt-2" disabled={submitting}>
                {submitting ? "Signing In…" : "Sign In"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the 6-digit code we emailed to {email}.
            </p>
            <form onSubmit={handleOtpSubmit} className="mt-6 flex flex-col gap-4">
              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
              )}
              {resent && (
                <p className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-800">
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
                  disabled={submitting}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setResent(false);
                  }}
                  className={inputClasses}
                  placeholder="123456"
                />
              </label>
              <Button type="submit" className="mt-2" disabled={submitting}>
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
    </div>
  );
}
