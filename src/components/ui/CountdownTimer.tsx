"use client";

import { useEffect, useState } from "react";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const UNITS: Array<{ key: keyof ReturnType<typeof getRemaining>; label: string }> = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Mins" },
  { key: "seconds", label: "Sec" },
];

/** Counts down to a fixed point in time. */
export function CountdownTimer({ endsAt }: { endsAt: number }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endsAt));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resync when endsAt changes (e.g. admin edits it live)
    setRemaining(getRemaining(endsAt));
    const id = setInterval(() => setRemaining(getRemaining(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <div className="flex gap-3">
      {UNITS.map(({ key, label }) => (
        <div
          key={key}
          className="flex min-w-14 flex-col items-center rounded-lg border border-border-subtle bg-background px-3 py-2"
        >
          <span className="font-serif text-lg font-semibold text-primary">
            {String(remaining[key]).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
