export const STAFF_PERMISSIONS = [
  "manageProducts",
  "manageOrders",
  "manageCustomers",
  "manageContent",
  "viewReports",
  "manageStaff",
  "viewAuditLog",
] as const;

export type StaffPermission = (typeof STAFF_PERMISSIONS)[number];

/** Human-readable labels for the camelCase permission values the backend uses — render these, never the raw value. */
export const STAFF_PERMISSION_LABELS: Record<StaffPermission, string> = {
  manageProducts: "Manage Products",
  manageOrders: "Manage Orders",
  manageCustomers: "Manage Customers",
  manageContent: "Manage Content",
  viewReports: "View Reports",
  manageStaff: "Manage Staff",
  viewAuditLog: "View Audit Log",
};

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  permissions: StaffPermission[];
  active: boolean;
  createdAt: string;
}
