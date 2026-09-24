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

/** Counts down to a fixed offset from when the component mounts. */
export function CountdownTimer({ durationHours = 72 }: { durationHours?: number }) {
  const [target] = useState(() => Date.now() + durationHours * 60 * 60 * 1000);
  const [remaining, setRemaining] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

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
