import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  outline: "border border-current bg-transparent hover:bg-foreground/5",
  ghost: "bg-transparent hover:bg-foreground/5",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition-colors";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}

interface LinkButtonProps extends ComponentPropsWithoutRef<typeof Link> {
  variant?: Variant;
}

export function LinkButton({ variant = "primary", className = "", ...props }: LinkButtonProps) {
  return (
    <Link
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
