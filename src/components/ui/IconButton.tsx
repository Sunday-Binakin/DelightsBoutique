import type { ReactNode } from "react";

interface IconButtonProps {
  icon: ReactNode;
  label: string;
  badgeCount?: number;
}

export function IconButton({ icon, label, badgeCount }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5"
    >
      {icon}
      {!!badgeCount && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
          {badgeCount}
        </span>
      )}
    </button>
  );
}
