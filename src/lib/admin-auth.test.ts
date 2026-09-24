import { beforeEach, describe, expect, it } from "vitest";
import {
  adminSignIn,
  adminSignOut,
  canAccess,
  getRequiredPermission,
  hasPermission,
  isOwner,
} from "@/lib/admin-auth";

// These identify seed staff from lib/data/staff.ts — update this test if
// that seed data ever changes shape.
const STAFF_WITH_ORDERS_AND_CUSTOMERS = "ama@delightsboutique.com";
const STAFF_WITH_PRODUCTS_ONLY = "kwabena@delightsboutique.com";
const DEACTIVATED_STAFF = "yaw@delightsboutique.com";
const NON_STAFF_EMAIL = "owner@delightsboutique.com";

beforeEach(() => {
  localStorage.clear();
});

describe("adminSignIn", () => {
  it("signs in an unrecognized email as the Owner with full access", () => {
    const result = adminSignIn(NON_STAFF_EMAIL);
    expect(result.ok).toBe(true);
    expect(isOwner()).toBe(true);
  });

  it("signs in a matching staff email as that staff member, not the Owner", () => {
    const result = adminSignIn(STAFF_WITH_ORDERS_AND_CUSTOMERS);
    expect(result.ok).toBe(true);
    expect(isOwner()).toBe(false);
  });

  it("refuses to sign in a deactivated staff member", () => {
    const result = adminSignIn(DEACTIVATED_STAFF);
    expect(result.ok).toBe(false);
  });

  it("email matching is case-insensitive", () => {
    const result = adminSignIn(STAFF_WITH_ORDERS_AND_CUSTOMERS.toUpperCase());
    expect(result.ok).toBe(true);
    expect(isOwner()).toBe(false);
  });
});

describe("hasPermission", () => {
  it("grants the Owner every permission", () => {
    adminSignIn(NON_STAFF_EMAIL);
    expect(hasPermission("Manage Products")).toBe(true);
    expect(hasPermission("Manage Orders")).toBe(true);
    expect(hasPermission("Manage Customers")).toBe(true);
    expect(hasPermission("Manage Content")).toBe(true);
  });

  it("grants a staff member only their assigned permissions", () => {
    adminSignIn(STAFF_WITH_PRODUCTS_ONLY);
    expect(hasPermission("Manage Products")).toBe(true);
    expect(hasPermission("Manage Orders")).toBe(false);
    expect(hasPermission("Manage Content")).toBe(false);
  });

  it("denies every permission when nobody is signed in", () => {
    adminSignOut();
    expect(hasPermission("Manage Products")).toBe(false);
  });
});

describe("getRequiredPermission", () => {
  it("maps each admin section to its permission", () => {
    expect(getRequiredPermission("/admin/products")).toBe("Manage Products");
    expect(getRequiredPermission("/admin/categories/new")).toBe("Manage Products");
    expect(getRequiredPermission("/admin/orders")).toBe("Manage Orders");
    expect(getRequiredPermission("/admin/notifications")).toBe("Manage Orders");
    expect(getRequiredPermission("/admin/customers")).toBe("Manage Customers");
    expect(getRequiredPermission("/admin/content")).toBe("Manage Content");
  });

  it("marks Staff & Permissions as owner-only", () => {
    expect(getRequiredPermission("/admin/staff")).toBe("owner");
  });

  it("returns null for a section with no permission requirement", () => {
    expect(getRequiredPermission("/admin/account")).toBeNull();
    expect(getRequiredPermission("/admin/dashboard")).toBeNull();
  });
});

describe("canAccess", () => {
  it("lets the Owner into every section, including Staff & Permissions", () => {
    adminSignIn(NON_STAFF_EMAIL);
    expect(canAccess("/admin/staff")).toBe(true);
    expect(canAccess("/admin/products")).toBe(true);
  });

  it("blocks a staff member from Staff & Permissions regardless of their other permissions", () => {
    // This staff member has every other permission but is still not the Owner.
    adminSignIn("nana@delightsboutique.com");
    expect(canAccess("/admin/staff")).toBe(false);
    expect(canAccess("/admin/products")).toBe(true);
  });

  it("blocks a staff member from a section they don't have permission for", () => {
    adminSignIn(STAFF_WITH_PRODUCTS_ONLY);
    expect(canAccess("/admin/orders")).toBe(false);
  });

  it("always allows a section with no permission requirement", () => {
    adminSignOut();
    expect(canAccess("/admin/account")).toBe(true);
  });
});
