import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { confirmDiscardUnsaved, useMarkUnsaved } from "./unsaved-changes";

function DirtyForm({ dirty }: { dirty: boolean }) {
  useMarkUnsaved(dirty);
  return null;
}

describe("unsaved changes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows leaving without asking when nothing is dirty", () => {
    const confirm = vi.spyOn(window, "confirm");
    expect(confirmDiscardUnsaved()).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("asks before discarding a dirty form and honours the answer", () => {
    render(<DirtyForm dirty />);

    vi.spyOn(window, "confirm").mockReturnValueOnce(false);
    expect(confirmDiscardUnsaved()).toBe(false);

    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    expect(confirmDiscardUnsaved()).toBe(true);
  });

  it("stops guarding once the dirty form unmounts", () => {
    const { unmount } = render(<DirtyForm dirty />);
    unmount();

    const confirm = vi.spyOn(window, "confirm");
    expect(confirmDiscardUnsaved()).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("stops guarding when the form becomes clean", () => {
    const { rerender } = render(<DirtyForm dirty />);
    rerender(<DirtyForm dirty={false} />);

    const confirm = vi.spyOn(window, "confirm");
    expect(confirmDiscardUnsaved()).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });
});
