import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { CountdownTimer } from "./CountdownTimer";

function unitValue(label: string) {
  return screen.getByText(label).previousElementSibling?.textContent;
}

describe("CountdownTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-05T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down once a second", () => {
    render(<CountdownTimer endsAt={Date.parse("2026-10-05T10:01:01Z")} />);
    expect(unitValue("Mins")).toBe("01");
    expect(unitValue("Sec")).toBe("01");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(unitValue("Sec")).toBe("00");
    expect(unitValue("Mins")).toBe("01");
  });

  it("shows zeros once the end time has passed", () => {
    render(<CountdownTimer endsAt={Date.parse("2026-10-05T09:00:00Z")} />);
    expect(unitValue("Days")).toBe("00");
    expect(unitValue("Hours")).toBe("00");
    expect(unitValue("Mins")).toBe("00");
    expect(unitValue("Sec")).toBe("00");
  });
});
