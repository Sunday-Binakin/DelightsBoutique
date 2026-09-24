import type { StaffMember } from "@/lib/staff";

// Sample staff accounts so the Staff & Permissions admin UI can be explored
// (varied permissions, an active/deactivated mix, login-as-staff) before any
// real staff are added. Falls away the moment a real one is created — see
// staff.ts's readAll().
export const seedStaff: StaffMember[] = [
  {
    id: "staff-seed1",
    name: "Ama Owusu",
    email: "ama@delightsboutique.com",
    phone: "024 555 0101",
    permissions: ["Manage Orders", "Manage Customers"],
    active: true,
    createdAt: "2026-07-10T09:00:00.000Z",
    password: "ama-pass1",
  },
  {
    id: "staff-seed2",
    name: "Kwabena Asante",
    email: "kwabena@delightsboutique.com",
    phone: "024 555 0102",
    permissions: ["Manage Products"],
    active: true,
    createdAt: "2026-07-18T09:00:00.000Z",
    password: "kwabena-pass2",
  },
  {
    id: "staff-seed3",
    name: "Efua Darko",
    email: "efua@delightsboutique.com",
    phone: "024 555 0103",
    permissions: ["Manage Content"],
    active: true,
    createdAt: "2026-08-02T09:00:00.000Z",
    password: "efua-pass3",
  },
  {
    id: "staff-seed4",
    name: "Nana Adjei",
    email: "nana@delightsboutique.com",
    phone: "024 555 0104",
    permissions: ["Manage Products", "Manage Orders", "Manage Customers", "Manage Content"],
    active: true,
    createdAt: "2026-08-15T09:00:00.000Z",
    password: "nana-pass4",
  },
  {
    id: "staff-seed5",
    name: "Yaw Boateng",
    email: "yaw@delightsboutique.com",
    phone: "024 555 0105",
    permissions: ["Manage Orders"],
    active: false,
    createdAt: "2026-06-20T09:00:00.000Z",
    password: "yaw-pass5",
  },
];
