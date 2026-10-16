import { describe, expect, it } from "vitest";
import { canAccess, getRequiredPermission, hasPermission, isOwner } from "@/lib/admin-auth";
import type { SessionDto } from "@/lib/api/types";

const OWNER: SessionDto = {
  role: "Owner",
  staffId: null,
  email: "owner@delightsboutique.com",
  name: "Owner",
  permissions: [],
};

const STAFF_WITH_PRODUCTS_ONLY: SessionDto = {
  role: "Staff",
  staffId: "staff-1",
  email: "kwabena@delightsboutique.com",
  name: "Kwabena Asante",
  permissions: ["manageProducts"],
};

const STAFF_WITH_MANAGE_STAFF: SessionDto = {
  role: "Staff",
  staffId: "staff-2",
  email: "nana@delightsboutique.com",
  name: "Nana Adjei",
  permissions: ["manageProducts", "manageOrders", "manageCustomers", "manageContent", "manageStaff"],
};

describe("isOwner", () => {
  it("is true only for an Owner session", () => {
    expect(isOwner(OWNER)).toBe(true);
    expect(isOwner(STAFF_WITH_PRODUCTS_ONLY)).toBe(false);
    expect(isOwner(null)).toBe(false);
  });
});

describe("hasPermission", () => {
  it("grants the Owner every permission", () => {
    expect(hasPermission(OWNER, "manageProducts")).toBe(true);
    expect(hasPermission(OWNER, "manageStaff")).toBe(true);
  });

  it("grants a staff member only their assigned permissions", () => {
    expect(hasPermission(STAFF_WITH_PRODUCTS_ONLY, "manageProducts")).toBe(true);
    expect(hasPermission(STAFF_WITH_PRODUCTS_ONLY, "manageOrders")).toBe(false);
  });

  it("denies every permission when nobody is signed in", () => {
    expect(hasPermission(null, "manageProducts")).toBe(false);
  });
});

describe("getRequiredPermission", () => {
  it("maps each admin section to its permission", () => {
    expect(getRequiredPermission("/admin/products")).toBe("manageProducts");
    expect(getRequiredPermission("/admin/categories/new")).toBe("manageProducts");
    expect(getRequiredPermission("/admin/orders")).toBe("manageOrders");
    expect(getRequiredPermission("/admin/notifications")).toBe("manageOrders");
    expect(getRequiredPermission("/admin/customers")).toBe("manageCustomers");
    expect(getRequiredPermission("/admin/content")).toBe("manageContent");
    expect(getRequiredPermission("/admin/reports")).toBe("viewReports");
  });

  it("gates Staff & Permissions behind the manageStaff permission", () => {
    expect(getRequiredPermission("/admin/staff")).toBe("manageStaff");
  });

  it("returns null for a section with no permission requirement", () => {
    expect(getRequiredPermission("/admin/account")).toBeNull();
    expect(getRequiredPermission("/admin/dashboard")).toBeNull();
  });
});

describe("canAccess", () => {
  it("lets the Owner into every section, including Staff & Permissions", () => {
    expect(canAccess(OWNER, "/admin/staff")).toBe(true);
    expect(canAccess(OWNER, "/admin/products")).toBe(true);
  });

  it("blocks a staff member from Staff & Permissions when they lack manageStaff", () => {
    expect(canAccess(STAFF_WITH_PRODUCTS_ONLY, "/admin/staff")).toBe(false);
  });

  it("lets a staff member into Staff & Permissions when they have manageStaff", () => {
    expect(canAccess(STAFF_WITH_MANAGE_STAFF, "/admin/staff")).toBe(true);
  });

  it("lets an audit-only staff member see the staff page but not create staff", () => {
    const auditor: SessionDto = { ...STAFF_WITH_PRODUCTS_ONLY, permissions: ["viewAuditLog"] };
    expect(canAccess(auditor, "/admin/staff")).toBe(true);
    expect(canAccess(auditor, "/admin/staff/new")).toBe(false);
  });

  it("blocks a staff member from a section they don't have permission for", () => {
    expect(canAccess(STAFF_WITH_PRODUCTS_ONLY, "/admin/orders")).toBe(false);
  });

  it("always allows a section with no permission requirement", () => {
    expect(canAccess(null, "/admin/account")).toBe(true);
  });
});
