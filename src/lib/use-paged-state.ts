"use client";

import { useState } from "react";

/** Current page for a list, which snaps back to page 1 whenever `scope` (the filter
 * that defines the list) changes. Derived rather than reset in an effect, so there's
 * no render where a stale page is requested for a new filter. */
export function usePagedState(scope: string) {
  const [state, setState] = useState({ scope, page: 1 });
  const page = state.scope === scope ? state.page : 1;
  const setPage = (next: number) => setState({ scope, page: next });
  return [page, setPage] as const;
}
