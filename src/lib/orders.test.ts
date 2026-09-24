import { beforeEach, describe, expect, it } from "vitest";
import { createOrder, getOrdersByPhone, getStatusOptions, normalizePhone } from "@/lib/orders";

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
    const options = getStatusOptions("Delivery");
    expect(options).toContain("Out for Delivery");
    expect(options).not.toContain("Ready for Pickup");
  });

  it("includes 'Ready for Pickup' but not 'Out for Delivery' for a pickup order", () => {
    const options = getStatusOptions("Pickup");
    expect(options).toContain("Ready for Pickup");
    expect(options).not.toContain("Out for Delivery");
  });

  it("always includes the terminal statuses regardless of fulfillment method", () => {
    for (const fulfillment of ["Delivery", "Pickup"] as const) {
      const options = getStatusOptions(fulfillment);
      expect(options).toContain("Completed");
      expect(options).toContain("Cancelled");
      expect(options).toContain("Pending Confirmation");
    }
  });
});

describe("createOrder + getOrdersByPhone", () => {
  it("finds a newly created order by the exact phone number used at checkout", () => {
    const order = createOrder({
      items: [{ slug: "test-product", name: "Test Product", quantity: 1, unitPrice: 100 }],
      subtotal: 100,
      customerName: "Test Customer",
      phone: "024 999 8877",
      fulfillment: "Pickup",
      paymentMethod: "Cash on Delivery/Pickup",
    });

    const found = getOrdersByPhone("024 999 8877");
    expect(found.map((o) => o.id)).toContain(order.id);
  });

  it("finds the same order looked up in the alternate (international) phone format", () => {
    createOrder({
      items: [{ slug: "test-product", name: "Test Product", quantity: 1, unitPrice: 100 }],
      subtotal: 100,
      customerName: "Test Customer",
      phone: "024 999 8877",
      fulfillment: "Pickup",
      paymentMethod: "Cash on Delivery/Pickup",
    });

    const found = getOrdersByPhone("+233 24 999 8877");
    expect(found).toHaveLength(1);
    expect(found[0].customerName).toBe("Test Customer");
  });

  it("returns an empty array for a phone number with no orders", () => {
    expect(getOrdersByPhone("020 000 0000")).toEqual([]);
  });

  it("sets a new order's status to Pending Confirmation", () => {
    const order = createOrder({
      items: [{ slug: "test-product", name: "Test Product", quantity: 1, unitPrice: 50 }],
      subtotal: 50,
      customerName: "Another Customer",
      phone: "055 111 2222",
      fulfillment: "Delivery",
      address: "Test Street",
      paymentMethod: "Mobile Money",
    });

    expect(order.status).toBe("Pending Confirmation");
  });
});
