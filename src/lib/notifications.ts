export interface OrderNotification {
  id: string;
  orderId: string;
  customerName: string;
  subtotal: number;
  createdAt: string;
  read: boolean;
}
