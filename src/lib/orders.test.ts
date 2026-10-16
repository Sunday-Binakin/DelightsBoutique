import { beforeEach, describe, expect, it } from "vitest";
import { getStatusOptions, normalizePhone } from "@/lib/orders";

beforeEach(() => {
  localStorage.clear();
});

describe("normalizePhone", () => {
  it("strips formatting from a local number", () => {
    expect(normalizePhone("024 111 2233")).toBe("0241112233");
  });

  it("converts an international +233 number to local 0-prefixed form", () => {
    expect(normalizePhone("+233 24 111 2233")).toBe("0241112233");
  });

  it("converts a 233-prefixed number with no plus sign the same way", () => {
    expect(normalizePhone("233241112233")).toBe("0241112233");
  });

  it("treats an already-local and an international form of the same number as equal", () => {
    expect(normalizePhone("024 111 2233")).toBe(normalizePhone("+233 24 111 2233"));
  });
});

describe("getStatusOptions", () => {
  it("includes 'Out for Delivery' but not 'Ready for Pickup' for a delivery order", () => {
    const options = getStatusOptions("delivery");
    expect(options).toContain("outForDelivery");
    expect(options).not.toContain("readyForPickup");
  });

  it("includes 'Ready for Pickup' but not 'Out for Delivery' for a pickup order", () => {
    const options = getStatusOptions("pickup");
    expect(options).toContain("readyForPickup");
    expect(options).not.toContain("outForDelivery");
  });

  it("always includes the terminal statuses regardless of fulfillment method", () => {
    for (const fulfillment of ["delivery", "pickup"] as const) {
      const options = getStatusOptions(fulfillment);
      expect(options).toContain("completed");
      expect(options).toContain("cancelled");
      expect(options).toContain("pendingConfirmation");
    }
  });
});
