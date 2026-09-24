"use client";

import { useState } from "react";
import { getAllCustomers, type CustomerSummary } from "@/lib/customers";
import { formatPrice } from "@/lib/format";
import { CustomerPreview } from "@/components/admin/CustomerPreview";
import { Breadcrumb } from "@/components/admin/Breadcrumb";

const ALL = "all";
const WHOLESALE = "wholesale";
const RETAIL = "retail";

function CustomersTable({
  customers,
  selectedPhone,
  onSelect,
}: {
  customers: CustomerSummary[];
  selectedPhone: string | null;
  onSelect: (phone: string) => void;
}) {
  if (customers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-muted-foreground">
        No customers here yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border-subtle bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Orders</th>
            <th className="px-4 py-3">Total Spent</th>
            <th className="px-4 py-3">Last Order</th>
            <th className="px-4 py-3">Wholesale</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.phone}
              onClick={() => onSelect(customer.phone)}
              className={`cursor-pointer border-b border-border-subtle last:border-0 hover:bg-muted/60 ${
                selectedPhone === customer.phone ? "bg-muted" : ""
              }`}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <p className="text-foreground">{customer.name}</p>
                <a
                  href={`tel:${customer.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  {customer.phone}
                </a>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{customer.orderCount}</td>
              <td className="px-4 py-3 whitespace-nowrap">{formatPrice(customer.totalSpent)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {new Date(customer.lastOrderAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {customer.wholesale ? (
                  <span className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-primary">
                    Wholesale
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>(() => getAllCustomers());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>(ALL);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  function refresh() {
    setCustomers(getAllCustomers());
  }

  function selectFilter(value: string) {
    setFilter(value);
    setSelectedPhone(null);
  }

  const wholesaleCount = customers.filter((c) => c.wholesale).length;

  const query = search.trim().toLowerCase();
  const inFilter =
    filter === WHOLESALE
      ? customers.filter((c) => c.wholesale)
      : filter === RETAIL
        ? customers.filter((c) => !c.wholesale)
        : customers;
  const visible = query
    ? inFilter.filter(
        (c) => c.name.toLowerCase().includes(query) || c.phone.includes(query.replace(/\D/g, "")),
      )
    : inFilter;

  const selectedCustomer = visible.find((c) => c.phone === selectedPhone) ?? null;

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: "Customers" }]} />

      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Derived from order history — {customers.length} customers so far.
        </p>
      </div>

      {customers.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border-subtle py-20 text-center text-sm text-muted-foreground">
          No customers yet — they&apos;ll appear here as soon as a customer checks out.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[180px_1fr_340px]">
          <aside className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => selectFilter(ALL)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                filter === ALL ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              All Customers
              <span className={filter === ALL ? "text-white/80" : "text-muted-foreground"}>
                {customers.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => selectFilter(WHOLESALE)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                filter === WHOLESALE ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              Wholesale
              <span className={filter === WHOLESALE ? "text-white/80" : "text-muted-foreground"}>
                {wholesaleCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => selectFilter(RETAIL)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                filter === RETAIL ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              Retail
              <span className={filter === RETAIL ? "text-white/80" : "text-muted-foreground"}>
                {customers.length - wholesaleCount}
              </span>
            </button>
          </aside>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                {filter === ALL ? "All Customers" : filter === WHOLESALE ? "Wholesale" : "Retail"}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {visible.length}
                </span>
              </h2>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedPhone(null);
                }}
                placeholder="Search by name or phone..."
                className="w-full max-w-xs rounded-lg border border-border-subtle bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="mt-3">
              <CustomersTable
                customers={visible}
                selectedPhone={selectedPhone}
                onSelect={setSelectedPhone}
              />
            </div>
          </div>

          <CustomerPreview customer={selectedCustomer} onUpdate={refresh} />
        </div>
      )}
    </div>
  );
}
