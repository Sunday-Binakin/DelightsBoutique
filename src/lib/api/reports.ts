import { apiFetch } from "./client";
import type { ReportsDto } from "./types";
import type { FulfillmentMethod, PaymentMethod } from "@/lib/orders";

export interface ReportsParams {
  from?: string;
  to?: string;
  fulfillment?: FulfillmentMethod;
  paymentMethod?: PaymentMethod;
  categorySlug?: string;
}

export function getReports(params: ReportsParams = {}): Promise<ReportsDto> {
  return apiFetch<ReportsDto>("/api/admin/reports", { query: { ...params } });
}
