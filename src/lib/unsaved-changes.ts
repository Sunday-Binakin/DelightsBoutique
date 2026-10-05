"use client";

import { useEffect, useId, useState } from "react";

const dirtyIds = new Set<string>();

const LEAVE_MESSAGE = "You have unsaved changes. Leave this page and discard them?";

export function useMarkUnsaved(isDirty: boolean) {
  const id = useId();

  useEffect(() => {
    if (!isDirty) return;
    dirtyIds.add(id);
    return () => {
      dirtyIds.delete(id);
    };
  }, [id, isDirty]);
}

export function hasUnsavedChanges() {
  return dirtyIds.size > 0;
}

export function confirmDiscardUnsaved() {
  return !hasUnsavedChanges() || window.confirm(LEAVE_MESSAGE);
}

export function useIsDirty(current: unknown) {
  const [initial] = useState(() => JSON.stringify(current));
  return JSON.stringify(current) !== initial;
}

export function useUnsavedChangesGuard() {
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyIds.size === 0) return;
      e.preventDefault();
      e.returnValue = "";
    }

    function onClickCapture(e: MouseEvent) {
      if (dirtyIds.size === 0) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const next = new URL(anchor.href);
      const here = new URL(window.location.href);
      if (next.origin !== here.origin) return;
      if (next.pathname === here.pathname && next.search === here.search) return;

      if (!window.confirm(LEAVE_MESSAGE)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, []);
}
