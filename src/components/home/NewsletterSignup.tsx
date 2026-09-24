"use client";

import { useState, type FormEvent } from "react";
import { MailIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";

// Client-only for now — wire the submit handler to a real subscribe
// endpoint once the backend exists.
export function NewsletterSignup() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-2xl bg-primary/10 px-6 py-10 text-center">
        <MailIcon className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 font-serif text-2xl font-semibold text-foreground">
          Join Our Newsletter
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Be the first to hear about new arrivals, restocks, and offers. Unsubscribe any time.
        </p>

        {submitted ? (
          <p className="mt-6 text-sm font-medium text-primary">
            Thanks for subscribing — watch your inbox!
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="Email address"
              className="w-full rounded-full border border-border-subtle bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        )}
      </div>
    </section>
  );
}
