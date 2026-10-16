export interface CustomerSummary {
  /** Normalized phone number — the customer's identity, since there's no account system yet. */
  phone: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  wholesale: boolean;
}
