import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDialog } from "./use-dialog";

function DialogHarness({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useDialog<HTMLDivElement>(open, () => {
    onClose();
    setOpen(false);
  });

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      {open && (
        <div ref={ref} role="dialog" aria-label="Test dialog">
          <button type="button">First</button>
          <button type="button">Second</button>
        </div>
      )}
    </>
  );
}

describe("useDialog", () => {
  it("moves focus into the dialog when it opens", async () => {
    render(<DialogHarness onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const onClose = vi.fn();
    render(<DialogHarness onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
  });

  it("keeps Tab inside the dialog", async () => {
    render(<DialogHarness onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  });
});
