"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMarkUnsaved } from "@/lib/unsaved-changes";
import { useThemeQuery } from "@/lib/use-theme";
import { useUpdateTheme } from "@/lib/use-admin-content";
import { applyThemeToDocument, checkThemeContrast, DEFAULT_THEME, type ThemeColors } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { ThemePreview } from "@/components/admin/content/ThemePreview";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";
import { useToast } from "@/components/ui/ToastProvider";

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

export function ThemeForm() {
  const { theme: initialTheme, isLoading, isError, refetch } = useThemeQuery();
  if (isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="theme colors" onRetry={refetch} />;
  return <ThemeFormInner initialTheme={initialTheme} />;
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <label className={labelClasses}>
      {label}
      <div className="flex items-center gap-2.5">
        <input
          type="color"
          value={value}
          onChange={(e) => {
            setDraft(e.target.value);
            onChange(e.target.value);
          }}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-input-border bg-background p-1"
          aria-label={`${label} color picker`}
        />
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (HEX_PATTERN.test(e.target.value)) onChange(e.target.value);
          }}
          onBlur={() => setDraft(value)}
          placeholder="#0550c2"
          className="w-full rounded-lg border border-input-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>
    </label>
  );
}

function ThemeFormInner({ initialTheme }: { initialTheme: ThemeColors }) {
  const [theme, setTheme] = useState(initialTheme);
  const [saved, setSaved] = useState(true);
  useMarkUnsaved(!saved);
  const updateTheme = useUpdateTheme();
  const toast = useToast();

  function update<K extends keyof ThemeColors>(key: K, value: ThemeColors[K]) {
    setTheme((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await updateTheme.mutateAsync(theme);
      applyThemeToDocument(theme);
      setSaved(true);
      toast.success("Theme colors saved.");
    } catch {
      toast.error("Couldn't save theme colors. Try again.");
    }
  }

  function handleReset() {
    setTheme(DEFAULT_THEME);
    setSaved(false);
  }

  const warnings = checkThemeContrast(theme);

  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Pick your two brand colors — every button, link, and hover state across the
          storefront and admin panel derives from these two.
        </p>

        <ColorPicker label="Primary" value={theme.primary} onChange={(v) => update("primary", v)} />
        <ColorPicker label="Accent" value={theme.accent} onChange={(v) => update("accent", v)} />

        {warnings.length > 0 && (
          <div className="rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
            <ul className="list-disc space-y-1 pl-4">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saved || updateTheme.isPending}>
            {updateTheme.isPending ? "Saving…" : saved ? "Saved" : "Save Theme"}
          </Button>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Reset to default
          </button>
        </div>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Live Preview
        </p>
        <ThemePreview theme={theme} />
      </div>
    </div>
  );
}
