// DTO shapes mirroring the backend contract verbatim. Enums are the camelCase strings the
// backend returns; request bodies also accept PascalCase but we always send camelCase.

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface Unpaginated<T> {
  data: T[];
}

export type Tone = "rose" | "cream" | "charcoal" | "gold";
export type Badge = "new" | "bestSeller" | null;
export type StockStatus = "inStock" | "lowStock" | "outOfStock";

export interface ProductDto {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  category: string;
  description: string;
  retailPrice: number;
  wholesalePrice: number | null;
  wholesaleMoq: number | null;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  tone: Tone;
  badge: Badge;
  stockStatus: StockStatus;
  sizes: string[];
  colors: string[];
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductBody {
  slug?: string | null;
  name: string;
  categorySlug: string;
  description: string;
  retailPrice: number;
  wholesalePrice: number | null;
  wholesaleMoq: number | null;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  tone: Tone;
  badge: Badge;
  stockStatus: StockStatus;
  sizes: string[];
  colors: string[];
  imageUrls: string[];
}

export type UpdateProductBody = Partial<CreateProductBody>;

export interface BulkUploadRowResult {
  rowNumber: number;
  success: boolean;
  slug: string | null;
  error: string | null;
}

export interface BulkUploadResult {
  rows: BulkUploadRowResult[];
  successCount: number;
  errorCount: number;
}

export interface CategoryDto {
  id: string;
  slug: string;
  name: string;
  tone: Tone;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryBody {
  slug?: string | null;
  name: string;
  tone: Tone;
  imageUrl?: string | null;
}

export type UpdateCategoryBody = Partial<Omit<CreateCategoryBody, "slug">>;

export interface BannerDto {
  eyebrow: string;
  title: string;
  ctaLabel: string;
  href: string;
  tone: Tone;
  artCategorySlug: string;
  imageUrl: string | null;
  textColor: string | null;
}

export type BannerKey = "heroMain" | "heroSide1" | "heroSide2" | "fullWidth";

export interface BannersDto {
  heroMain: BannerDto;
  heroSide1: BannerDto;
  heroSide2: BannerDto;
  fullWidth: BannerDto;
}

export interface FlashSaleDto {
  eyebrow: string;
  title: string;
  endsAt: string;
  products: ProductDto[];
  /** False means `products` is auto-filled, not picked by an admin. */
  isCurated: boolean;
}

export interface UpdateFlashSaleBody {
  eyebrow?: string;
  title?: string;
  endsAt?: string;
  productSlugs?: string[];
}

export interface CollectionSectionDto {
  eyebrow: string;
  title: string;
  newArrivalsLabel: string;
  bestSellersLabel: string;
  wholesalePicksLabel: string;
  newArrivals: ProductDto[];
  bestSellers: ProductDto[];
  wholesalePicks: ProductDto[];
  newArrivalsCurated: boolean;
  bestSellersCurated: boolean;
  wholesalePicksCurated: boolean;
}

export interface UpdateCollectionSectionBody {
  eyebrow?: string;
  title?: string;
  newArrivalsLabel?: string;
  bestSellersLabel?: string;
  wholesalePicksLabel?: string;
  newArrivalsSlugs?: string[];
  bestSellersSlugs?: string[];
  wholesalePicksSlugs?: string[];
}

export interface PageContentDto {
  title: string;
  body: string;
}

export type PageKey = "about" | "shipping" | "returns" | "terms" | "privacy";

export interface FaqDto {
  id: string;
  question: string;
  answer: string;
}

export interface CreateFaqBody {
  question: string;
  answer: string;
}

export type UpdateFaqBody = Partial<CreateFaqBody>;

// Public subset only — notifyByEmail/notificationEmail/notifyByWhatsapp are admin-only,
// added on top of this same shape by the admin PATCH body below.
export interface SiteSettingsDto {
  tagline: string;
  whatsappNumber: string;
  whatsappMessage: string;
  phoneDisplay: string;
  address: string;
  hours: string;
  announcement: string;
  bankTransferInstructions: string;
  mobileMoneyInstructions: string;
  cashInstructions: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}

export interface AdminSiteSettingsBody extends Partial<SiteSettingsDto> {
  notifyByEmail?: boolean;
  notificationEmail?: string;
  notifyByWhatsapp?: boolean;
}

// Opaque — shape owned by src/lib/storefront-copy.ts, backend stores/returns it verbatim.
export type StorefrontCopyDto = Record<string, unknown>;

// --- Auth -------------------------------------------------------------

export type Role = "Owner" | "Staff";

export interface LoginResponse {
  loginToken: string;
}

export interface SessionDto {
  role: Role;
  staffId: string | null;
  email: string;
  name: string;
  permissions: StaffPermission[];
}

// --- Orders -------------------------------------------------------------

export type Fulfillment = "delivery" | "pickup";
export type PaymentMethod = "bankTransfer" | "mobileMoney" | "cashOnDeliveryOrPickup";
export type OrderStatus =
  | "pendingConfirmation"
  | "confirmed"
  | "processing"
  | "outForDelivery"
  | "readyForPickup"
  | "completed"
  | "cancelled";

export interface CheckoutItem {
  slug: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

export interface CheckoutBody {
  items: CheckoutItem[];
  customerName: string;
  phone: string;
  fulfillment: Fulfillment;
  address?: string | null;
  paymentMethod: PaymentMethod;
  notes?: string | null;
}

export interface OrderLineDto {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  size?: string | null;
  color?: string | null;
}

export interface OrderDto {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderLineDto[];
  subtotal: number;
  customerName: string;
  phone: string;
  fulfillment: Fulfillment;
  address: string | null;
  paymentMethod: PaymentMethod;
  paymentProofUrl: string | null;
  notes: string | null;
}

export interface AdminOrderDto extends OrderDto {
  internalNotes: string | null;
}

export interface UpdateOrderBody {
  status?: OrderStatus;
  internalNotes?: string;
}

// --- Customers -------------------------------------------------------------

export interface CustomerDto {
  phone: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  wholesale: boolean;
}

// --- Staff -------------------------------------------------------------

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

export interface StaffDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  permissions: StaffPermission[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffBody {
  name: string;
  email: string;
  phone?: string | null;
  permissions: StaffPermission[];
}

export interface CreateStaffResponse {
  member: StaffDto;
  password: string;
}

export interface UpdateStaffBody {
  name?: string;
  email?: string;
  phone?: string | null;
  permissions?: StaffPermission[];
  active?: boolean;
}

export interface ResetPasswordResponse {
  password: string;
}

// --- Notifications -------------------------------------------------------------

export interface OrderNotificationDto {
  id: string;
  orderId: string;
  customerName: string;
  subtotal: number;
  createdAt: string;
  read: boolean;
}

// --- Audit log -------------------------------------------------------------

export interface AuditEntryDto {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
}

// --- Reports -------------------------------------------------------------

export interface ReportsDto {
  summary: {
    totalOrders: number;
    cancelledOrders: number;
    confirmedRevenue: number;
    pendingAmount: number;
    cancelledAmount: number;
  };
  topProducts: {
    slug: string;
    name: string;
    category: string | null;
    unitsSold: number;
    revenue: number;
  }[];
  statusBreakdown: { status: OrderStatus; count: number; revenue: number }[];
  paymentBreakdown: { paymentMethod: PaymentMethod; count: number; revenue: number }[];
  dailySeries: { date: string; orderCount: number; revenue: number }[];
}
